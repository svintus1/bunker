from collections.abc import Generator
from typing import Any
import pytest

from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlalchemy import Engine
from redis import Redis

from app.main import app
from app.core.config import settings
from backend.app.core.database import get_pg_session, get_redis_connection


@pytest.fixture(scope="module")
def client(pg_session: Session) -> Generator[TestClient, None, None]:
    def get_session_override():
        return pg_session
    
    app.dependency_overrides[get_pg_session] = get_session_override
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="session")
def engine() -> Engine:
    return create_engine(settings.POSTGRES_TEST_DATABASE_URI)
    

@pytest.fixture(scope="module")
def create_tables(engine) -> Generator[None, Any, None]:
    SQLModel.metadata.create_all(engine)
    yield
    SQLModel.metadata.drop_all(engine)


@pytest.fixture(scope="function")
def pg_session(engine, create_tables) -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
        session.rollback()  # Rollback any changes made during the test


@pytest.fixture(scope="session")
def redis_connection() -> Generator[Redis[str], None, None]:
    connection = Redis.from_url(str(settings.REDIS_TEST_DATABASE_URI), decode_responses=True)
    yield connection


@pytest.fixture(scope="function")
def redis_client(redis_connection) -> Generator[Redis[str], None, None]:
    try:
        yield redis_connection
    finally:
        redis_connection.flushdb()
        redis_connection.close()  # Ensure the Redis connection is properly closed
