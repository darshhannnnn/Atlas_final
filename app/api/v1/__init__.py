from fastapi import APIRouter
from app.api.v1 import auth, chat, files

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(chat.router, prefix="/chat", tags=["chat"])
router.include_router(files.router, prefix="/files", tags=["files"])
