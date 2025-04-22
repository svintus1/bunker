import uuid

from fastapi.testclient import TestClient
from unittest.mock import MagicMock

from app.models import User, UserCreate
from app.core.config import settings

def test_create_user_success(api_client: TestClient, mock_user_crud):
    """Test successful user creation."""
    user_id = uuid.uuid4()
    name = "testuser"
    user = User(name=name, id=user_id)
    mock_user_crud.get_user_by_name.return_value = None
    mock_user_crud.create_user.return_value = user

    response = api_client.post(
        f"{settings.API_STR}/users/create",
        json={"name": "testuser"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == name
    assert data["id"] == str(user_id)
    mock_user_crud.get_user_by_name.assert_called_once_with(name=name)
    mock_user_crud.create_user.assert_called_once()

def test_create_duplicate_user(api_client: TestClient, mock_user_crud):
    """Test creating user with existing name."""
    user_id = uuid.uuid4()
    user = User(name="testuser", id=user_id)
    mock_user_crud.get_user_by_name.return_value = user

    response = api_client.post(
        f"{settings.API_STR}/users/create",
        json={"name": "testuser"}
    )
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
    assert "id" in data["detail"]
    assert data["detail"]["id"] == str(user_id)
    mock_user_crud.get_user_by_name.assert_called_once_with(name="testuser")

def test_get_user_success(api_client: TestClient, mock_user_crud):
    """Test successful user retrieval."""
    user_id = uuid.uuid4()
    user = User(name="testuser", id=user_id)
    mock_user_crud.get_user_by_id.return_value = user

    response = api_client.get(f"{settings.API_STR}/users/{user_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(user_id)
    assert data["name"] == "testuser"
    mock_user_crud.get_user_by_id.assert_called_once_with(id=user_id)

def test_get_user_not_found(api_client: TestClient, mock_user_crud):
    """Test get user with non-existent ID."""
    invalid_id = uuid.uuid4()
    mock_user_crud.get_user_by_id.return_value = None

    response = api_client.get(f"{settings.API_STR}/users/{invalid_id}")
    assert response.status_code == 400
    assert response.json()["detail"] == "The user with this ID is not found"
    mock_user_crud.get_user_by_id.assert_called_once_with(id=invalid_id)
