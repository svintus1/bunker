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


def get_user_by_id(session: Session, id: str) -> User | None:
    """Get user by ID."""
    statement = select(User).where(User.id == id)
    user_by_id = session.exec(statement).first()
    return user_by_id


def get_user_by_name(session: Session, name: str) -> User | None:
    """Get user by name."""
    statement = select(User).where(User.name == name)
    user_by_name = session.exec(statement).first()
    return user_by_name


def delete_user(session: Session, user: User) -> None:
    """Delete user."""
    session.delete(user)
    session.commit()