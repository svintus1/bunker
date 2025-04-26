import uuid
from typing import Annotated
from fastapi import APIRouter, Body, HTTPException

from app.api.deps import LobbyServiceDep, PlayerCRUDDep, UserCRUDDep
from app.models import LobbyCreate, Lobby

router = APIRouter(prefix="/lobby", tags=["lobby"])

@router.post("/create", description="Create new lobby. Accepts lobby `name` and `creator_id`.")
def create_lobby(
    name: Annotated[str, Body(title="Lobby name", max_length=255)],
    creator_id: Annotated[uuid.UUID, Body(title="Creator user UUID")],
    lobby_service: LobbyServiceDep
) -> Lobby:
    lobby_in = LobbyCreate(name=name, creator_id=creator_id)
    return lobby_service.create_lobby(lobby_in)


@router.post("/join/", description="Join existing lobby. Accepts `lobby_id` and `user_id` of user that wants to join.")
def join_lobby(
    lobby_id: Annotated[str, Body()],
    user_id: Annotated[uuid.UUID, Body(title="User UUID")],
    lobby_service: LobbyServiceDep,
    player_crud: PlayerCRUDDep,
    user_crud: UserCRUDDep,
) -> Lobby:
    user = user_crud.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=400,
                             detail="The user with this ID is not found")
    player = player_crud.create_player(user)
    if not player:
        raise HTTPException(status_code=500,
                            detail="Failed to create player from user")
    lobby = lobby_service.join_lobby(lobby_id, player.pk)
    if not lobby:
        raise HTTPException(status_code=500,
                            detail="Failed to join lobby")
    return lobby