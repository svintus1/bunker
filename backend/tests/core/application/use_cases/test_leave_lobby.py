import uuid

import pytest

from src.core.domain.models import User, Lobby
from src.core.application.exceptions import UserNotFound, LobbyNotFound, UserNotInLobby


@pytest.mark.asyncio
async def test_leave_lobby_single_user_success(user_repository_mock, lobby_repository_mock):
    owner_user = User(name="John Doe")
    lobby = Lobby(name="Test Lobby", owner_user_id=owner_user.id)

    user_repository_mock.get_user_by_id(owner_user.id).return_value = owner_user
    lobby_repository_mock.get_lobby_by_id(lobby.id).return_value = lobby

    use_case = LeaveLobby(lobby_repository=lobby_repository_mock, user_repository=user_repository_mock)

    lobby_after_leave = await use_case.execute(user_id=owner_user.id, lobby_id=lobby.id)

    assert lobby_after_leave is None

@pytest.mark.asyncio
async def test_leave_lobby_multiple_users_non_owner_leaves_success(user_repository_mock, lobby_repository_mock):
    owner_user = User(name="John Doe")
    another_user = User(name="Jane Doe")
    lobby = Lobby(name="Test Lobby", owner_user_id=owner_user.id)
    lobby.user_ids.append(another_user.id)

    user_repository_mock.get_user_by_id(another_user.id).return_value = another_user
    lobby_repository_mock.get_lobby_by_id(lobby.id).return_value = lobby

    use_case = LeaveLobby(lobby_repository=lobby_repository_mock, user_repository=user_repository_mock)

    lobby_after_leave = await use_case.execute(user_id=another_user.id, lobby_id=lobby.id)

    assert lobby_after_leave is not None
    assert lobby_after_leave.owner_user_id == owner_user.id
    assert another_user.id not in lobby_after_leave.user_ids

@pytest.mark.asyncio
async def test_leave_lobby_multiple_users_owner_leaves_success(user_repository_mock, lobby_repository_mock):
    owner_user = User(name="John Doe")
    another_user = User(name="Jane Doe")
    lobby = Lobby(name="Test Lobby", owner_user_id=owner_user.id)
    lobby.user_ids.append(another_user.id)

    user_repository_mock.get_user_by_id(owner_user.id).return_value = owner_user
    lobby_repository_mock.get_lobby_by_id(lobby.id).return_value = lobby

    use_case = LeaveLobby(lobby_repository=lobby_repository_mock, user_repository=user_repository_mock)

    lobby_after_leave = await use_case.execute(user_id=owner_user.id, lobby_id=lobby.id)

    assert lobby_after_leave is not None
    assert lobby_after_leave.owner_user_id == another_user.id
    assert owner_user.id not in lobby_after_leave.user_ids

@pytest.mark.asyncio
async def test_leave_lobby_user_not_found(user_repository_mock, lobby_repository_mock):
    user = User(name="John Doe")
    lobby = Lobby(name="Test Lobby", owner_user_id=uuid.uuid4())

    user_repository_mock.get_user_by_id(user.id).return_value = None
    lobby_repository_mock.get_lobby_by_id(lobby.id).return_value = lobby

    use_case = LeaveLobby(lobby_repository=lobby_repository_mock, user_repository=user_repository_mock)

    with pytest.raises(UserNotFound, match="User does not exist"):
        await use_case.execute(user_id=user.id, lobby_id=lobby.id)

@pytest.mark.asyncio
async def test_leave_lobby_lobby_not_found(user_repository_mock, lobby_repository_mock):
    user = User(name="John Doe")
    lobby = Lobby(name="Test Lobby", owner_user_id=uuid.uuid4())

    user_repository_mock.get_user_by_id(user.id).return_value = user
    lobby_repository_mock.get_lobby_by_id(lobby.id).return_value = None

    use_case = LeaveLobby(lobby_repository=lobby_repository_mock, user_repository=user_repository_mock)

    with pytest.raises(LobbyNotFound, match="Lobby does not exist"):
        await use_case.execute(user_id=user.id, lobby_id=lobby.id)

@pytest.mark.asyncio
async def test_leave_lobby_user_not_in_lobby(user_repository_mock, lobby_repository_mock):
    user = User(name="John Doe")
    lobby = Lobby(name="Test Lobby", owner_user_id=uuid.uuid4())

    user_repository_mock.get_user_by_id(user.id).return_value = user
    lobby_repository_mock.get_lobby_by_id(lobby.id).return_value = lobby

    use_case = LeaveLobby(lobby_repository=lobby_repository_mock, user_repository=user_repository_mock)

    with pytest.raises(UserNotInLobby, match="User not in this lobby"):
        await use_case.execute(user_id=user.id, lobby_id=lobby.id)