from src.core.domain.models import Lobby
from src.core.application.ports.outbound.lobby_repository import LobbyRepository
from src.core.application.ports.outbound.user_repository import UserRepository
from src.core.application.exceptions import UserNotFound


class CreateLobby:
    def __init__(self, lobby_repository: LobbyRepository, user_repository: UserRepository):
        self.lobby_repository = lobby_repository
        self.user_repository = user_repository

    async def execute(self, name: str, creator_id: str) -> Lobby:
        """Create a new lobby with the provided data."""
        if not name:
            raise ValueError("Lobby name cannot be empty")

        creator = await self.user_repository.get_user_by_id(creator_id)
        if not creator:
            raise UserNotFound("Creator user does not exist")

        lobby = Lobby(name=name, creator_user_id=creator.id, user_ids=[creator.id])
        await self.lobby_repository.create_lobby(lobby)
        return lobby 