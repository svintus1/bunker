from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn


from app.core.config import settings


app = FastAPI(
    title=settings.PROJECT_NAME,
)

if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

if __name__ == "__main__":
    uvicorn.run("main:app",
                host=settings.BACKEND_HOST,
                port=settings.BACKEND_PORT,
                reload=(settings.ENVIRONMENT == "development"),
                )