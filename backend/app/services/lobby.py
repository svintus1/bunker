import uuid

from models import Lobby, LobbyCreate, Player
from services.deps import LobbyCRUDDep, PlayerCRUDDep, UserCRUDDep
from exceptions import NotFoundError, CreationError, LobbyStatusError, AlreadyInLobbyError


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
            raise NotFoundError(f"User with id={lobby_in.creator_id} does not exist")

        # Create player for the creator
        creator_player = self.players.create_player(user=creator_user)
        if not creator_player:
            raise CreationError(f"Failed to create player for creator id={lobby_in.creator_id}")

        # Create the lobby with empty player_ids
        lobby = self.lobbies.create_lobby(lobby_in)
        if not lobby:
            raise CreationError(f"Failed to create lobby for creator id={lobby_in.creator_id}")

        # Add creator's player id to lobby
        lobby.player_ids.append(creator_player.id)
        self.lobbies.update_lobby(lobby)
        # Set lobby_id in player
        creator_player.lobby_id = lobby.id
        self.players.update_player(creator_player)

        return lobby

    def join_lobby(self, lobby_id: str, player_id: str) -> Lobby | None:
        """Add player to lobby if possible. Return updated lobby or None if not updated."""
        lobby = self.lobbies.get_lobby(lobby_id)
        player = self.players.get_player(player_id)
        
        if not lobby:
            raise NotFoundError(f"Lobby with id={lobby_id} not found")
        if not player:
            raise NotFoundError(f"Player with id={player_id} not found")

        if lobby.status != "waiting":
            raise LobbyStatusError(f"Lobby is not in waiting state. Current state: {lobby.status}")

        if player_id in lobby.player_ids:
            raise AlreadyInLobbyError(f"Player with id={player_id} is already in the lobby")

        # Update player's lobby reference
        player.lobby_id = lobby_id
        self.players.update_player(player)
    
        # Add to lobby's player list
        lobby.player_ids.append(player_id)
        self.lobbies.update_lobby(lobby)
        return lobby

    def find_player_by_user_id(self, lobby_id: str, user_id: uuid.UUID) -> Player | None:
        """Find player in lobby at `lobby_id` by `user_id`.
        
        Return found Player or None if not found."""
        lobby = self.lobbies.get_lobby(lobby_id)

        if not lobby:
            raise NotFoundError(f"Lobby with id={lobby_id} not found")

        for id in lobby.player_ids:
            player = self.players.get_player(id)
            if player and str(player.user.id) == str(user_id):
                return player

        return None

    def leave_lobby(self, lobby_id: str, player_id: str) -> Lobby | None:
        """Remove player from lobby. Return updated lobby or None if not updated."""
        lobby = self.lobbies.get_lobby(lobby_id)
        player = self.players.get_player(player_id)
        
        if not lobby:
            raise NotFoundError(f"Lobby with id={lobby_id} not found")
        if not player:
            raise NotFoundError(f"Player with id={player_id} not found")

        if player_id in lobby.player_ids:
            # Clear player's lobby reference
            player.lobby_id = None
            self.players.update_player(player)
        
            # Remove from lobby's player list
            lobby.player_ids.remove(player_id)
            self.lobbies.update_lobby(lobby)

        return None

    def delete_lobby(self, lobby_id: str) -> bool:
        """Delete lobby and its players"""
        lobby = self.lobbies.get_lobby(lobby_id)

        if not lobby:
            raise NotFoundError(f"Lobby with id={lobby_id} not found")

        for player_id in lobby.player_ids:
            player = self.players.get_player(player_id)
            if player:
                self.players.delete_player(player)

        return self.lobbies.delete_lobby(lobby)