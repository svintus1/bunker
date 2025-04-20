from typing import Annotated
from fastapi import Depends
from app.crud import UserCRUD, LobbyCRUD, PlayerCRUD
from app.core.database import PgSessionDep, RedisConnectionDep
from app.services.lobby import LobbyService


def get_user_crud(session: PgSessionDep) -> UserCRUD:
    return UserCRUD(session)


def get_lobby_crud(redis: RedisConnectionDep) -> LobbyCRUD:
    return LobbyCRUD(redis)


def get_player_crud(redis: RedisConnectionDep) -> PlayerCRUD:
    return PlayerCRUD(redis)


def get_lobby_service(
    lobbies: Annotated[LobbyCRUD, Depends(get_lobby_crud)],
    players: Annotated[PlayerCRUD, Depends(get_player_crud)],
) -> LobbyService:
    return LobbyService(lobbies, players)


UserCRUDDep = Annotated[UserCRUD, Depends(get_user_crud)]
LobbyCRUDDep = Annotated[LobbyCRUD, Depends(get_lobby_crud)]
PlayerCRUDDep = Annotated[PlayerCRUD, Depends(get_player_crud)]
ServiceLobbyServiceDep = Annotated[LobbyService, Depends(get_lobby_service)]
