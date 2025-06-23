import uuid
from dataclasses import dataclass

from domain.common.enums import LobbyStatus


@dataclass
class Lobby:
    id: uuid.UUID
    name: str
    creator_user_id: uuid.UUID
    status: LobbyStatus
    user_ids: list[uuid.UUID]