
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from database import get_db
from models import (
    StudentProfile,
    StudentSubject,
    StudentInterest,
    StudentStrength,
    StudentPriority,
)
from schemas import StudentProfileCreate, StudentProfileOut

router = APIRouter(prefix="/profiles", tags=["Student Profiles"])


def load_profile(db: Session, profile_id: int):
    stmt = (
        select(StudentProfile)
        .where(StudentProfile.id == profile_id)
        .options(
            selectinload(StudentProfile.subjects),
            selectinload(StudentProfile.interests),
            selectinload(StudentProfile.strengths),
            selectinload(StudentProfile.priorities),
        )
    )
    return db.scalar(stmt)


def build_profile(payload: StudentProfileCreate):
    data = payload.model_dump()

    budget = data.pop("annual_budget")
    funding = data.pop("funding_preferences")
    subjects = data.pop("subjects")
    interests = data.pop("interests")
    strengths = data.pop("strengths")
    priorities = data.pop("priorities")

    profile = StudentProfile(
        **data,
        budget_currency=budget["currency"],
        budget_amount=budget["amount"],
        budget_status=budget["budget_status"],
        interested_in_scholarships=funding["interested_in_scholarships"],
        willing_to_consider_loans=funding["willing_to_consider_loans"],
    )

    profile.subjects = [StudentSubject(**item) for item in subjects]
    profile.interests = [StudentInterest(value=item) for item in interests]
    profile.strengths = [StudentStrength(**item) for item in strengths]
    profile.priorities = [StudentPriority(value=item) for item in priorities]

    return profile


@router.post(
    "",
    response_model=StudentProfileOut,
    status_code=status.HTTP_201_CREATED,
)
def create_profile(
    payload: StudentProfileCreate,
    db: Session = Depends(get_db),
):
    profile = build_profile(payload)

    try:
        db.add(profile)
        db.commit()
        profile_id = profile.id
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not save profile. Check the database configuration.",
        )

    saved_profile = load_profile(db, profile_id)

    if saved_profile is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Profile was saved but could not be retrieved.",
        )

    return StudentProfileOut.from_profile(saved_profile)


@router.get("", response_model=list[StudentProfileOut])
def list_profiles(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    stmt = (
        select(StudentProfile)
        .options(
            selectinload(StudentProfile.subjects),
            selectinload(StudentProfile.interests),
            selectinload(StudentProfile.strengths),
            selectinload(StudentProfile.priorities),
        )
        .order_by(StudentProfile.created_at.desc())
        .offset(max(skip, 0))
        .limit(max(1, min(limit, 100)))
    )

    profiles = db.scalars(stmt).all()
    return [StudentProfileOut.from_profile(p) for p in profiles]


@router.get("/{profile_id}", response_model=StudentProfileOut)
def get_profile(
    profile_id: int,
    db: Session = Depends(get_db),
):
    profile = load_profile(db, profile_id)

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found",
        )

    return StudentProfileOut.from_profile(profile)


@router.put("/{profile_id}", response_model=StudentProfileOut)
def replace_profile(
    profile_id: int,
    payload: StudentProfileCreate,
    db: Session = Depends(get_db),
):
    profile = load_profile(db, profile_id)

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found",
        )

    replacement = build_profile(payload)

    fields = [
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
    ]

    try:
        for field in fields:
            setattr(profile, field, getattr(replacement, field))

        # Replace related records; SQLAlchemy manages them through relationships.
        profile.subjects = replacement.subjects
        profile.interests = replacement.interests
        profile.strengths = replacement.strengths
        profile.priorities = replacement.priorities

        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not update profile. Check the database configuration.",
        )

    updated_profile = load_profile(db, profile_id)

    if updated_profile is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Profile was updated but could not be retrieved.",
        )

    return StudentProfileOut.from_profile(updated_profile)


@router.delete("/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_profile(
    profile_id: int,
    db: Session = Depends(get_db),
):
    profile = db.get(StudentProfile, profile_id)

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found",
        )

    try:
        db.delete(profile)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not delete profile.",
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)
