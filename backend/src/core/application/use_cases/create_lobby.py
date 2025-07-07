import uuid

from src.core.domain.models import Lobby
from src.core.application.ports.outbound.lobby_repository import LobbyRepository
from src.core.application.ports.outbound.user_repository import UserRepository
from src.core.application.exceptions import UserNotFound


class CreateLobby:
    def __init__(self, lobby_repository: LobbyRepository, user_repository: UserRepository):
        self.lobby_repository = lobby_repository
        self.user_repository = user_repository

    async def execute(self, name: str, owner_user_id: uuid.UUID) -> Lobby:
        """Create a new lobby with the provided data."""
        if not name:
            raise ValueError("Lobby name cannot be empty")

        owner_user = await self.user_repository.get_user_by_id(owner_user_id)
        if not owner_user:
            raise UserNotFound("Owner user does not exist")

        lobby = Lobby(name=name, owner_user_id=owner_user.id)
        await self.lobby_repository.create_lobby(lobby)
        return lobby 