import logging

from typing import Annotated
from fastapi import APIRouter, Path, Query, WebSocket, WebSocketDisconnect, WebSocketException

from api.deps import LobbyManagerDep, PlayerServiceDep, LobbyServiceDep
from models import Event, EventType
from exceptions import NotFoundError
from core.config import settings

logger = logging.getLogger(settings.LOGGER_NAME)

router = APIRouter(prefix="/game", tags=["game"])


@router.websocket("/ws/{lobby_id}")
async def lobby_websocket(
    websocket: WebSocket,
    lobby_id: Annotated[str, Path()],
    player_id: Annotated[str, Query()],
    lobby_manager: LobbyManagerDep,
    player_service: PlayerServiceDep,
    lobby_service: LobbyServiceDep
):
    manager = lobby_manager.get_connection_manager(lobby_id)
    logger.info("WebSocket connection attempt: lobby_id=%s, player_id=%s", lobby_id, player_id)
    await manager.connect(websocket)

    try:
        player = player_service.find_player(player_id)
    except NotFoundError as e:
        logger.error("Error finding player: %s", e)
        raise WebSocketException(code=1008, reason=str(e))

    if not player:
        logger.warning("Player not found in lobby: player_id=%s", player_id)
        raise WebSocketException(code=1008, reason=f"Player with id={player_id} not found in lobby")

    logger.info("Player connected: %s", player.model_dump())
    join_event = Event(event=EventType.JOIN, data={"player": player}).model_dump()
    logger.info("Join event created: %s", join_event)
    await manager.broadcast_json(join_event, exclude=websocket)

    try:
        while True:
            # Temporary message exchange
            data = await manager.receive_text(websocket)
            await manager.unicast_text(f"You sent message: {data}", websocket)
            await manager.broadcast_text(f"Player {player_id} sent message: {data}", exclude=websocket)
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected: player_id=%s", player_id)
        manager.disconnect(websocket)
        lobby_service.leave_lobby(lobby_id, player_id)
        leave_event = Event(event=EventType.LEAVE, data={"player": player}).model_dump()
        await manager.broadcast_json(leave_event)
        lobby_manager.cleanup(lobby_id)

