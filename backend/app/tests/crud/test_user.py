import uuid


from app.models import UserCreate
from app.crud import UserCRUD
from app.tests.utils.utils import random_lower_string


def test_create_user(user_crud: UserCRUD) -> None:
    name = random_lower_string()
    user_in = UserCreate(name=name)
    user = user_crud.create_user(user_in)
    assert user.name == name
    assert isinstance(user.id, uuid.UUID)

def test_get_user_by_id(user_crud: UserCRUD) -> None:
    name = random_lower_string()
    user_in = UserCreate(name=name)
    user = user_crud.create_user(user_in)
    user_2 = user_crud.get_user_by_id(user.id)
    assert user_2
    assert user.name == user_2.name
    assert user.id == user_2.id

def test_get_user_by_name(user_crud: UserCRUD) -> None:
    name = random_lower_string()
    user_in = UserCreate(name=name)
    user = user_crud.create_user(user_in)
    user_2 = user_crud.get_user_by_name(name)
    assert user_2
    assert user.name == user_2.name
    assert user.id == user_2.id

def test_delete_user(user_crud: UserCRUD) -> None:
    name = random_lower_string()
    user_in = UserCreate(name=name)
    user = user_crud.create_user(user_in)
    
    user_crud.delete_user(user)
    user_2 = user_crud.get_user_by_id(user.id)
    assert user_2 is None
