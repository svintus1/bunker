import uuid

from sqlmodel import Session, select

from app.models import User, UserCreate, Lobby


def create_user(session: Session, user_create: UserCreate) -> User:
    """Create new user."""
    user = User.model_validate(user_create)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def delete_user(session: Session, user: User) -> None:
    """Delete user."""
    session.delete(user)
    session.commit()