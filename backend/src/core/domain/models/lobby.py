import uuid
from dataclasses import dataclass, field

from ..common.enums import LobbyStatus


@dataclass
class Lobby:
    name: str
    owner_user_id: uuid.UUID
    user_ids: list[uuid.UUID] = field(init=False)
    status: LobbyStatus = LobbyStatus.WAITING
    id: uuid.UUID = field(default_factory=uuid.uuid4)

    def __post_init__(self):
        """Add `owner_user_id` into `user_ids` after initialization"""
        self.user_ids = [self.owner_user_id]