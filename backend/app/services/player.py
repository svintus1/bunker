from app.models import User, Player
from app.services.deps import PlayerCRUDDep, UserCRUDDep

class PlayerService:
    def __init__(self, players: PlayerCRUDDep, users: UserCRUDDep):
        self.players = players
        self.users = users

    def create_player(self, user: User) -> Player:
        """Create player from user."""
        player = self.players.create_player(user)
        if not player:
            raise RuntimeError(f"Failed to create player for user {user.id}")
        return player