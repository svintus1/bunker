import uuid
import pytest

from models import Lobby, LobbyCreate, Player, User
from services.lobby import LobbyService
from exceptions import NotFoundError, CreationError, LobbyStatusError, AlreadyInLobbyError

@pytest.fixture
def lobby_service(mock_lobby_crud, mock_player_crud, mock_user_crud):
    return LobbyService(lobbies=mock_lobby_crud, players=mock_player_crud, users=mock_user_crud)

def test_create_lobby(lobby_service, mock_lobby_crud):
    creator_id = uuid.uuid4()
    player_id = "player-pk"
    lobby_in = LobbyCreate(name="testlobby", creator_id=creator_id)
    lobby = Lobby(**lobby_in.model_dump(), status="waiting", player_ids=[player_id])
    mock_lobby_crud.create_lobby.return_value = lobby

    result = lobby_service.create_lobby(lobby_in)
    assert result == lobby
    mock_lobby_crud.create_lobby.assert_called_once_with(lobby_in)

def test_join_lobby_success(lobby_service, mock_lobby_crud, mock_player_crud):
    lobby_id = "lobby-pk"
    player_id = "player-pk"
    creator_id = uuid.uuid4()
    lobby = Lobby(name="l", creator_id=creator_id, status="waiting", player_ids=[], pk=lobby_id)
    player = Player(user=User(name="n", id=creator_id), lobby_id=None, pk=player_id)
    mock_lobby_crud.get_lobby.return_value = lobby
    mock_player_crud.get_player.return_value = player

    updated_lobby = lobby_service.join_lobby(lobby_id, player_id)

    assert player.lobby_id == lobby_id
    assert player_id in updated_lobby.player_ids

def test_join_lobby_already_in(lobby_service, mock_lobby_crud, mock_player_crud):
    lobby_id = "lobby-pk"
    player_id = "player-pk"
    creator_id = uuid.uuid4()
    lobby = Lobby(name="l", creator_id=creator_id, status="waiting", player_ids=[player_id], pk=lobby_id)
    player = Player(user=User(name="n", id=creator_id), lobby_id=lobby_id, pk=player_id)
    mock_lobby_crud.get_lobby.return_value = lobby
    mock_player_crud.get_player.return_value = player

    with pytest.raises(AlreadyInLobbyError):
        lobby_service.join_lobby(lobby_id, player_id)

def test_join_lobby_not_waiting(lobby_service, mock_lobby_crud, mock_player_crud):
    lobby_id = "lobby-pk"
    player_id = "player-pk"
    creator_id = uuid.uuid4()
    lobby = Lobby(name="l", creator_id=creator_id, status="playing", player_ids=[])
    player = Player(user=User(name="n", id=uuid.uuid4()), lobby_id=None)
    mock_lobby_crud.get_lobby.return_value = lobby
    mock_player_crud.get_player.return_value = player

    with pytest.raises(LobbyStatusError):
        lobby_service.join_lobby(lobby_id, player_id)

def test_leave_lobby_success(lobby_service, mock_lobby_crud, mock_player_crud):
    lobby_id = "lobby-pk"
    player_id = "player-pk"
    creator_id = uuid.uuid4()
    lobby = Lobby(name="l", creator_id=creator_id, status="waiting", player_ids=[player_id], pk=lobby_id)
    player = Player(user=User(name="n", id=creator_id), lobby_id=lobby_id, pk=player_id)
    mock_lobby_crud.get_lobby.return_value = lobby
    mock_player_crud.get_player.return_value = player

    updated_lobby = lobby_service.leave_lobby(lobby_id, player_id)

    assert player.lobby_id is None
    assert player_id not in updated_lobby.player_ids

def test_leave_lobby_not_found(lobby_service, mock_lobby_crud, mock_player_crud):
    mock_lobby_crud.get_lobby.return_value = None
    mock_player_crud.get_player.return_value = None
    with pytest.raises(NotFoundError):
        lobby_service.leave_lobby("lobby", "player")

def test_delete_lobby_success(lobby_service, mock_lobby_crud, mock_player_crud):
    lobby_id = "lobby-pk"
    player_id = "player-pk"
    creator_id = uuid.uuid4()
    lobby = Lobby(name="l", creator_id=creator_id, status="waiting", player_ids=[player_id], pk=lobby_id)
    player = Player(user=User(name="n", id=creator_id), lobby_id=lobby_id, pk=player_id)
    mock_lobby_crud.get_lobby.return_value = lobby
    mock_lobby_crud.delete_lobby.return_value = True
    mock_player_crud.get_player.return_value = player
    mock_player_crud.delete_player.return_value = True

    success = lobby_service.delete_lobby(lobby_id)

    assert success is True
