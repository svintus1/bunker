import os
import pathlib
import json
import logging
import atexit
import logging.config
import logging.handlers

from pydantic_settings import BaseSettings
from typing import Any, Literal
from pydantic import (
    computed_field,
    PostgresDsn,
    RedisDsn
)

class Settings(BaseSettings):
    ENVIRONMENT: Literal["development", "production"] = "development"

    API_STR: str = "/api"
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
    POSTGRES_TEST_DB: str = "test_db"

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

    @computed_field
    @property
    def POSTGRES_TEST_DATABASE_URI(self) -> PostgresDsn:
        return PostgresDsn.build(
            scheme="postgresql",
            username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD,
            host=self.POSTGRES_HOST,
            port=self.POSTGRES_PORT,
            path=self.POSTGRES_TEST_DB
        )
        
    REDIS_HOST: str
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str

    @computed_field
    @property
    def REDIS_DATABASE_URI(self) -> RedisDsn:
        return RedisDsn.build(
            scheme="redis",
            password=self.REDIS_PASSWORD,
            host=self.REDIS_HOST,
            port=self.REDIS_PORT
        )

    @computed_field
    @property
    def REDIS_TEST_DATABASE_URI(self) -> RedisDsn:
        return RedisDsn.build(
            scheme="redis",
            password=self.REDIS_PASSWORD,
            host=self.REDIS_HOST,
            port=self.REDIS_PORT,
            path="1" # Use DB 1 for test (0 is prod)
        )

    LOGGER_NAME: str = "bunker"

    @computed_field
    @property
    def LOGGING_CONFIG(self) -> dict[str, Any]:
        # Create logs directory if not exists
        os.makedirs("/opt/logs", exist_ok=True)
        config_file = pathlib.Path("/opt/app/config/logging_config.json")
        with open(config_file) as f:
            config = json.load(f)
            return config


settings = Settings()


def setup_logging():
    logging.config.dictConfig(settings.LOGGING_CONFIG)
    queue_handler: logging.handlers.QueueHandler = logging.getHandlerByName("queue_handler")
    if queue_handler is not None:
        queue_handler.listener.start()
        atexit.register(queue_handler.listener.stop)