import uuid

import pytest
from unittest.mock import AsyncMock

from src.core.application.exceptions import UserNotFound
from src.core.domain.models import User
from src.core.application.use_cases.create_lobby import CreateLobby
from src.core.domain.common.enums import LobbyStatus


@pytest.mark.asyncio
async def test_create_lobby_success(user_repository_mock, lobby_repository_mock):
    """Test successful creation of a lobby."""
    user_id = uuid.uuid4()
    lobby_name = "Test Lobby"
    user = User(id=user_id, name="John Doe")

    user_repository_mock.get_user_by_id.return_value = user

    use_case = CreateLobby(lobby_repository=lobby_repository_mock, user_repository=user_repository_mock)
    
    lobby = await use_case.execute(name=lobby_name, creator_id=user_id)
    
    assert lobby.name == lobby_name
    assert lobby.creator_user_id == user_id
    assert len(lobby.user_ids) == 1
    assert lobby.user_ids[0] == user_id
    assert lobby.status == LobbyStatus.WAITING
    assert isinstance(lobby.id, uuid.UUID)
    lobby_repository_mock.create_lobby.assert_called_once_with(lobby)

@pytest.mark.asyncio
async def test_create_lobby_empty_name(user_repository_mock, lobby_repository_mock):
    """Test creation of a lobby with an empty name."""
    user_id = uuid.uuid4()
    use_case = CreateLobby(lobby_repository=lobby_repository_mock, user_repository=user_repository_mock)
    
    with pytest.raises(ValueError, match="Lobby name cannot be empty"):
        await use_case.execute(name="", creator_id=user_id)

@pytest.mark.asyncio
async def test_create_lobby_user_not_found(user_repository_mock, lobby_repository_mock):
    """Test creation of a lobby with a non-existent user."""
    user_id = uuid.uuid4()
    user_repository_mock.get_user_by_id.return_value = None
    use_case = CreateLobby(lobby_repository=lobby_repository_mock, user_repository=user_repository_mock)
    
    with pytest.raises(UserNotFound, match="Creator user does not exist"):
        await use_case.execute(name="Test Lobby", creator_id=user_id)