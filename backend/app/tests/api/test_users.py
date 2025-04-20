import uuid

from fastapi.testclient import TestClient

from app.crud import UserCRUD
from app.models import UserCreate
from app.core.config import settings

def test_create_user_success(client: TestClient):
    """Test successful user creation."""
    response = client.post(
        f"{settings.API_STR}/users/create",
        json={"name": "testuser"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "testuser"
    assert "id" in data

def test_create_duplicate_user(client: TestClient):
    """Test creating user with existing name."""
    # First create user through API
    first_response = client.post(
        f"{settings.API_STR}/users/create",
        json={"name": "testuser"}
    )
    assert first_response.status_code == 200
    first_user = first_response.json()
    
    # Try to create user with same name
    second_response = client.post(
        f"{settings.API_STR}/users/create",
        json={"name": "testuser"}
    )
    assert second_response.status_code == 400
    data = second_response.json()
    assert "detail" in data
    assert "existing_user_id" in data["detail"]
    assert data["detail"]["existing_user_id"] == first_user["id"]

def test_get_user_success(client: TestClient, user_crud: UserCRUD):
    """Test successful user retrieval."""
    # Create user first
    user_in = UserCreate(name="testuser")
    user = user_crud.create_user(user_create=user_in)
    
    # Get user by id
    response = client.get(f"{settings.API_STR}/users/{user.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(user.id)
    assert data["name"] == "testuser"

def test_get_user_not_found(client: TestClient):
    """Test get user with non-existent ID."""
    invalid_id = uuid.uuid4()
    response = client.get(f"{settings.API_STR}/users/{invalid_id}")
    assert response.status_code == 400
    assert response.json()["detail"] == "The user with this ID is not found"
