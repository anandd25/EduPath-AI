
from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    model_validator,
)


EducationStage = Literal["class10"]
AcademicStatus = Literal["studying", "completed", "awaiting_results"]
ResultStatus = Literal["completed", "pending", "estimated", "not_applicable"]
BudgetStatus = Literal["fixed", "flexible", "estimated", "unknown"]
CareerCertainty = Literal["decided", "exploring", "undecided"]
PreferredDestination = Literal["local", "national", "international", "flexible"]


class APIModel(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
        validate_assignment=True,
    )


class StudentSubjectCreate(APIModel):
    name: str = Field(min_length=1, max_length=100)
    marks: float | None = Field(default=None, ge=0, le=100000)
    maximum_marks: float | None = Field(default=None, gt=0, le=100000)
    result_status: ResultStatus = "pending"
    favourite: bool = False
    challenging: bool = False

    @model_validator(mode="after")
    def validate_marks(self):
        if self.marks is not None and self.maximum_marks is not None:
            if self.marks > self.maximum_marks:
                raise ValueError("Subject marks cannot exceed maximum marks")
        return self


class StudentStrengthCreate(APIModel):
    name: str = Field(min_length=1, max_length=60)
    rating: int | None = Field(default=None, ge=1, le=5)
    rating_status: ResultStatus = "estimated"


class AnnualBudget(APIModel):
    currency: str = Field(default="INR", min_length=3, max_length=3)
    amount: float | None = Field(default=None, ge=0, le=1000000000)
    budget_status: BudgetStatus = "unknown"

    @field_validator("currency")
    @classmethod
    def uppercase_currency(cls, value: str) -> str:
        return value.upper()


class FundingPreferences(APIModel):
    interested_in_scholarships: bool = True
    willing_to_consider_loans: bool = False


class StudentProfileCreate(APIModel):
    education_stage: EducationStage = "class10"
    preferred_name: str | None = Field(default=None, max_length=80)
    country: str = Field(min_length=1, max_length=100)
    region: str | None = Field(default=None, max_length=100)
    curriculum: str = Field(min_length=1, max_length=30)
    academic_status: AcademicStatus
    preferred_language: str = Field(default="English", max_length=50)

    overall_percentage: float | None = Field(default=None, ge=0, le=100)
    overall_result_status: ResultStatus = "pending"

    subjects: list[StudentSubjectCreate] = Field(default_factory=list, max_length=40)
    interests: list[str] = Field(default_factory=list, max_length=30)
    strengths: list[StudentStrengthCreate] = Field(default_factory=list, max_length=30)
    priorities: list[str] = Field(default_factory=list, max_length=20)
    interest_description: str = Field(default="", max_length=5000)

    annual_budget: AnnualBudget = Field(default_factory=AnnualBudget)
    funding_preferences: FundingPreferences = Field(
        default_factory=FundingPreferences
    )

    preferred_destination: PreferredDestination = "flexible"
    career_certainty: CareerCertainty = "exploring"

    @field_validator("interests", "priorities")
    @classmethod
    def normalize_unique_strings(cls, values: list[str]) -> list[str]:
        result: list[str] = []
        seen: set[str] = set()

        for item in values:
            normalized = item.strip()
            key = normalized.casefold()

            if not normalized:
                continue
            if len(normalized) > 60:
                raise ValueError("Each item must be at most 60 characters")
            if key not in seen:
                seen.add(key)
                result.append(normalized)

        return result

    @field_validator("subjects")
    @classmethod
    def unique_subjects(
        cls,
        values: list[StudentSubjectCreate],
    ) -> list[StudentSubjectCreate]:
        seen: set[str] = set()
        for subject in values:
            key = subject.name.casefold()
            if key in seen:
                raise ValueError(f"Duplicate subject: {subject.name}")
            seen.add(key)
        return values

    @field_validator("strengths")
    @classmethod
    def unique_strengths(
        cls,
        values: list[StudentStrengthCreate],
    ) -> list[StudentStrengthCreate]:
        seen: set[str] = set()
        for strength in values:
            key = strength.name.casefold()
            if key in seen:
                raise ValueError(f"Duplicate strength: {strength.name}")
            seen.add(key)
        return values


class StudentSubjectOut(StudentSubjectCreate):
    id: int


class StudentStrengthOut(StudentStrengthCreate):
    id: int


class AnnualBudgetOut(AnnualBudget):
    pass


class FundingPreferencesOut(FundingPreferences):
    pass


class StudentProfileOut(APIModel):
    id: int
    owner_id: str | None = None

    education_stage: EducationStage
    preferred_name: str | None = None
    country: str
    region: str | None = None
    curriculum: str
    academic_status: AcademicStatus
    preferred_language: str

    overall_percentage: float | None = None
    overall_result_status: ResultStatus

    subjects: list[StudentSubjectOut] = Field(default_factory=list)
    interests: list[str] = Field(default_factory=list)
    strengths: list[StudentStrengthOut] = Field(default_factory=list)
    priorities: list[str] = Field(default_factory=list)
    interest_description: str = ""

    annual_budget: AnnualBudgetOut
    funding_preferences: FundingPreferencesOut

    preferred_destination: PreferredDestination
    career_certainty: CareerCertainty

    created_at: datetime | None = None
    updated_at: datetime | None = None

    @classmethod
    def from_profile(cls, profile: Any) -> "StudentProfileOut":
        """Convert SQLAlchemy profile relationships to the public API shape."""
        subjects = [
            {
                "id": item.id,
                "name": item.name,
                "marks": item.marks,
                "maximum_marks": item.maximum_marks,
                "result_status": item.result_status,
                "favourite": item.favourite,
                "challenging": item.challenging,
            }
            for item in profile.subjects
        ]

        interests = [item.value for item in profile.interests]

        strengths = [
            {
                "id": item.id,
                "name": item.name,
                "rating": item.rating,
                "rating_status": item.rating_status,
            }
            for item in profile.strengths
        ]

        priorities = [item.value for item in profile.priorities]

        return cls(
            id=profile.id,
            owner_id=profile.owner_id,
            education_stage=profile.education_stage,
            preferred_name=profile.preferred_name,
            country=profile.country,
            region=profile.region,
            curriculum=profile.curriculum,
            academic_status=profile.academic_status,
            preferred_language=profile.preferred_language or "English",
            overall_percentage=profile.overall_percentage,
            overall_result_status=profile.overall_result_status,
            subjects=subjects,
            interests=interests,
            strengths=strengths,
            priorities=priorities,
            interest_description=profile.interest_description or "",
            annual_budget={
                "currency": profile.budget_currency,
                "amount": profile.budget_amount,
                "budget_status": profile.budget_status,
            },
            funding_preferences={
                "interested_in_scholarships": profile.interested_in_scholarships,
                "willing_to_consider_loans": profile.willing_to_consider_loans,
            },
            preferred_destination=profile.preferred_destination,
            career_certainty=profile.career_certainty,
            created_at=profile.created_at,
            updated_at=profile.updated_at,
        )


class ProfileSummary(APIModel):
    profile_id: int
    preferred_name: str | None = None
    education_stage: EducationStage
    country: str
    region: str | None = None
    interests: list[str] = Field(default_factory=list)
    priorities: list[str] = Field(default_factory=list)
    career_certainty: CareerCertainty


class APIMessage(APIModel):
    message: str


class ErrorResponse(APIModel):
    detail: str


class HealthResponse(APIModel):
    status: Literal["ok", "degraded"]
    service: str
    details: dict[str, Any] = Field(default_factory=dict)
