from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Annotated, Literal
from pydantic import (
    computed_field,
    PostgresDsn,
)

class Settings(BaseSettings):
    ENVIRONMENT: Literal["development", "production"] = "development"

    API_STR: str = "/api/"
    PROJECT_NAME: str = "bunker"

    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000

    FRONTEND_HOST: str = "127.0.0.1"
    FRONTEND_PORT: str = 8000

    @computed_field
    @property
    def CORS_ORIGINS(self) -> list[str]:
        return [
            f"http://{self.FRONTEND_HOST}:{self.FRONTEND_PORT}",
            ]

    POSTGRES_HOST: str
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str

    @computed_field
    @property
    def POSTGRES_DATABASE_URI(self) -> PostgresDsn:
        return PostgresDsn.build(
            scheme="postgresql",
            username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD,
            host=self.POSTGRES_HOST,
            port=self.POSTGRES_PORT,
            path=self.POSTGRES_DB
        )


settings = Settings()