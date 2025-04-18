import uuid

from sqlmodel import Field, Relationship, SQLModel


class UserCreate(SQLModel):
    name: str = Field(max_length=255)

class User(UserCreate):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class Lobby(SQLModel):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    players: list["Player"] = Relationship(back_populates="lobby")

class Player(User):
    lobby_id: int | None = Field(default=None, foreign_key="lobby.id")
    lobby: Lobby | None = Relationship(back_populates="players")
