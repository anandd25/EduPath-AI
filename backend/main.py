
import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from profile_routes import router as profile_router

# Import every model module before create_all so SQLAlchemy
# knows about all registered tables.
import models  # noqa: F401

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("edupath")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database tables when the application starts."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
    except Exception:
        logger.exception("Database initialization failed.")
        raise

    yield


app = FastAPI(
    title="EduPath AI API",
    description="Student profiles and AI-powered education pathways.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration.
# Set FRONTEND_URL in Render to your exact deployed frontend origin.
frontend_url = os.getenv("FRONTEND_URL", "").strip().rstrip("/")

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

if frontend_url:
    allowed_origins.append(frontend_url)

# Optional comma-separated additional origins, including Vercel previews.
extra_origins = os.getenv("FRONTEND_ORIGINS", "")
for origin in extra_origins.split(","):
    origin = origin.strip().rstrip("/")
    if origin and origin not in allowed_origins:
        allowed_origins.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "name": "EduPath AI API",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "ok"}


# Student profile CRUD endpoints:
# POST   /api/profiles
# GET    /api/profiles
# GET    /api/profiles/{profile_id}
# PUT    /api/profiles/{profile_id}
# DELETE /api/profiles/{profile_id}
app.include_router(profile_router, prefix="/api")


# IMPORTANT:
# Keep your existing Groq-powered pathways and scenario routes here.
# If those routes are in another module, import and register that router.
#
# Example ONLY if your project already has these routers:
# from pathway_routes import router as pathway_router
# from scenario_routes import router as scenario_router
# app.include_router(pathway_router, prefix="/api")
# app.include_router(scenario_router, prefix="/api")
#
# Do not add these example imports unless those modules actually exist.
