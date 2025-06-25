import uuid
from dataclasses import dataclass, field


@dataclass
class User:
    name: str
    id: uuid.UUID = field(default_factory=uuid.uuid4)
    is_playing: bool = False