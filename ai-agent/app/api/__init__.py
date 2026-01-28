from fastapi import APIRouter
from app.api import chat, files, knowledge, contract

api_router = APIRouter()

api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(contract.router, prefix="/contract", tags=["contract"])
api_router.include_router(files.router, prefix="/files", tags=["files"])
api_router.include_router(knowledge.router, prefix="/knowledge", tags=["knowledge"])