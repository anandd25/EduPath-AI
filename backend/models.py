"""SQLAlchemy models for EduPath AI student profiles."""

from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


def utc_now() -> datetime:
    """Return a timezone-aware UTC timestamp."""
    return datetime.now(timezone.utc)


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    __table_args__ = (
        CheckConstraint(
            "education_stage = 'class10'",
            name="ck_profile_class10",
        ),
        CheckConstraint(
            "overall_percentage IS NULL OR "
            "(overall_percentage >= 0 AND overall_percentage <= 100)",
            name="ck_overall_percentage",
        ),
        CheckConstraint(
            "budget_amount IS NULL OR budget_amount >= 0",
            name="ck_profile_budget_amount",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )
    # Supabase Auth user UUID. Nullable to preserve legacy rows.
    owner_id: Mapped[str | None] = mapped_column(
        String(64),
        index=True,
        nullable=True,
    )

    education_stage: Mapped[str] = mapped_column(
        String(20),
        default="class10",
        nullable=False,
    )
    preferred_name: Mapped[str | None] = mapped_column(String(80))
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    region: Mapped[str | None] = mapped_column(String(100))
    curriculum: Mapped[str] = mapped_column(String(30), nullable=False)
    academic_status: Mapped[str] = mapped_column(String(30), nullable=False)
    preferred_language: Mapped[str | None] = mapped_column(String(50))

    overall_percentage: Mapped[float | None] = mapped_column(Float)
    overall_result_status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )
    interest_description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        default="",
    )

    budget_currency: Mapped[str] = mapped_column(
        String(3),
        nullable=False,
        default="INR",
    )
    budget_amount: Mapped[float | None] = mapped_column(Float)
    budget_status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="not_sure",
    )

    interested_in_scholarships: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )
    willing_to_consider_loans: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    preferred_destination: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="undecided",
    )
    career_certainty: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="exploring",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

    subjects: Mapped[list["StudentSubject"]] = relationship(
        back_populates="profile",
        cascade="all, delete-orphan",
        lazy="selectin",
        passive_deletes=True,
    )
    interests: Mapped[list["StudentInterest"]] = relationship(
        back_populates="profile",
        cascade="all, delete-orphan",
        lazy="selectin",
        passive_deletes=True,
    )
    strengths: Mapped[list["StudentStrength"]] = relationship(
        back_populates="profile",
        cascade="all, delete-orphan",
        lazy="selectin",
        passive_deletes=True,
    )
    priorities: Mapped[list["StudentPriority"]] = relationship(
        back_populates="profile",
        cascade="all, delete-orphan",
        lazy="selectin",
        passive_deletes=True,
    )


class StudentSubject(Base):
    __tablename__ = "student_subjects"

    __table_args__ = (
        CheckConstraint(
            "marks IS NULL OR marks >= 0",
            name="ck_subject_marks",
        ),
        CheckConstraint(
            "maximum_marks IS NULL OR maximum_marks > 0",
            name="ck_subject_max_marks",
        ),
        CheckConstraint(
            "marks IS NULL OR maximum_marks IS NULL OR marks <= maximum_marks",
            name="ck_subject_marks_within_maximum",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    profile_id: Mapped[int] = mapped_column(
        ForeignKey("student_profiles.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    marks: Mapped[float | None] = mapped_column(Float)
    maximum_marks: Mapped[float | None] = mapped_column(
        Float,
        default=100,
    )
    result_status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )
    favourite: Mapped[bool] = mapped_column(Boolean, nullable=False)
    challenging: Mapped[bool] = mapped_column(Boolean, nullable=False)

    profile: Mapped["StudentProfile"] = relationship(
        back_populates="subjects",
    )


class StudentInterest(Base):
    __tablename__ = "student_interests"

    __table_args__ = (
        UniqueConstraint(
            "profile_id",
            "value",
            name="uq_profile_interest",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    profile_id: Mapped[int] = mapped_column(
        ForeignKey("student_profiles.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    value: Mapped[str] = mapped_column(String(60), nullable=False)

    profile: Mapped["StudentProfile"] = relationship(
        back_populates="interests",
    )


class StudentStrength(Base):
    __tablename__ = "student_strengths"

    __table_args__ = (
        UniqueConstraint(
            "profile_id",
            "name",
            name="uq_profile_strength",
        ),
        CheckConstraint(
            "rating IS NULL OR (rating >= 1 AND rating <= 5)",
            name="ck_strength_rating",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    profile_id: Mapped[int] = mapped_column(
        ForeignKey("student_profiles.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(60), nullable=False)
    rating: Mapped[int | None] = mapped_column(Integer)
    rating_status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="not_sure",
    )

    profile: Mapped["StudentProfile"] = relationship(
        back_populates="strengths",
    )


class StudentPriority(Base):
    __tablename__ = "student_priorities"

    __table_args__ = (
        UniqueConstraint(
            "profile_id",
            "value",
            name="uq_profile_priority",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    profile_id: Mapped[int] = mapped_column(
        ForeignKey("student_profiles.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    value: Mapped[str] = mapped_column(String(60), nullable=False)

    profile: Mapped["StudentProfile"] = relationship(
        back_populates="priorities",
    )
