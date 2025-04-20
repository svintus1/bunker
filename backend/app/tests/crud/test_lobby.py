import pytest
import uuid

from app.crud import UserCRUD, LobbyCRUD
from app.models import UserCreate, LobbyCreate, Lobby
from app.tests.utils.utils import random_lower_string


def test_create_lobby(
    user_crud: UserCRUD,
    lobby_crud: LobbyCRUD,
) -> None:
    # Create a user first
    name = random_lower_string()
    user_in = UserCreate(name=name)
    user = user_crud.create_user(user_in)
    
    # Test lobby creation
    lobby_name = random_lower_string()
    lobby_in = LobbyCreate(name=lobby_name, creator_id=user.id)
    lobby = lobby_crud.create_lobby(lobby_in)
    
    assert lobby
    assert lobby.name == lobby_name
    assert lobby.creator_id == user.id
    assert lobby.status == "waiting"
    assert lobby.player_ids == [user.id]

def test_get_lobby(
    user_crud: UserCRUD,
    lobby_crud: LobbyCRUD,
) -> None:
    # Create user and lobby
    name = random_lower_string()
    user_in = UserCreate(name=name)
    user = user_crud.create_user(user_in)
    
    lobby_name = random_lower_string()
    lobby_in = LobbyCreate(name=lobby_name, creator_id=user.id)
    created_lobby = lobby_crud.create_lobby(lobby_in)
    
    # Test getting lobby by id
    retrieved_lobby = lobby_crud.get_lobby(created_lobby.pk)
    assert retrieved_lobby
    assert retrieved_lobby.pk == created_lobby.pk
    assert retrieved_lobby.name == lobby_name
    assert retrieved_lobby.creator_id == user.id

def test_update_lobby(
    user_crud: UserCRUD,
    lobby_crud: LobbyCRUD,
) -> None:
    # Create user and lobby
    name = random_lower_string()
    user_in = UserCreate(name=name)
    user = user_crud.create_user(user_in)
    
    lobby_name = random_lower_string()
    lobby_in = LobbyCreate(name=lobby_name, creator_id=user.id)
    lobby = lobby_crud.create_lobby(lobby_in)
    
    # Test updating lobby status
    lobby.status = "playing"
    success = lobby_crud.update_lobby(lobby)
    assert success
    
    # Verify update persisted
    updated_lobby = lobby_crud.get_lobby(lobby.pk)
    assert updated_lobby
    assert updated_lobby.status == "playing"

def test_delete_lobby(
    user_crud: UserCRUD,
    lobby_crud: LobbyCRUD,
) -> None:
    # Create user and lobby
    name = random_lower_string()
    user_in = UserCreate(name=name)
    user = user_crud.create_user(user_in)
    
    lobby_name = random_lower_string()
    lobby_in = LobbyCreate(name=lobby_name, creator_id=user.id)
    lobby = lobby_crud.create_lobby(lobby_in)
    
    # Test deleting lobby
    success = lobby_crud.delete_lobby(lobby)
    assert success
    
    # Verify lobby was deleted
    deleted_lobby = lobby_crud.get_lobby(lobby.pk)
    assert deleted_lobby is None
