import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.session import engine, Base
from app.api import (
    auth,
    cases,
    applications,
    teams,
    projects,
    showcase,
    talent_search,
    analytics,
    companies,
    audit,
    notifications
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables exist
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("Database tables initialized successfully.")
    except Exception as e:
        print(f"PostgreSQL connection failed ({e}), checking SQLite fallback...")
        from sqlalchemy.ext.asyncio import create_async_engine
        import app.db.session as db_session
        db_session.engine = create_async_engine(settings.SQLITE_FALLBACK_URL, echo=False)
        db_session.AsyncSessionLocal.configure(bind=db_session.engine)
        async with db_session.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("Initialized tables in SQLite fallback mode.")

    # Ensure uploads dir
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API для платформы взаимодействия студентов УУНиТ с ИТ-компаниями",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
api_v1_prefix = settings.API_V1_STR
for prefix in [api_v1_prefix, "/api"]:
    app.include_router(auth.router, prefix=prefix)
    app.include_router(cases.router, prefix=prefix)
    app.include_router(applications.router, prefix=prefix)
    app.include_router(teams.router, prefix=prefix)
    app.include_router(projects.router, prefix=prefix)
    app.include_router(showcase.router, prefix=prefix)
    app.include_router(talent_search.router, prefix=prefix)
    app.include_router(analytics.router, prefix=prefix)
    app.include_router(companies.router, prefix=prefix)
    app.include_router(audit.router, prefix=prefix)
    app.include_router(notifications.router, prefix=prefix)

@app.get("/api/health")
async def health():
    return {"status": "ok", "project": settings.PROJECT_NAME}

# Mount frontend build static files if present
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "frontend", "dist")
if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
