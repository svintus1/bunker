import uuid
from typing import Protocol

from domain.models import User


class UserRepository(Protocol):
    """Interface for user repository operations."""

    async def get_user_by_id(self, user_id: uuid.UUID) -> User | None:
        """Retrieve a user by their ID."""
        raise NotImplementedError

    async def create_user(self, user: User) -> None:
        """Create a new user with the provided data."""
        raise NotImplementedError

    async def update_user(self, user: User) -> None:
        """Update an existing user's data."""
        raise NotImplementedError

    async def delete_user(self, user_id: uuid.UUID) -> None:
        """Delete a user by their ID."""
        raise NotImplementedError