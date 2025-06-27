from pytest import fixture

from tests.doubles import UserRepositoryMock, LobbyRepositoryMock, PropertyRepositoryMock


@fixture(scope="module")
def user_repository_mock():
    """Fixture to create a mock of the UserRepository."""
    return UserRepositoryMock()


@fixture(scope="module")
def lobby_repository_mock():
    """Fixture to create a mock of the LobbyRepository."""
    return LobbyRepositoryMock()


@fixture(scope="module")
def property_repository_mock():
    """Fixture to create a mock of the PropertyRepository."""
    return PropertyRepositoryMock()
