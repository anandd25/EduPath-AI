
import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy.engine import make_url

# Load .env for local development.
# On Render, DATABASE_URL is provided through Environment Variables.
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # SQLite is used only for local development.
    if os.getenv("RENDER"):
        raise RuntimeError(
            "DATABASE_URL is missing. "
            "Set it in Render Dashboard → Environment."
        )

    DATABASE_URL = "sqlite:///./edupath.db"

# Parse and normalize the URL.
try:
    db_url = make_url(DATABASE_URL)
except Exception as exc:
    raise RuntimeError(
        "DATABASE_URL is invalid. Check your database connection string."
    ) from exc

# Use the psycopg 3 driver for PostgreSQL URLs.
if db_url.drivername == "postgresql":
    db_url = db_url.set(drivername="postgresql+psycopg")

# SQLite needs this option for FastAPI's typical threaded request handling.
connect_args = (
    {"check_same_thread": False}
    if db_url.drivername.startswith("sqlite")
    else {}
)

# Create the SQLAlchemy engine.
engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True,
)

# Database session factory.
SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
)


# Base class for SQLAlchemy models.
class Base(DeclarativeBase):
    pass


# FastAPI database dependency.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
