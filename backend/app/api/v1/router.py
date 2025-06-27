 
from fastapi import APIRouter
from app.domains.auth.api import router as auth_router
from app.domains.user.api import router as user_router


api_router = APIRouter(prefix="/api/v1")

# 註冊所有路由
api_router.include_router(auth_router)
api_router.include_router(user_router)