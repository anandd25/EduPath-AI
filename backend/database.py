import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv()

DATABASE_URL = (os.getenv("DATABASE_URL") or "").strip()
IS_PRODUCTION = bool(os.getenv("RENDER") or os.getenv("RENDER_SERVICE_ID") or os.getenv("ENVIRONMENT", "").lower() == "production")
if not DATABASE_URL:
    if IS_PRODUCTION:
        raise RuntimeError("DATABASE_URL must be set to your Supabase PostgreSQL connection string in production.")
    DATABASE_URL = "sqlite:///./edupath.db"

# Supabase provides postgres:// or postgresql:// URLs; SQLAlchemy uses psycopg explicitly here.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = "postgresql+psycopg://" + DATABASE_URL[len("postgres://"): ]
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = "postgresql+psycopg://" + DATABASE_URL[len("postgresql://"): ]

if IS_PRODUCTION and DATABASE_URL.startswith("sqlite:"):
    raise RuntimeError("Production cannot use edupath.db. Set DATABASE_URL to Supabase PostgreSQL in Render.")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
