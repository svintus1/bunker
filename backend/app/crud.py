import uuid
import logging

from sqlmodel import Session, select
from app.models import User, UserCreate, Lobby, LobbyCreate, Player

# Configure logging
logger = logging.getLogger(__name__)

class UserCRUD:
    def __init__(self, session: Session):
        self.session = session

    def create_user(self, user_create: UserCreate) -> User | None:
        """Create new user and save to Postgres DB."""
        user = User.model_validate(user_create)
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user

    def get_user_by_id(self, id: uuid.UUID) -> User | None:
        """Get user by ID."""
        statement = select(User).where(User.id == id)
        user_by_id = self.session.exec(statement).first()
        return user_by_id

    def get_user_by_name(self, name: str) -> User | None:
        """Get user by name."""
        statement = select(User).where(User.name == name)
        user_by_name = self.session.exec(statement).first()
        return user_by_name

    def delete_user(self, user: User) -> None:
        """Delete user from DB."""
        self.session.delete(user)
        self.session.commit()


class PlayerCRUD:
    def create_player(self, user: User) -> Player | None:
        """Create new player and save to Redis."""
        try:
            player = Player(user=user)
            player.save()
            logger.info(f"Created new player for user {user.id}")
            return player
        except Exception as e:
            logger.error(f"Failed to create player for user {user.id}: {str(e)}")
            return None

    def get_player(self, player_id: str) -> Player | None:
        """Get player by ID."""
        try:
            player = Player.get(player_id)
            if player:
                logger.info(f"Retrieved player {player_id}")
            else:
                logger.warning(f"Player {player_id} not found")
            return player
        except Exception as e:
            logger.error(f"Error retrieving player {player_id}: {str(e)}")
            return None

    def update_player(self, player: Player) -> bool:
        """Update player in Redis."""
        try:
            player.save()
            logger.info(f"Updated player {player.id}")
            return True
        except Exception as e:
            logger.error(f"Failed to update player {getattr(player, 'id', None)}: {str(e)}")
            return False

    def delete_player(self, player_id: uuid.UUID) -> bool:
        """Delete player from Redis."""
        try:
            player = Player.get(player_id)
            if player:
                player.delete()
                logger.info(f"Deleted player {player_id}")
                return True
            logger.warning(f"Player {player_id} not found for deletion")
            return False
        except Exception as e:
            logger.error(f"Error deleting player {player_id}: {str(e)}")
            return False


class LobbyCRUD:
    def create_lobby(self, lobby_in: LobbyCreate) -> Lobby | None:
        """Create new lobby and save to Redis."""
        try:
            lobby_data = lobby_in.model_dump()
            lobby = Lobby(**lobby_data, player_ids=[])
            lobby.save()
            logger.info(f"Created new lobby. lobby.id: {lobby.id}")
            return lobby
        except Exception as e:
            logger.error(f"Failed to create lobby: {str(e)}")
            return None

    def update_lobby(self, lobby: Lobby) -> bool:
        """Update lobby in Redis."""
        try:
            lobby.save()
            logger.info(f"Updated lobby {lobby.id}")
            return True
        except Exception as e:
            logger.error(f"Failed to update lobby {lobby.id}: {str(e)}")
            return False

    def get_lobby(self, lobby_id: str) -> Lobby | None:
        """Get lobby by ID."""
        try:
            lobby = Lobby.get(lobby_id)
            if lobby:
                logger.info(f"Retrieved lobby {lobby_id}")
            else:
                logger.warning(f"Lobby {lobby_id} not found")
            return lobby
        except Exception as e:
            logger.error(f"Error retrieving lobby {lobby_id}: {str(e)}")
            return None

    def delete_lobby(self, lobby: Lobby) -> bool:
        """Delete lobby and its player set from Redis."""
        try:
            lobby.delete(lobby.id)
            logger.info(f"Deleted lobby {lobby.id}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete lobby {lobby.id}: {str(e)}")
            return False
