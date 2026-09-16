import contextlib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .data.seed_data import seed_database
from .routers import (
    locations,
    risk,
    reports,
    vision,
    alerts,
    priority,
    dashboard
)

# Ensure tables and initial seed data exist
Base.metadata.create_all(bind=engine)
_init_db = SessionLocal()
try:
    seed_database(_init_db)
finally:
    _init_db.close()

# Startup lifecycle handler to create database tables and seed initial data
@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables in SQLite/PostgreSQL
    Base.metadata.create_all(bind=engine)

    # Seed realistic North Eastern Region locations and initial sensor/risk records
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

    yield

app = FastAPI(
    title="NIR-RAKSHA AI Engine API",
    description="Production-grade AI Early Warning & Landslide Risk Monitoring Platform for the North Eastern Region of India (SIH 2026 Problem Statement 26001).",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Enable CORS for React Vite frontend and local testing tools
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(locations.router)
app.include_router(risk.router)
app.include_router(reports.router)
app.include_router(vision.router)
app.include_router(priority.router)
app.include_router(alerts.router)
app.include_router(dashboard.router)

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "NIR-RAKSHA Backend API",
        "version": "1.0.0",
        "framework": "FastAPI + SQLAlchemy + SQLite",
        "sih_problem": "SIH-2026-26001"
    }

@app.get("/", include_in_schema=False)
def root_redirect():
    return {
        "message": "NIR-RAKSHA Backend API is running.",
        "documentation": "/docs",
        "redoc": "/redoc",
        "endpoints": [
            "/api/locations",
            "/api/risk",
            "/api/risk/{location_id}",
            "/api/risk/predict",
            "/api/reports",
            "/api/vision/analyze",
            "/api/emergency-priority",
            "/api/alerts",
            "/api/dashboard"
        ]
    }
