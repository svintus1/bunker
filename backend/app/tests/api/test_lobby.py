import uuid

from fastapi.testclient import TestClient

from app.models import Lobby, User, Player
from app.core.config import settings


def test_create_lobby_success(api_client: TestClient, mock_lobby_crud, mock_user_crud, mock_player_crud):
    creator_id = uuid.uuid4()
    player_pk = "player-pk"
    user = User(name="testuser", id=creator_id)
    player = Player(user=user, pk=player_pk)
    # The lobby is created with empty player_ids, then updated with the creator's player_pk
    lobby_created = Lobby(name="testlobby", creator_id=creator_id, status="waiting", player_ids=[])

    # Set up mocks in the order the service expects
    mock_user_crud.get_user_by_id.return_value = user
    mock_player_crud.create_player.return_value = player
    mock_lobby_crud.create_lobby.return_value = lobby_created
    mock_lobby_crud.update_lobby.return_value = True

    lobby_in = {"name": "testlobby", "creator_id": str(creator_id)}
    response = api_client.post(f"{settings.API_STR}/lobby/create", json=lobby_in)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "testlobby"
    assert str(data["creator_id"]) == str(creator_id)
    assert player_pk in data["player_ids"]

def test_join_lobby_success(api_client, mock_lobby_crud, mock_user_crud, mock_player_crud):
    lobby_id = "lobby-uuid"
    user_id = uuid.uuid4()
    creator_id=uuid.uuid4()
    user = User(name="testuser", id=user_id)
    player = Player(user=user, pk="player-pk")
    lobby = Lobby(name="testlobby", creator_id=creator_id, status="waiting", player_ids=["creator-pk"])

    mock_user_crud.get_user_by_id.return_value = user
    mock_player_crud.create_player.return_value = player
    mock_lobby_crud.get_lobby.return_value = lobby
    mock_player_crud.get_player.return_value = player

    response = api_client.post(f"{settings.API_STR}/lobby/join/{lobby_id}", json=str(user_id))
    assert response.status_code == 200

def test_join_lobby_user_not_found(api_client, mock_user_crud):
    lobby_id = "lobby-uuid"
    user_id = uuid.uuid4()

    mock_user_crud.get_user_by_id.return_value = None

    response = api_client.post(f"{settings.API_STR}/lobby/join/{lobby_id}", json=str(user_id))
    assert response.status_code == 400
    assert response.json()["detail"] == "The user with this ID is not found"

def test_join_lobby_player_creation_failed(api_client, mock_user_crud, mock_player_crud):
    lobby_id = "lobby-uuid"
    user_id = uuid.uuid4()
    user = User(name="testuser", id=user_id)

    mock_user_crud.get_user_by_id.return_value = user
    mock_player_crud.create_player.return_value = None

    response = api_client.post(f"{settings.API_STR}/lobby/join/{lobby_id}", json=str(user_id))
    assert response.status_code == 500
    assert "Failed to create player from user" in response.json()["detail"]

def test_join_lobby_join_failed(api_client, mock_user_crud, mock_player_crud):
    lobby_id = "lobby-uuid"
    user_id = uuid.uuid4()
    user = User(name="testuser", id=user_id)
    player = Player(user=user, pk="player-pk")

    mock_user_crud.get_user_by_id.return_value = user
    mock_player_crud.create_player.return_value = player

    response = api_client.post(f"{settings.API_STR}/lobby/join/{lobby_id}", json=str(user_id))
    assert response.status_code == 500
    assert "Failed to join lobby" in response.json()["detail"]
