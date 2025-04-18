from typing import Annotated

from fastapi import APIRouter, HTTPException, Path

from app import crud
from app.models import UserCreate, User
from app.api.deps import SessionDep

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/create")
def create_user(session: SessionDep, user_in: UserCreate) -> User:
    """Create new user."""
    user = crud.get_user_by_name(session=session, name=user_in.name)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this name already exists in the system"
        )

    user = crud.create_user(session=session, user_create=user_in)
    return user

@router.get("/{id}")
def get_user(session: SessionDep, id: Annotated[str, Path(max_length=255)]):
    user = crud.get_user_by_id(session=session, id=id)
    if not user:
        raise HTTPException(
            status_code=400,
            detail="The user with this ID is not found"
        )