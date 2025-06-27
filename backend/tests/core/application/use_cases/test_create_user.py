import uuid

import pytest

from src.core.application.use_cases.create_user import CreateUser


@pytest.mark.asyncio
async def test_create_user_success(user_repository_mock):
    user_name = "John Doe"
    use_case = CreateUser(user_repository=user_repository_mock)

    user = await use_case.execute(name=user_name)

    assert user.name == user_name
    assert isinstance(user.id, uuid.UUID)
    user_repository_mock.create_user.assert_called_once_with(user)

@pytest.mark.asyncio
async def test_create_user_empty_name(user_repository_mock):
    use_case = CreateUser(user_repository=user_repository_mock)

    with pytest.raises(ValueError, match="User name cannot be empty"):
        await use_case.execute(name="")