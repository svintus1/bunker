from typing import Annotated
from fastapi import Depends
from redis import Redis
from app.crud import LobbyCRUD, PlayerCRUD, UserCRUD
from app.core.database import RedisConnectionDep, PgSessionDep

def get_lobby_crud(redis: RedisConnectionDep) -> LobbyCRUD:
    return LobbyCRUD(redis)

def get_player_crud(redis: RedisConnectionDep) -> PlayerCRUD:
    return PlayerCRUD(redis)

def get_user_crud(db: PgSessionDep) -> UserCRUD:
    return UserCRUD(db)

LobbyCRUDDep = Annotated[LobbyCRUD, Depends(get_lobby_crud)]
PlayerCRUDDep = Annotated[PlayerCRUD, Depends(get_player_crud)]
UserCRUDDep = Annotated[UserCRUD, Depends(get_user_crud)]