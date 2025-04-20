from fastapi import APIRouter, Depends

from app.api.deps import ServiceLobbyServiceDep
from app.models import LobbyCreate, Lobby

router = APIRouter(prefix="/lobby", tags=["lobby"])

@router.post("/create")
async def create_lobby(
    lobby_in: LobbyCreate,
    lobby_service: ServiceLobbyServiceDep
) -> Lobby:
    return await lobby_service.create_lobby(lobby_in)


@router.post("/join/{lobby_id}")
async def join_lobby(
    lobby_id: str,
    player_id: str,
    lobby_service: ServiceLobbyServiceDep
) -> Lobby:
    return await lobby_service.join_lobby