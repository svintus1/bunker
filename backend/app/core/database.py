from sqlmodel import Session, create_engine
from collections.abc import Generator
from app.core.config import settings


engine = create_engine(str(settings.POSTGRES_DATABASE_URI))


def init_db(session: Session) -> None:
    from sqlmodel import SQLModel

    SQLModel.metadata.create_all(engine)

def get_pg_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session