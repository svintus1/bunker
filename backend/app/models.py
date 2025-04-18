import uuid

from sqlmodel import Field, Relationship, SQLModel


class UserCreate(SQLModel):
    """User model to receive via API on creation."""

    name: str = Field(max_length=255)


class User(UserCreate, table=True):
    """User database model."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)


class Lobby(SQLModel):
    """Lobby redis model.
    
    A group of players joins together in lobby. Lobby always has at least one player (`creator`)."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    players: list["Player"] = Relationship(back_populates="lobby")


class Player(User):
    """Player redis model.
    
    Player is the user who is in lobby."""

    lobby_id: int | None = Field(default=None, foreign_key="lobby.id")
    lobby: Lobby | None = Relationship(back_populates="players")
