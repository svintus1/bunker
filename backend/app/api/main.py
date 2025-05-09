from fastapi import APIRouter


from app.api.routes import users, lobby, game

api_router = APIRouter()
api_router.include_router(users.router)
api_router.include_router(lobby.router)
api_router.include_router(game.router)