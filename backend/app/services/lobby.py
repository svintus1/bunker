from uuid import UUID

from redis import Redis
from sqlmodel import Session

from app.models import Lobby, LobbyCreate, User
from app.services.deps import LobbyCRUDDep, PlayerCRUDDep, UserCRUDDep


class LobbyService:
    def __init__(self, lobbies: LobbyCRUDDep, players: PlayerCRUDDep, users: UserCRUDDep):
        self.lobbies = lobbies
        self.players = players
        self.users = users

    def create_lobby(self, lobby_in: LobbyCreate) -> Lobby:
        """Create a new lobby, create player for creator, and add player to lobby."""
        # Get the creator user from DB
        creator_user = self.users.get_user_by_id(lobby_in.creator_id)
        if not creator_user:
            raise RuntimeError(f"User with id {lobby_in.creator_id} does not exist")

        # Create player for the creator
        creator_player = self.players.create_player(user=creator_user)
        if not creator_player:
            raise RuntimeError(f"Failed to create player for creator {lobby_in.creator_id}")

        # Create the lobby with empty player_ids
        lobby = self.lobbies.create_lobby(lobby_in)
        if not lobby:
            raise RuntimeError("Failed to create lobby")

        # Add creator's player PK to lobby
        lobby.player_ids.append(creator_player.pk)
        self.lobbies.update_lobby(lobby)
        return lobby

    def join_lobby(self, lobby_id: str, player_id: str) -> Lobby | None:
        """Add player to lobby if possible. Return updated lobby or None if not updated."""
        lobby = self.lobbies.get_lobby(lobby_id)
        player = self.players.get_player(player_id)
        
        if not lobby or not player:
            return None
        
        if lobby.status != "waiting":
            return None

        if player_id not in lobby.player_ids:
            # Update player's lobby reference
            player.lobby_id = lobby_id
            player.save()
        
            # Add to lobby's player list
            lobby.player_ids.append(player_id)
            lobby.save()
            return lobby

        return None

    def leave_lobby(self, lobby_id: str, player_id: str) -> Lobby | None:
        """Remove player from lobby. Return updated lobby or None if not updated."""
        lobby = self.lobbies.get_lobby(lobby_id)
        player = self.players.get_player(player_id)
        
        if not lobby or not player:
            return None

        if player_id in lobby.player_ids:
            # Clear player's lobby reference
            player.lobby_id = None
            player.save()
        
            # Remove from lobby's player list
            lobby.player_ids.remove(player_id)
            lobby.save()
            return lobby

        return None
