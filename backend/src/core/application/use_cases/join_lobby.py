import uuid

from src.core.application.ports.outbound.lobby_repository import LobbyRepository
from src.core.application.ports.outbound.user_repository import UserRepository
from src.core.application.exceptions import UserNotFound, LobbyNotFound, GameAlreadyStarted, UserAlreadyInLobby
from src.core.domain.models.lobby import Lobby
from src.core.domain.common.enums import LobbyStatus



class JoinLobby:
    def __init__(self, lobby_repository: LobbyRepository, user_repository: UserRepository):
        self.lobby_repository = lobby_repository
        self.user_repository = user_repository

    async def execute(self, lobby_id: uuid.UUID, user_id: uuid.UUID) -> Lobby:
        """Join a lobby with the given ID."""
        user = await self.user_repository.get_user_by_id(user_id)
        if not user:
            raise UserNotFound("User does not exist")

        lobby = await self.lobby_repository.get_lobby_by_id(lobby_id)
        if not lobby:
            raise LobbyNotFound("Lobby does not exist")

        if lobby.status != LobbyStatus.WAITING:
            raise GameAlreadyStarted("Game has already started")
        
        if user_id in lobby.user_ids:
            raise UserAlreadyInLobby("User is already in the lobby")
        
        lobby.user_ids.append(user_id)
        await self.lobby_repository.update_lobby(lobby)
        return lobby