import uuid
import logging

from pydantic import ValidationError
import redis_om
from sqlmodel import Session, select

from models import User, UserCreate, Lobby, LobbyCreate, Player
from core.config import settings

logger = logging.getLogger(settings.LOGGER_NAME)

class UserCRUD:
    def __init__(self, session: Session):
        self.session = session

    def create_user(self, user_create: UserCreate) -> User | None:
        """Create new user and save to Postgres DB."""
        try:
            user = User.model_validate(user_create)
            self.session.add(user)
            self.session.commit()
            self.session.refresh(user)
            logger.debug("Create user with name=%s: id=%s", user.name, str(user.id))
            return user
        except ValidationError as e:
            logger.warning("Failed to create user with name=%s: %s", user_create.name, e)
            return None

    def get_user_by_id(self, id: uuid.UUID) -> User | None:
        """Get user by ID."""
        statement = select(User).where(User.id == id)
        user_by_id = self.session.exec(statement).first()
        logger.debug("Get user by id=%s: name=%s", str(id), user_by_id.name if user_by_id else "<Not found>")
        return user_by_id

    def get_user_by_name(self, name: str) -> User | None:
        """Get user by name."""
        statement = select(User).where(User.name == name)
        user_by_name = self.session.exec(statement).first()
        logger.debug("Get user by name=%s: id=%s", name, str(user_by_name.id) if user_by_name else "<Not found>")
        return user_by_name

    def delete_user(self, user: User) -> None:
        """Delete user from DB."""
        self.session.delete(user)
        logger.debug("Delete user: id=%s", str(user.id))
        self.session.commit()


class PlayerCRUD:
    def create_player(self, user: User) -> Player | None:
        """Create new player and save to Redis."""
        try:
            player = Player(user=user)
            player.save()
            logger.debug("Create player for user id=%s: player_id=%s", str(user.id), player.id)
            return player
        except Exception as e:
            logger.warning("Failed to create player for user id=%s: %s", str(user.id), str(e))
            return None

    def get_player(self, player_id: str) -> Player | None:
        """Get player by ID."""
        try:
            player = Player.get(player_id)
            logger.debug("Get player by player_id=%s", player_id)
            return player
        except redis_om.NotFoundError as e:
            logger.warning("Failed to get player by player_id=%s: %s", player_id, str(e))
            return None

    def update_player(self, player: Player) -> bool:
        """Update player in Redis."""
        try:
            player.save()
            logger.debug("Update player with id=%s", player.id)
            return True
        except Exception as e:
            logger.warning("Failed to update player with id=%s: %s", player.id, str(e))
            return False

    def delete_player(self, player: Player) -> bool:
        """Delete player from Redis."""
        try:
            player.delete()
            logger.debug("Delete player with id=%s", player.id)
            return True
        except Exception as e:
            logger.warning("Failed to delete player with id=%s: %s", player.id, str(e))
            return False


class LobbyCRUD:
    def create_lobby(self, lobby_in: LobbyCreate) -> Lobby | None:
        """Create new lobby and save to Redis."""
        try:
            lobby_data = lobby_in.model_dump()
            lobby = Lobby(**lobby_data, player_ids=[])
            lobby.save()
            logger.debug("Create lobby with id=%s", lobby.id)
            return lobby
        except Exception as e:
            logger.warning("Failed to create lobby with name=%s: %s", lobby_in.name, str(e))
            return None

    def update_lobby(self, lobby: Lobby) -> bool:
        """Update lobby in Redis."""
        try:
            lobby.save()
            logger.debug("Update lobby with id=%s", lobby.id)
            return True
        except Exception as e:
            logger.warning("Failed to update lobby with id=%s: %s", lobby.id, str(e))
            return False

    def get_lobby(self, lobby_id: str) -> Lobby | None:
        """Get lobby by ID."""
        try:
            lobby = Lobby.get(lobby_id)
            logger.debug("Get lobby by id=%s: name=%s", lobby_id, lobby.name)
            return lobby
        except redis_om.NotFoundError as e:
            logger.warning("Failed to get lobby by lobby_id=%s: %s", lobby_id, str(e))
            return None

    def delete_lobby(self, lobby: Lobby) -> bool:
        """Delete lobby from Redis."""
        try:
            lobby.delete(lobby.id)
            logger.debug("Delete lobby with id=%s", lobby.id)
            return True
        except Exception as e:
            logger.warning("Failed to delete lobby with id=%s: %s", lobby.id, str(e))
            return False
