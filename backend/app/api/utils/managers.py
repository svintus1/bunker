import logging
from fastapi import WebSocket

from core.config import settings

logger = logging.getLogger(settings.LOGGER_NAME)

class ConnectionManager:
    def __init__(self):
        self.connections: set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.connections.remove(websocket)

    async def unicast_json(self, data: dict, websocket: WebSocket):
        await websocket.send_json(data)

    async def unicast_text(self, data: str, websocket: WebSocket):
        await websocket.send_text(data)

    async def receive_text(self, websocket: WebSocket) -> str:
        text = await websocket.receive_text()
        logger.debug("Received text from %s: %s", websocket.client, text)
        return text

    async def receive_json(self, websocket: WebSocket) -> dict:
        json_data = await websocket.receive_json()
        logger.debug("Received JSON from %s: %s", websocket.client, json_data)
        return json_data

    def _parse_exclude(self, exclude: WebSocket | set[WebSocket] | None = None) -> set[WebSocket]:
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
        destinations = self.connections.copy().difference(self._parse_exclude(exclude))
        for connection in destinations:
            await connection.send_json(data)

    async def broadcast_text(self, data: str, exclude: WebSocket | set[WebSocket] | None = None):
        destinations = self.connections.copy().difference(self._parse_exclude(exclude))
        for connection in destinations:
            await connection.send_text(data)


class LobbyManager():
    lobbies: dict[str, ConnectionManager] = {}

    def get_connection_manager(self, lobby_id: str) -> ConnectionManager:
        if lobby_id not in self.lobbies:
            self.lobbies[lobby_id] = ConnectionManager()
        return self.lobbies[lobby_id]

    def cleanup(self, lobby_id: str):
        if not self.lobbies[lobby_id].connections:
            del self.lobbies[lobby_id]