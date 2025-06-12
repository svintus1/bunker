from typing import Annotated
from fastapi import Depends
from crud import UserCRUD, LobbyCRUD, PlayerCRUD
from core.database import PgSessionDep
from services.lobby import LobbyService
from services.player import PlayerService
from utils.connection_manager import ConnectionManager


def get_user_crud(session: PgSessionDep) -> UserCRUD:
    return UserCRUD(session)


def get_lobby_crud() -> LobbyCRUD:
    return LobbyCRUD()


def get_player_crud() -> PlayerCRUD:
    return PlayerCRUD()

UserCRUDDep = Annotated[UserCRUD, Depends(get_user_crud)]
LobbyCRUDDep = Annotated[LobbyCRUD, Depends(get_lobby_crud)]
PlayerCRUDDep = Annotated[PlayerCRUD, Depends(get_player_crud)]

def get_lobby_service(
    lobbies: Annotated[LobbyCRUD, Depends(get_lobby_crud)],
    players: Annotated[PlayerCRUD, Depends(get_player_crud)],
    users: Annotated[UserCRUD, Depends(get_user_crud)]
) -> LobbyService:
    return LobbyService(lobbies, players, users)

def get_player_service(
    players: PlayerCRUDDep,
    users: UserCRUDDep,
) -> PlayerService:
    return PlayerService(players, users)

LobbyServiceDep = Annotated[LobbyService, Depends(get_lobby_service)]
PlayerServiceDep = Annotated[PlayerService, Depends(get_player_service)]


manager = ConnectionManager() # Same connection manager for all lobbies
def get_connection_manager():
    return manager

ConnectionManagerDep = Annotated[ConnectionManager, Depends(get_connection_manager)]