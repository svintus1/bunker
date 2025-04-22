from collections.abc import Generator
from typing import Annotated
from fastapi import Depends
from sqlmodel import Session, create_engine
from redis import Redis
from redis_om import get_redis_connection

from app.core.config import settings


engine = create_engine(str(settings.POSTGRES_DATABASE_URI))
connection = get_redis_connection(url=str(settings.REDIS_DATABASE_URI))


def init_db() -> None:
    from sqlmodel import SQLModel

    SQLModel.metadata.create_all(engine)


def get_pg_session() -> Generator[Session, None, None]:
    init_db()
    with Session(engine) as session:
        yield session


def get_redis_connection() -> Generator[Redis, None, None]:
    yield connection

PgSessionDep = Annotated[Session, Depends(get_pg_session)]
RedisConnectionDep = Annotated[Redis, Depends(get_redis_connection)]
