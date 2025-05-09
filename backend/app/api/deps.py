from typing import Annotated
from fastapi import Depends, WebSocket
from app.crud import UserCRUD, LobbyCRUD, PlayerCRUD
from app.core.database import PgSessionDep
from app.services.lobby import LobbyService
from app.services.player import PlayerService


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


class ConnectionManager:
    def __init__(self):
        self.active_connections: set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def unicast_json(self, data: dict, websocket: WebSocket):
        await websocket.send_json(data)

    async def unicast_text(self, data: str, websocket: WebSocket):
        await websocket.send_text(data)

    def __parse_exclude__(self, exclude: WebSocket | set[WebSocket] | None = None) -> set[WebSocket]:
        match exclude:
            case None:
                exclude_set = set()
            case WebSocket():
                exclude_set = {exclude}
            case set():
                exclude_set = exclude
            case _:
                raise TypeError("exclude must be a WebSocket, a set of WebSockets, or None")
        return exclude_set

    async def broadcast_json(self, data: dict, exclude: WebSocket | set[WebSocket] | None = None):
        destinations = self.active_connections.copy().difference(self.__parse_exclude__(exclude))
        for connection in destinations:
            await connection.send_json(data)

    async def broadcast_text(self, data: str, exclude: WebSocket | set[WebSocket] | None = None):
        destinations = self.active_connections.copy().difference(self.__parse_exclude__(exclude))
        for connection in destinations:
            await connection.send_text(data)

manager = ConnectionManager()
def get_connection_manager():
    return manager


ConnectionManagerDep = Annotated[ConnectionManager, Depends(get_connection_manager)]