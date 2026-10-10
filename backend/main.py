
"""EduPath AI FastAPI application entry point."""

import logging
import os
from pathlib import Path

from dotenv import load_dotenv

# Load environment settings before importing modules that depend on them.
load_dotenv()
load_dotenv(Path(__file__).resolve().parent / ".env")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text
from sqlalchemy.exc import SQLAlchemyError

from database import Base, engine
from profile_routes import router as profile_router
from roadmap_routes import router as roadmap_router

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO").upper())
logger = logging.getLogger("edupath.api")

API_VERSION = "1.3.0"


def ensure_profile_owner_column() -> None:
    """Safely add the owner column to older profile tables."""
    inspector = inspect(engine)

    if "student_profiles" not in inspector.get_table_names():
        return

    columns = {
        column["name"]
        for column in inspector.get_columns("student_profiles")
    }

    with engine.begin() as connection:
        if "owner_id" not in columns:
            connection.execute(
                text(
                    "ALTER TABLE student_profiles "
                    "ADD COLUMN owner_id VARCHAR(64) NULL"
                )
            )

        # Use a portable index creation check instead of relying on
        # dialect-specific CREATE INDEX IF NOT EXISTS behavior.
        current_indexes = {
            index["name"]
            for index in inspect(connection).get_indexes("student_profiles")
        }

        if "ix_student_profiles_owner_id" not in current_indexes:
            connection.execute(
                text(
                    "CREATE INDEX ix_student_profiles_owner_id "
                    "ON student_profiles (owner_id)"
                )
            )


def build_allowed_origins() -> list[str]:
    """Build the explicit CORS allowlist from environment configuration."""
    origins = {
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://edu-path-ai-seven.vercel.app",
    }

    for env_name in ("FRONTEND_ORIGIN", "FRONTEND_URL"):
        configured = os.getenv(env_name, "")
        for item in configured.split(","):
            origin = item.strip().rstrip("/")
            if origin:
                origins.add(origin)

    return sorted(origins)


app = FastAPI(
    title="EduPath AI API",
    description=(
        "Authenticated student profiles, education pathway generation, "
        "and scenario planning."
    ),
    version=API_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=build_allowed_origins(),
    allow_credentials=True,
    allow_methods=[
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
    ],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "Accept",
        "apikey",
        "X-Requested-With",
    ],
)


@app.on_event("startup")
def initialize_database() -> None:
    """Create missing tables and apply the safe owner-column migration."""
    try:
        Base.metadata.create_all(bind=engine)
        ensure_profile_owner_column()
        logger.info("Database initialization completed")
    except SQLAlchemyError:
        logger.exception("Database initialization failed")
        raise


app.include_router(profile_router, prefix="/api")
app.include_router(roadmap_router, prefix="/api")


@app.get("/", tags=["system"])
def root() -> dict[str, str]:
    """Return basic API information."""
    return {
        "message": "EduPath AI API",
        "version": API_VERSION,
        "docs": "/docs",
    }


@app.get("/health", tags=["system"])
def health() -> dict[str, str]:
    """Liveness check; does not expose credentials or database details."""
    return {
        "status": "ok",
        "service": "edupath-api",
        "version": API_VERSION,
    }


@app.get("/health/ready", tags=["system"])
def readiness() -> dict[str, str]:
    """Check whether the application can reach its configured database."""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except SQLAlchemyError:
        logger.exception("Readiness check failed")
        from fastapi import HTTPException

        raise HTTPException(
            status_code=503,
            detail="Service dependencies are not ready",
        )

    return {"status": "ready", "database": "connected"}


# Research routes are optional at import time so the core API can still load
# if the research router has not been packaged. When present, register it.
try:
    from routers.research import router as research_router
except ModuleNotFoundError as exc:
    if exc.name not in {"routers", "routers.research"}:
        raise
    logger.warning(
        "Research router is not installed; core profile and roadmap routes remain available"
    )
else:
    app.include_router(research_router)
