import uuid
from typing import Annotated, Any
from fastapi import APIRouter, Body, HTTPException

from app.api.deps import LobbyServiceDep, PlayerCRUDDep, UserCRUDDep
from app.models import LobbyCreate, LobbyOutput

router = APIRouter(prefix="/lobby", tags=["lobby"])

@router.post("/create", description="Create new lobby. Accepts lobby `name` and `creator_id`.")
def create_lobby(
    name: Annotated[str, Body(title="Lobby name", max_length=255)],
    creator_id: Annotated[uuid.UUID, Body(title="Creator user UUID")],
    lobby_service: LobbyServiceDep
) -> LobbyOutput:
    lobby_in = LobbyCreate(name=name, creator_id=creator_id)
    lobby = lobby_service.create_lobby(lobby_in)
    lobby_out = LobbyOutput(**lobby.model_dump(), id=lobby.id)
    return lobby_out


@router.post("/join/", response_model=dict[str, Any],
             description="Join existing lobby. Accepts `lobby_id` and `user_id` of user that wants to join.")
def join_lobby(
    lobby_id: Annotated[str, Body()],
    user_id: Annotated[uuid.UUID, Body(title="User UUID")],
    lobby_service: LobbyServiceDep,
    player_crud: PlayerCRUDDep,
    user_crud: UserCRUDDep,
) -> dict[str, Any]:
    user = user_crud.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=400,
                             detail="The user with this ID is not found")

    try:
        player = lobby_service.find_player_by_user_id(lobby_id, user_id)
    except RuntimeError as e:
        raise HTTPException(status_code=400,
                            detail=str(e))
    if player:
        raise HTTPException(status_code=400,
                            detail="The user is already in this lobby")

    player = player_crud.create_player(user)
    if not player:
        raise HTTPException(status_code=500,
                            detail="Failed to create player from user")
    lobby = lobby_service.join_lobby(lobby_id, player.id)
    if not lobby:
        raise HTTPException(status_code=500,
                            detail="Failed to join lobby")
    lobby_out = LobbyOutput(**lobby.model_dump(), id=lobby.id)
    return {"lobby": lobby_out, "player_id": player.id}


