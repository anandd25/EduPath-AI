
import logging

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from auth import get_current_user
from database import get_db
from models import (
    StudentInterest,
    StudentPriority,
    StudentProfile,
    StudentStrength,
    StudentSubject,
)
from schemas import StudentProfileCreate, StudentProfileOut

router = APIRouter(prefix="/profiles", tags=["Student Profiles"])
logger = logging.getLogger(__name__)

PROFILE_RELATIONSHIPS = (
    selectinload(StudentProfile.subjects),
    selectinload(StudentProfile.interests),
    selectinload(StudentProfile.strengths),
    selectinload(StudentProfile.priorities),
)


def load_profile(
    db: Session,
    profile_id: int,
    owner_id: str,
) -> StudentProfile | None:
    statement = (
        select(StudentProfile)
        .where(
            StudentProfile.id == profile_id,
            StudentProfile.owner_id == owner_id,
        )
        .options(*PROFILE_RELATIONSHIPS)
    )
    return db.scalar(statement)


def build_profile(
    payload: StudentProfileCreate,
    owner_id: str,
) -> StudentProfile:
    data = payload.model_dump()

    budget = data.pop("annual_budget")
    funding = data.pop("funding_preferences")
    subjects = data.pop("subjects")
    interests = data.pop("interests")
    strengths = data.pop("strengths")
    priorities = data.pop("priorities")

    profile = StudentProfile(
        **data,
        owner_id=owner_id,
        budget_currency=budget["currency"],
        budget_amount=budget["amount"],
        budget_status=budget["budget_status"],
        interested_in_scholarships=funding["interested_in_scholarships"],
        willing_to_consider_loans=funding["willing_to_consider_loans"],
    )

    profile.subjects = [
        StudentSubject(**subject)
        for subject in subjects
    ]
    profile.interests = [
        StudentInterest(value=value)
        for value in interests
    ]
    profile.strengths = [
        StudentStrength(**strength)
        for strength in strengths
    ]
    profile.priorities = [
        StudentPriority(value=value)
        for value in priorities
    ]

    return profile


def not_found() -> HTTPException:
    # Do not disclose whether another user owns the requested profile.
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Student profile not found",
    )


def handle_database_error(
    db: Session,
    operation: str,
    profile_id: int | None = None,
) -> HTTPException:
    db.rollback()
    logger.exception(
        "Profile database operation failed: operation=%s profile_id=%s",
        operation,
        profile_id,
    )
    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Could not {operation} profile",
    )


@router.post(
    "",
    response_model=StudentProfileOut,
    status_code=status.HTTP_201_CREATED,
)
def create_profile(
    payload: StudentProfileCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    profile = build_profile(payload, user["id"])

    try:
        db.add(profile)
        db.commit()
        db.refresh(profile)
    except IntegrityError as exc:
        raise handle_database_error(db, "save") from exc
    except Exception as exc:
        raise handle_database_error(db, "save") from exc

    saved_profile = load_profile(db, profile.id, user["id"])
    if saved_profile is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Profile was saved but could not be reloaded",
        )

    return StudentProfileOut.from_profile(saved_profile)


@router.get(
    "",
    response_model=list[StudentProfileOut],
)
def list_profiles(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    safe_skip = max(skip, 0)
    safe_limit = max(1, min(limit, 100))

    statement = (
        select(StudentProfile)
        .where(StudentProfile.owner_id == user["id"])
        .options(*PROFILE_RELATIONSHIPS)
        .order_by(StudentProfile.created_at.desc(), StudentProfile.id.desc())
        .offset(safe_skip)
        .limit(safe_limit)
    )

    profiles = db.scalars(statement).all()
    return [
        StudentProfileOut.from_profile(profile)
        for profile in profiles
    ]


@router.get(
    "/{profile_id}",
    response_model=StudentProfileOut,
)
def get_profile(
    profile_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    profile = load_profile(db, profile_id, user["id"])
    if profile is None:
        raise not_found()

    return StudentProfileOut.from_profile(profile)


@router.put(
    "/{profile_id}",
    response_model=StudentProfileOut,
)
def replace_profile(
    profile_id: int,
    payload: StudentProfileCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    profile = load_profile(db, profile_id, user["id"])
    if profile is None:
        raise not_found()

    replacement = build_profile(payload, user["id"])

    scalar_fields = (
        "education_stage",
        "preferred_name",
        "country",
        "region",
        "curriculum",
        "academic_status",
        "preferred_language",
        "overall_percentage",
        "overall_result_status",
        "interest_description",
        "budget_currency",
        "budget_amount",
        "budget_status",
        "interested_in_scholarships",
        "willing_to_consider_loans",
        "preferred_destination",
        "career_certainty",
    )

    for field in scalar_fields:
        setattr(profile, field, getattr(replacement, field))

    # Replace child collections through SQLAlchemy relationships. The model
    # cascades delete-orphan, so removed items are removed from the database.
    profile.subjects = replacement.subjects
    profile.interests = replacement.interests
    profile.strengths = replacement.strengths
    profile.priorities = replacement.priorities

    try:
        db.commit()
    except IntegrityError as exc:
        raise handle_database_error(
            db,
            "update",
            profile_id,
        ) from exc
    except Exception as exc:
        raise handle_database_error(
            db,
            "update",
            profile_id,
        ) from exc

    updated_profile = load_profile(db, profile_id, user["id"])
    if updated_profile is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Profile was updated but could not be reloaded",
        )

    return StudentProfileOut.from_profile(updated_profile)


@router.delete(
    "/{profile_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_profile(
    profile_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    profile = db.scalar(
        select(StudentProfile).where(
            StudentProfile.id == profile_id,
            StudentProfile.owner_id == user["id"],
        )
    )

    if profile is None:
        raise not_found()

    try:
        db.delete(profile)
        db.commit()
    except Exception as exc:
        raise handle_database_error(
            db,
            "delete",
            profile_id,
        ) from exc

    return Response(status_code=status.HTTP_204_NO_CONTENT)
