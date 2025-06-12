from collections import defaultdict
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, set[WebSocket]] = defaultdict(set)

    async def connect(self, lobby_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[lobby_id].add(websocket)

    def disconnect(self, lobby_id: str, websocket: WebSocket):
        self.active_connections[lobby_id].remove(websocket)

    async def unicast_json(self, data: dict, websocket: WebSocket):
        await websocket.send_json(data)

    async def unicast_text(self, data: str, websocket: WebSocket):
        await websocket.send_text(data)

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

    async def broadcast_json(self, data: dict, lobby_id: str, exclude: WebSocket | set[WebSocket] | None = None):
        destinations = self.active_connections[lobby_id].copy().difference(self._parse_exclude(exclude))
        for connection in destinations:
            await connection.send_json(data)

    async def broadcast_text(self, data: str, lobby_id: str, exclude: WebSocket | set[WebSocket] | None = None):
        destinations = self.active_connections[lobby_id].copy().difference(self._parse_exclude(exclude))
        for connection in destinations:
            await connection.send_text(data)