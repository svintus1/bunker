import uuid

import pytest
from unittest.mock import MagicMock, AsyncMock

from src.core.domain.models import User
from src.core.application.use_cases.create_user import CreateUser


@pytest.fixture
def user_repository_mock():
    """Fixture to create a mock of the UserRepository."""
    mock = MagicMock()
    mock.create_user = AsyncMock()
    return mock


@pytest.mark.asyncio
async def test_create_user_success(user_repository_mock):
    user_name = "John Doe"
    use_case = CreateUser(user_repository=user_repository_mock)
    user = await use_case.execute(name=user_name)
    assert isinstance(user, User)
    assert user.name == user_name
    assert isinstance(user.id, uuid.UUID)
    user_repository_mock.create_user.assert_called_once_with(user)