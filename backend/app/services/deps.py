from typing import Annotated
from fastapi import Depends
from app.crud import LobbyCRUD, PlayerCRUD, UserCRUD
from app.core.database import PgSessionDep

def get_lobby_crud() -> LobbyCRUD:
    return LobbyCRUD()

def get_player_crud() -> PlayerCRUD:
    return PlayerCRUD()

def get_user_crud(db: PgSessionDep) -> UserCRUD:
    return UserCRUD(db)

LobbyCRUDDep = Annotated[LobbyCRUD, Depends(get_lobby_crud)]
PlayerCRUDDep = Annotated[PlayerCRUD, Depends(get_player_crud)]
UserCRUDDep = Annotated[UserCRUD, Depends(get_user_crud)]