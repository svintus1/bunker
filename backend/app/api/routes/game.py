import uuid
import logging

from typing import Annotated
from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect, WebSocketException

from app.api.deps import ConnectionManagerDep, LobbyServiceDep
from app.models import Event


logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


router = APIRouter(prefix="/game", tags=["game"])


@router.websocket("/ws/")
async def lobby_websocket(
    websocket: WebSocket,
    lobby_id: Annotated[str, Query()],
    user_id: Annotated[uuid.UUID, Query()],
    lobby_service: LobbyServiceDep,
    manager: ConnectionManagerDep
):
    logger.info("WebSocket connection attempt: lobby_id=%s, user_id=%s", lobby_id, user_id)
    await manager.connect(websocket)

    try:
        player = lobby_service.find_player_by_user_id(lobby_id, user_id)
    except RuntimeError as e:
        logger.error("Error finding player: %s", e)
        raise WebSocketException(code=1008, reason=str(e))

    if not player:
        logger.warning("Player not found in lobby: user_id=%s", user_id)
        raise WebSocketException(code=1008, reason=f"User with id={user_id} not found in lobby")

    user = player.user
    logger.info("User connected: %s", user.model_dump())
    join_event = Event(event="join", data={"user": user}).model_dump()
    logger.info("Join event created: %s", join_event)
    await manager.broadcast_json(join_event, exclude=websocket)

    try:
        while True:
            data = await websocket.receive_text()
            logger.debug("Received message from %s: %s", user_id, data)
            await manager.unicast_text(f"You sent message: {data}", websocket)
            await manager.broadcast_text(f"User {user_id} sent message: {data}", exclude=websocket)
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected: user_id=%s", user_id)
        manager.disconnect(websocket)
        leave_event = Event(event="leave", data={"user": user}).model_dump()
        await manager.broadcast_json(leave_event)

