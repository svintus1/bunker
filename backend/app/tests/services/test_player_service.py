import pytest

from app.models import User, Player
from app.services.player import PlayerService

@pytest.fixture
def player_service(mock_player_crud, mock_user_crud):
    return PlayerService(mock_player_crud, mock_user_crud)

def test_create_player_success(player_service, mock_player_crud):
    user = User(name="test", id="user-uuid")
    player = Player(user=user)
    mock_player_crud.create_player.return_value = player

    result = player_service.create_player(user)
    assert result == player
    mock_player_crud.create_player.assert_called_once_with(user)

def test_create_player_failure(player_service, mock_player_crud):
    user = User(name="test", id="user-uuid")
    mock_player_crud.create_player.return_value = None

    with pytest.raises(RuntimeError):
        player_service.create_player(user)
