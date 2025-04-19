from typing import Annotated
from fastapi import Depends
from redis import Redis
from sqlmodel import Session

from app.core.database import get_pg_session, get_redis_connection


PgSessionDep = Annotated[Session, Depends(get_pg_session)]
RedisConnectionDep = Annotated[Redis[str], Depends(get_redis_connection)]