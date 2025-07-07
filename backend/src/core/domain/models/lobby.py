import uuid
from dataclasses import dataclass, field

from ..common.enums import LobbyStatus


@dataclass
class Lobby:
    name: str
    owner_user_id: uuid.UUID
    user_ids: list[uuid.UUID]
    status: LobbyStatus = LobbyStatus.WAITING
    id: uuid.UUID = field(default_factory=uuid.uuid4)