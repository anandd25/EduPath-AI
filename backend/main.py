"""EduPath AI API entry point."""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text
from database import Base, engine
from profile_routes import router as profile_router
from roadmap_routes import router as roadmap_router

Base.metadata.create_all(bind=engine)


def ensure_profile_owner_column() -> None:
    """Add owner_id to older databases without dropping existing profile data."""
    inspector = inspect(engine)
    if "student_profiles" not in inspector.get_table_names():
        return
    columns = {column["name"] for column in inspector.get_columns("student_profiles")}
    with engine.begin() as connection:
        if "owner_id" not in columns:
            connection.execute(text("ALTER TABLE student_profiles ADD COLUMN owner_id VARCHAR(64) NULL"))
        connection.execute(text("CREATE INDEX IF NOT EXISTS ix_student_profiles_owner_id ON student_profiles (owner_id)"))


ensure_profile_owner_column()
app = FastAPI(title="EduPath AI API", version="1.2.0")
origins = ["http://localhost:5173", "http://127.0.0.1:5173", "https://edu-path-ai-seven.vercel.app"]
for env_name in ("FRONTEND_ORIGIN", "FRONTEND_URL"):
    for value in os.getenv(env_name, "").split(","):
        value = value.strip().rstrip("/")
        if value and value not in origins:
            origins.append(value)

cors_options = dict(
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "apikey", "X-Requested-With"],
)
app.add_middleware(CORSMiddleware, **cors_options)
app.include_router(profile_router, prefix="/api")
app.include_router(roadmap_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "EduPath AI API", "version": "1.2.0"}

@app.get("/health")
def health():
    return {"status": "ok"}
