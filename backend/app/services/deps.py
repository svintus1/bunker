from typing import Annotated
from fastapi import Depends
from redis import Redis
from app.crud import LobbyCRUD, PlayerCRUD
from app.core.database import RedisConnectionDep

def get_lobby_crud_service(redis: RedisConnectionDep) -> LobbyCRUD:
    return LobbyCRUD(redis)

def get_player_crud_service(redis: RedisConnectionDep) -> PlayerCRUD:
    return PlayerCRUD(redis)

ServiceLobbyCRUDDep = Annotated[LobbyCRUD, Depends(get_lobby_crud_service)]
ServicePlayerCRUDDep = Annotated[PlayerCRUD, Depends(get_player_crud_service)]