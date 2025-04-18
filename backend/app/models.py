import uuid
from typing import Literal, Annotated

from fastapi import Depends
from sqlmodel import Field, Relationship, SQLModel
from redis import Redis
from redis_om import HashModel

from app.core.database import get_redis_connection

class UserCreate(SQLModel):
    """User model to receive via API on creation."""

    name: str = Field(max_length=255)


class User(UserCreate, table=True):
    """User database model."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)


class LobbyCreate(HashModel):
    """Lobby model to receive via API on creation."""

    name: str = Field(max_length=255)
    creator_id: uuid.UUID


class Lobby(LobbyCreate):
    """Lobby redis model.
    
    A group of players joins together in lobby. Lobby always has at least one player (`creator`)."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    player_ids: list[uuid.UUID] = Relationship(back_populates="lobby")
    status: Literal["waiting", "playing", "finishing"] = "waiting"


class Player(User):
    """Player redis model.
    
    Player is the user who is in lobby."""

    lobby_id: uuid.UUID | None = Field(default=None, foreign_key="lobby.id")
    lobby: Lobby | None = Relationship(back_populates="player_ids")

    def save_to_redis(self, redis_connection: Annotated[Redis[str], Depends[get_redis_connection]]) -> str:
        """Save player to redis DB and return key."""
        data = self.model_dump()
        redis_key = f"player:{self.id}"
        redis_connection.hset(redis_key, mapping=data)
        return redis_key
