
"""Database configuration for EduPath AI."""

import logging
import os
from collections.abc import Generator

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import URL, make_url
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

load_dotenv()
logger = logging.getLogger(__name__)

IS_PRODUCTION = (
    bool(os.getenv("RENDER"))
    or bool(os.getenv("RENDER_SERVICE_ID"))
    or os.getenv("ENVIRONMENT", "").strip().lower() == "production"
)

raw_database_url = os.getenv("DATABASE_URL", "").strip()

if not raw_database_url:
    if IS_PRODUCTION:
        raise RuntimeError(
            "DATABASE_URL must be configured with the production PostgreSQL connection string."
        )
    raw_database_url = "sqlite:///./edupath.db"


def normalize_database_url(value: str) -> str | URL:
    """Normalize provider-style PostgreSQL URLs for SQLAlchemy."""
    if value.startswith("postgres://"):
        value = "postgresql+psycopg://" + value[len("postgres://"):]
    elif value.startswith("postgresql://"):
        value = "postgresql+psycopg://" + value[len("postgresql://"):]

    try:
        parsed = make_url(value)
    except Exception as exc:
        raise RuntimeError("DATABASE_URL is not a valid database URL.") from exc

    if parsed.drivername.startswith("postgresql") and not parsed.drivername.endswith("+psycopg"):
        parsed = parsed.set(drivername="postgresql+psycopg")

    return parsed


DATABASE_URL = normalize_database_url(raw_database_url)

try:
    parsed_url = make_url(DATABASE_URL)
except Exception as exc:
    raise RuntimeError("DATABASE_URL is not a valid database URL.") from exc

if IS_PRODUCTION and parsed_url.get_backend_name() == "sqlite":
    raise RuntimeError(
        "Production cannot use SQLite. Configure DATABASE_URL with PostgreSQL."
    )

if parsed_url.get_backend_name() not in {"sqlite", "postgresql"}:
    raise RuntimeError(
        "Unsupported database engine. EduPath AI requires SQLite or PostgreSQL."
    )

connect_args = (
    {"check_same_thread": False}
    if parsed_url.get_backend_name() == "sqlite"
    else {}
)

engine_options = {
    "pool_pre_ping": True,
    "connect_args": connect_args,
}

if parsed_url.get_backend_name() == "postgresql":
    engine_options["pool_recycle"] = 1800
    if IS_PRODUCTION:
        engine_options["pool_size"] = 5
        engine_options["max_overflow"] = 5

engine = create_engine(DATABASE_URL, **engine_options)

SessionLocal = sessionmaker(
    bind=engine,
    class_=Session,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Base class for SQLAlchemy models."""

    pass


def get_db() -> Generator[Session, None, None]:
    """Provide a database session and always close it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
