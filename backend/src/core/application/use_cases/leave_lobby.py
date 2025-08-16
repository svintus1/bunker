import uuid

from src.core.application.ports.outbound.lobby_repository import LobbyRepository
from src.core.application.ports.outbound.user_repository import UserRepository
from src.core.application.exceptions import UserNotFound, UserNotInLobby, LobbyNotFound
from src.core.domain.models import Lobby, User


class LeaveLobby:
    def __init__(self, lobby_repository: LobbyRepository, user_repository: UserRepository):
        self.lobby_repository = lobby_repository
        self.user_repository = user_repository

    async def execute(self, lobby_id: uuid.UUID, user_id: uuid.UUID) -> Lobby | None:
        """Leave a lobby with the given ID.""" 
        user = await self.user_repository.get_user_by_id(user_id)
        if not user:
            raise UserNotFound("User does not exist")
        
        lobby = await self.lobby_repository.get_lobby_by_id(lobby_id)
        if not lobby:
            raise LobbyNotFound("Lobby does not exist")

        if user.id not in lobby.user_ids:
            raise UserNotInLobby("User not in this lobby")
        
        lobby.user_ids.remove(user.id)

        # Check if it was the last member
        if not lobby.user_ids:
            await self.lobby_repository.delete_lobby(lobby.id)
            return None
        
        # Owner was deleted: transfer ownership to next user
        if lobby.owner_user_id not in lobby.user_ids:
            lobby.owner_user_id = lobby.user_ids[0]

        await self.lobby_repository.update_lobby(lobby)
        return lobby
        
        