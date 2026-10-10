from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from database import get_db
from auth import get_current_user
from models import StudentProfile, StudentSubject, StudentInterest, StudentStrength, StudentPriority
from schemas import StudentProfileCreate, StudentProfileOut

router = APIRouter(prefix="/profiles", tags=["Student Profiles"])


def load_profile(db: Session, profile_id: int, owner_id: str):
    stmt = select(StudentProfile).where(
        StudentProfile.id == profile_id,
        StudentProfile.owner_id == owner_id,
    ).options(
        selectinload(StudentProfile.subjects), selectinload(StudentProfile.interests),
        selectinload(StudentProfile.strengths), selectinload(StudentProfile.priorities))
    return db.scalar(stmt)


def build_profile(payload: StudentProfileCreate, owner_id: str):
    data = payload.model_dump()
    budget, funding = data.pop("annual_budget"), data.pop("funding_preferences")
    subjects, interests = data.pop("subjects"), data.pop("interests")
    strengths, priorities = data.pop("strengths"), data.pop("priorities")
    p = StudentProfile(**data, owner_id=owner_id,
        budget_currency=budget["currency"], budget_amount=budget["amount"],
        budget_status=budget["budget_status"],
        interested_in_scholarships=funding["interested_in_scholarships"],
        willing_to_consider_loans=funding["willing_to_consider_loans"])
    p.subjects = [StudentSubject(**x) for x in subjects]
    p.interests = [StudentInterest(value=x) for x in interests]
    p.strengths = [StudentStrength(**x) for x in strengths]
    p.priorities = [StudentPriority(value=x) for x in priorities]
    return p


def not_found():
    # Same response for missing and another user's profile prevents ID enumeration.
    return HTTPException(status_code=404, detail="Student profile not found")


@router.post("", response_model=StudentProfileOut, status_code=status.HTTP_201_CREATED)
def create_profile(
    payload: StudentProfileCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    p = build_profile(payload, user["id"])
    try:
        db.add(p); db.commit(); db.refresh(p)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Could not save profile")
    return StudentProfileOut.from_profile(load_profile(db, p.id, user["id"]))


@router.get("", response_model=list[StudentProfileOut])
def list_profiles(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    stmt = select(StudentProfile).where(StudentProfile.owner_id == user["id"]).options(
        selectinload(StudentProfile.subjects), selectinload(StudentProfile.interests),
        selectinload(StudentProfile.strengths), selectinload(StudentProfile.priorities)
    ).order_by(StudentProfile.created_at.desc()).offset(max(skip, 0)).limit(max(1, min(limit, 100)))
    return [StudentProfileOut.from_profile(p) for p in db.scalars(stmt).all()]


@router.get("/{profile_id}", response_model=StudentProfileOut)
def get_profile(
    profile_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    p = load_profile(db, profile_id, user["id"])
    if p is None:
        raise not_found()
    return StudentProfileOut.from_profile(p)


@router.put("/{profile_id}", response_model=StudentProfileOut)
def replace_profile(
    profile_id: int,
    payload: StudentProfileCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    p = load_profile(db, profile_id, user["id"])
    if p is None:
        raise not_found()
    replacement = build_profile(payload, user["id"])
    for field in ["education_stage","preferred_name","country","region","curriculum","academic_status",
                  "preferred_language","overall_percentage","overall_result_status","interest_description",
                  "budget_currency","budget_amount","budget_status","interested_in_scholarships",
                  "willing_to_consider_loans","preferred_destination","career_certainty"]:
        setattr(p, field, getattr(replacement, field))
    p.subjects = replacement.subjects
    p.interests = replacement.interests
    p.strengths = replacement.strengths
    p.priorities = replacement.priorities
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Could not update profile")
    return StudentProfileOut.from_profile(load_profile(db, profile_id, user["id"]))


@router.delete("/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_profile(
    profile_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    p = db.scalar(select(StudentProfile).where(
        StudentProfile.id == profile_id,
        StudentProfile.owner_id == user["id"],
    ))
    if p is None:
        raise not_found()
    db.delete(p); db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
