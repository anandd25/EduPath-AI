import os
from sqlalchemy import inspect, text
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from profile_routes import router as profile_router

# Creates missing tables. Existing deployments get a safe additive owner_id migration below.
Base.metadata.create_all(bind=engine)


def ensure_profile_owner_column() -> None:
    """Add owner_id to existing installations without deleting existing profile data.

    Legacy rows remain owner_id=NULL and are deliberately not visible to authenticated users.
    New and updated profiles are scoped to the authenticated Supabase user.
    """
    inspector = inspect(engine)
    if "student_profiles" not in inspector.get_table_names():
        return
    columns = {column["name"] for column in inspector.get_columns("student_profiles")}
    if "owner_id" not in columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE student_profiles ADD COLUMN owner_id VARCHAR(64) NULL"))
    with engine.begin() as connection:
        # Index creation syntax is supported by SQLite and PostgreSQL.
        connection.execute(text("CREATE INDEX IF NOT EXISTS ix_student_profiles_owner_id ON student_profiles (owner_id)"))


ensure_profile_owner_column()

app = FastAPI(title="EduPath Student Profile API", version="1.1.0")
origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
# Accept either variable name to support the current Render configuration and the older starter.
for env_name in ("FRONTEND_URL", "FRONTEND_ORIGIN"):
    configured = os.getenv(env_name, "")
    for origin in configured.split(","):
        origin = origin.strip().rstrip("/")
        if origin and origin not in origins:
            origins.append(origin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "apikey"],
)
app.include_router(profile_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "EduPath Student Profile API"}

@app.get("/health")
def health():
    return {"status": "ok"}
