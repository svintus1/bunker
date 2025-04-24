from collections.abc import Generator
from typing import Any
import pytest
import logging
from unittest.mock import MagicMock

from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlalchemy import Engine
from sqlalchemy_utils import database_exists, create_database, drop_database

from app.main import app
from app.core.config import settings
from app.api.deps import get_user_crud, get_lobby_crud, get_player_crud
from app.crud import UserCRUD, LobbyCRUD
from app.models import BaseJsonModel


@pytest.fixture(autouse=True)
def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('test.log'),
            logging.StreamHandler()  # This will still print to console
        ],
        force=True
    )


# @pytest.fixture(scope="function")
# def client(db: Session) -> Generator[TestClient, None, None]:
#     def get_pg_session_override():
#         return db

#     # def get_redis_connection_override():
#     #     return redis
    
#     # Override FastAPI dependencies
#     app.dependency_overrides[get_pg_session] = get_pg_session_override
#     # app.dependency_overrides[get_redis_connection] = get_redis_connection_override
    
#     # Override redis-om default connection
#     # redis_om.redis_om.connections.get_redis_connection = lambda *args, **kwargs: redis
    
#     with TestClient(app) as c:
#         yield c
    
#     # Clear all overrides
#     app.dependency_overrides.clear()
#     # redis_om.redis_om.connections.get_redis_connection = redis_om.get_redis_connection


@pytest.fixture(scope="session")
def engine() -> Generator[Engine, Any, Any]:
    url = str(settings.POSTGRES_TEST_DATABASE_URI)
    if not database_exists(url):
        create_database(url)
    engine = create_engine(url)
    yield engine
    drop_database(url)
    

@pytest.fixture(scope="module")
def create_tables(engine: Engine):
    SQLModel.metadata.create_all(engine)
    yield
    SQLModel.metadata.drop_all(engine)


@pytest.fixture(scope="function")
def db(engine, create_tables) -> Generator[Session, None, None]:
    connection = engine.connect()
    transaction = connection.begin()  # start outer transaction
    session = Session(bind=connection)
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture(scope="session", autouse=True)
def redis_connection():
    # ALL THOSE THINGS DO NOT WORK NOW
    # url = str(settings.REDIS_TEST_DATABASE_URI)
    # connection = redis_om.get_redis_connection(url=url)
    # # Save original connection to restore later
    original_connection = BaseJsonModel.Meta.database
    yield original_connection
    original_connection.flushdb()
    original_connection.close()
    # # Set test connection
    # BaseJsonModel.Meta.database = connection

    # yield connection

    # connection.flushdb()
    # connection.close()
    # # Restore original connection after all tests
    # BaseJsonModel.Meta.database = original_connection


# @pytest.fixture(scope="function")
# def redis(redis_connection: Redis) -> Generator[Redis, None, None]:
#     try:
#         yield redis_connection
#     finally:
#         redis_connection.flushdb()


@pytest.fixture
def user_crud(db) -> UserCRUD:
    return UserCRUD(db)

@pytest.fixture
def lobby_crud() -> LobbyCRUD:
    return LobbyCRUD()

@pytest.fixture
def mock_user_crud():
    return MagicMock()

@pytest.fixture
def mock_lobby_crud():
    return MagicMock()

@pytest.fixture
def mock_player_crud():
    return MagicMock()

@pytest.fixture
def api_client(mock_user_crud, mock_lobby_crud, mock_player_crud) -> Generator[TestClient, None, None]:
    """
    Provides a FastAPI TestClient with all CRUD dependencies mocked.
    Use this fixture in API tests that require full dependency override.
    """

    app.dependency_overrides[get_user_crud] = lambda: mock_user_crud
    app.dependency_overrides[get_lobby_crud] = lambda: mock_lobby_crud
    app.dependency_overrides[get_player_crud] = lambda: mock_player_crud

    with TestClient(app) as client:
        yield client

    app.dependency_overrides.clear()
