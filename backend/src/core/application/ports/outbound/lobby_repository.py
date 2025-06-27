import uuid
from typing import Protocol

from src.core.domain.models import Lobby


class LobbyRepository(Protocol):
    """Interface for lobby repository operations."""

    async def get_lobby_by_id(self, lobby_id: uuid.UUID) -> Lobby | None:
        """Retrieve a lobby by its ID."""
        raise NotImplementedError

    async def create_lobby(self, lobby: Lobby) -> None:
        """Create a new lobby with the provided data."""
        raise NotImplementedError

    async def update_lobby(self, lobby: Lobby) -> None:
        """Update an existing lobby's data."""
        raise NotImplementedError

    async def delete_lobby(self, lobby_id: uuid.UUID) -> None:
        """Delete a lobby by its ID."""
        raise NotImplementedError