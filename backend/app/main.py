import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from core.config import settings, setup_logging
from api.main import api_router

logger = logging.getLogger(settings.LOGGER_NAME)

@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()

    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan
)

# Enable CORS
if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_STR)

if __name__ == "__main__":
    logger.debug("Run uvicorn on %s:%d in %s mode",
                 settings.BACKEND_HOST,
                 settings.BACKEND_PORT,
                 settings.ENVIRONMENT
                 )
    uvicorn.run("main:app",
                host=settings.BACKEND_HOST,
                port=settings.BACKEND_PORT,
                reload=(settings.ENVIRONMENT == "development"),
                reload_includes=["*.py", "core/logging.json"],
                reload_excludes=["__pycache__/*", "*.pyc"]
                )