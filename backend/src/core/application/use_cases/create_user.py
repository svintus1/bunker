from src.core.domain.models import User
from src.core.application.ports.outbound.user_repository import UserRepository


class CreateUser:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    async def execute(self, name: str) -> User:
        """Create a new user with the provided data."""
        if not name:
            raise ValueError("User name cannot be empty")

        user = User(name=name)
        await self.user_repository.create_user(user) 
        return user