from unittest.mock import AsyncMock

from src.core.application.ports.outbound.user_repository import UserRepository
from src.core.application.ports.outbound.lobby_repository import LobbyRepository
from src.core.application.ports.outbound.property_repository import PropertyRepository


class UserRepositoryMock(UserRepository):
    def __init__(self):
        self.create_user = AsyncMock(return_value=None)
        self.get_user_by_id = AsyncMock()
        self.update_user = AsyncMock(return_value=None)
        self.delete_user = AsyncMock(return_value=None)


class LobbyRepositoryMock(LobbyRepository):
    def __init__(self):
        self.create_lobby = AsyncMock(return_value=None)
        self.get_lobby_by_id = AsyncMock()
        self.update_lobby = AsyncMock(return_value=None)
        self.delete_lobby = AsyncMock(return_value=None)


class PropertyRepositoryMock(PropertyRepository):
    def __init__(self):
        self.get_all_properties_by_category = AsyncMock()
        self.get_property_by_id = AsyncMock()