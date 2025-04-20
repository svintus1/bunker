from uuid import UUID

from redis import Redis
from sqlmodel import Session

from app.models import Lobby, LobbyCreate
from app.services.deps import ServiceLobbyCRUDDep, ServicePlayerCRUDDep


class LobbyService:
    def __init__(self, lobbies: ServiceLobbyCRUDDep, players: ServicePlayerCRUDDep):
        self.lobbies = lobbies
        self.players = players

    async def create_lobby(self, lobby_in: LobbyCreate) -> Lobby:
        """Create a new lobby and set up initial state."""
        # Create the lobby
        lobby = self.lobbies.create_lobby(lobby_in)
        return lobby

    async def join_lobby(self, lobby_id: UUID, player_id: UUID) -> bool:
        """Add player to lobby if possible."""
        lobby = self.lobbies.get_lobby(lobby_id)
        player = self.players.get_player(player_id)
        
        if not lobby or not player:
            return False
        
        if lobby.status != "waiting":
            return False

        if player_id not in lobby.player_ids:
            # Update player's lobby reference
            player.lobby_id = lobby_id
            player.save()
        
            # Add to lobby's player list
            lobby.player_ids.append(player_id)
            lobby.save()
            return True

        return False

    async def leave_lobby(self, lobby_id: UUID, player_id: UUID) -> bool:
        """Remove player from lobby."""
        lobby = self.lobbies.get_lobby(lobby_id)
        player = self.players.get_player(player_id)
        
        if not lobby or not player:
            return False

        if player_id in lobby.player_ids:
            # Clear player's lobby reference
            player.lobby_id = None
            player.save()
        
            # Remove from lobby's player list
            lobby.player_ids.remove(player_id)
            lobby.save()
            return True

        return False
