from collections.abc import Generator
from sqlmodel import Session, create_engine
from redis import Redis
from app.core.config import settings


engine = create_engine(str(settings.POSTGRES_DATABASE_URI))
connection = Redis.from_url(str(settings.REDIS_DATABASE_URI), decode_responses=True)

def init_db() -> None:
    from sqlmodel import SQLModel

    SQLModel.metadata.create_all(engine)


def get_pg_session() -> Generator[Session, None, None]:
    init_db()
    with Session(engine) as session:
        yield session


def get_redis_connection() -> Generator[Redis[str], None, None]:
    yield connection
