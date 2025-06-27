# app/api/v1/router.py - 修正重複前綴問題

from fastapi import APIRouter

# 導入所有域的路由
from app.domains.auth.api import router as auth_router
from app.domains.user.api import router as user_router
from app.domains.proposal.api import router as proposal_router

# 建立主路由
api_router = APIRouter()

# 註冊所有路由 - 不要加額外前綴，因為各域路由器已經有自己的前綴
api_router.include_router(auth_router)
api_router.include_router(user_router) 
api_router.include_router(proposal_router)