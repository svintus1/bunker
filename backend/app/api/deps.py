from typing import Annotated
from fastapi import Depends
from sqlmodel import Session

from app.core.database import get_session

SessionDep = Annotated[Session, Depends(get_session)]