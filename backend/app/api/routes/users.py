from typing import Annotated
import uuid

from fastapi import APIRouter, Body, HTTPException

from app.models import UserCreate, User
from app.api.deps import UserCRUDDep

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/create", description="Create new user with given `name`.")
def create_user(user_crud: UserCRUDDep, user_in: UserCreate) -> User:
    # Check if user with this username already exists
    user = user_crud.get_user_by_name(name=user_in.name)
    if user:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "The user with this name already exists in the system",
                "id": str(user.id)
            }
        )

    user = user_crud.create_user(user_create=user_in)

    return user

@router.post("/get", description="Get user based on user `id`.")
def get_user(user_crud: UserCRUDDep, id: Annotated[uuid.UUID, Body(embed=True)]) -> User:
    user = user_crud.get_user_by_id(id=id)
    if not user:
        raise HTTPException(
            status_code=400,
            detail="The user with this ID is not found"
        )

    return user