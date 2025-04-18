from typing import Annotated
from fastapi import Depends
from sqlmodel import Session

from app.core.database import get_pg_session

SessionDep = Annotated[Session, Depends(get_pg_session)]