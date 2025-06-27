import uuid

import pytest

from src.core.application.exceptions import UserNotFound, LobbyNotFound, GameAlreadyStarted, UserAlreadyInLobby
from src.core.domain.models import User, Lobby
from src.core.application.use_cases.join_lobby import JoinLobby
from src.core.domain.common.enums import LobbyStatus


@pytest.mark.asyncio
async def test_join_lobby_success(user_repository_mock, lobby_repository_mock):
    creator_user_id = uuid.uuid4()
    lobby_id = uuid.uuid4()
    creator_user = User(id=creator_user_id, name="John Doe")
    joining_user = User(id=uuid.uuid4(), name="Jane Doe")
    lobby = Lobby(id=lobby_id, name="Test Lobby", creator_user_id=creator_user.id, user_ids=[creator_user.id], status=LobbyStatus.WAITING)

    user_repository_mock.get_user_by_id.return_value = joining_user
    lobby_repository_mock.get_lobby_by_id.return_value = lobby

    use_case = JoinLobby(lobby_repository=lobby_repository_mock, user_repository=user_repository_mock)

    lobby_after_join = await use_case.execute(user_id=joining_user.id, lobby_id=lobby_id)

    assert lobby_after_join == lobby
    assert joining_user.id in lobby_after_join.user_ids
    lobby_repository_mock.get_lobby_by_id.assert_called_once_with(lobby_id)
    lobby_repository_mock.update_lobby.assert_called_once_with(lobby)

@pytest.mark.asyncio
async def test_join_lobby_lobby_not_found(user_repository_mock, lobby_repository_mock):
    user_id = uuid.uuid4()
    user = User(id=user_id, name="John Doe")

    user_repository_mock.get_user_by_id.return_value = user
    lobby_repository_mock.get_lobby_by_id.return_value = None

    use_case = JoinLobby(lobby_repository=lobby_repository_mock, user_repository=user_repository_mock)

    with pytest.raises(LobbyNotFound, match="Lobby does not exist"):
        await use_case.execute(user_id=user_id, lobby_id=uuid.uuid4())

@pytest.mark.asyncio
async def test_join_lobby_user_not_found(user_repository_mock, lobby_repository_mock):
    user_id = uuid.uuid4()
    lobby_id = uuid.uuid4()

    lobby = Lobby(id=lobby_id, name="Test Lobby", creator_user_id=user_id, user_ids=[], status=LobbyStatus.WAITING)

    user_repository_mock.get_user_by_id.return_value = None
    lobby_repository_mock.get_lobby_by_id.return_value = lobby

    use_case = JoinLobby(lobby_repository=lobby_repository_mock, user_repository=user_repository_mock)

    with pytest.raises(UserNotFound, match="User does not exist"):
        await use_case.execute(user_id=user_id, lobby_id=lobby_id)

@pytest.mark.asyncio
async def test_join_lobby_game_already_started(user_repository_mock, lobby_repository_mock):
    user_id = uuid.uuid4()
    lobby_id = uuid.uuid4()
    user = User(id=user_id, name="John Doe")
    lobby = Lobby(id=lobby_id, name="Test Lobby", creator_user_id=user_id, user_ids=[user_id], status=LobbyStatus.IN_GAME)

    user_repository_mock.get_user_by_id.return_value = user
    lobby_repository_mock.get_lobby_by_id.return_value = lobby

    use_case = JoinLobby(lobby_repository=lobby_repository_mock, user_repository=user_repository_mock)

    with pytest.raises(GameAlreadyStarted, match="Game has already started"):
        await use_case.execute(user_id=user_id, lobby_id=lobby_id)

@pytest.mark.asyncio
async def test_join_lobby_user_already_in_lobby(user_repository_mock, lobby_repository_mock):
    user_id = uuid.uuid4()
    lobby_id = uuid.uuid4()
    user = User(id=user_id, name="John Doe")
    lobby = Lobby(id=lobby_id, name="Test Lobby", creator_user_id=user_id, user_ids=[user_id], status=LobbyStatus.WAITING)

    user_repository_mock.get_user_by_id.return_value = user
    lobby_repository_mock.get_lobby_by_id.return_value = lobby

    use_case = JoinLobby(lobby_repository=lobby_repository_mock, user_repository=user_repository_mock)

    with pytest.raises(UserAlreadyInLobby, match="User is already in the lobby"):
        await use_case.execute(user_id=user_id, lobby_id=lobby_id)