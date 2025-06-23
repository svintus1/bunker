import uuid
from dataclasses import dataclass


@dataclass
class User:
    id: uuid.UUID
    name: str
    is_playing: bool