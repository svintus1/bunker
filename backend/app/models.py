import uuid
from typing import Literal

from pydantic import BaseModel
from sqlmodel import Field, SQLModel
from redis_om import JsonModel
from redis_om import get_redis_connection

from app.core.config import settings


class UserCreate(SQLModel):
    """User model to receive via API on creation."""

    name: str = Field(max_length=255)


class User(UserCreate, table=True):
    """User database model."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)


class BaseJsonModel(JsonModel):
    # Configure default Redis connection for all models
    class Meta:
        database = get_redis_connection(url=str(settings.REDIS_DATABASE_URI))

    # Make the id field a kind of a reference to pk as I couldn't override it completely
    @property
    def id(self) -> str:
        return self.pk


class LobbyCreate(BaseJsonModel):
    """Lobby model to receive via API on creation."""

    name: str = Field(max_length=255)
    creator_id: uuid.UUID


class Lobby(LobbyCreate):
    """Lobby redis model.
    
    A group of players joins together in lobby.
    Lobby always has at least one player (creator)."""

    status: Literal["waiting", "playing", "finishing"] = "waiting"
    player_ids: list[str]


class LobbyOutput(BaseModel):
    """Lobby model for output in API, cleared of `pk` and `additionalProp1` fields created by redis-om."""

    id: str
    name: str
    creator_id: uuid.UUID
    status: Literal["waiting", "playing", "finishing"] = "waiting"
    player_ids: list[str]

    class Config:
        extra = "ignore"


class Player(BaseJsonModel):
    """Player redis model.
    
    Represents a User who has joined a Lobby. While User contains persistent data,
    Player contains session-specific data for the game."""

    user: User
    lobby_id: str | None = None

