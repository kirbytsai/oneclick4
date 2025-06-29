# app/domains/auth/services.py - 修正版

from typing import Optional
from datetime import datetime, timedelta
from beanie import PydanticObjectId
from .models import RefreshToken
from .schemas import LoginRequest, TokenResponse
from app.domains.user.services import UserService
from app.core.security import verify_password, create_access_token, create_refresh_token

class AuthService:
    
    @staticmethod
    async def authenticate_user(login_data: LoginRequest) -> Optional:
        """驗證用戶"""
        user = await UserService.get_user_by_email(login_data.email)
        if not user:
            return None
        
        if not UserService.verify_user_password(user, login_data.password):
            return None
        
        return user
    
    @staticmethod
    async def login(login_data: LoginRequest) -> TokenResponse:
        """用戶登入"""
        # 驗證用戶
        user = await AuthService.authenticate_user(login_data)
        if not user:
            raise ValueError("Email 或密碼錯誤")
        
        if not user.is_active:
            raise ValueError("帳號已被停用")
        
        # 建立 tokens
        user_data = {"sub": str(user.id), "email": user.email, "role": user.role}
        
        access_token = create_access_token(data=user_data)
        refresh_token_str = create_refresh_token(data=user_data)  # 修正：加入 data 參數
        
        # 儲存 refresh token
        refresh_token = RefreshToken(
            token=refresh_token_str,
            user_id=str(user.id),
            expires_at=datetime.utcnow() + timedelta(days=7)
        )
        await refresh_token.insert()
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token_str
        )
    
    @staticmethod
    async def refresh_token(refresh_token_str: str) -> TokenResponse:
        """刷新 token"""
        # 查找 refresh token
        refresh_token = await RefreshToken.find_one(
            {"token": refresh_token_str, "is_revoked": False}
        )
        
        if not refresh_token:
            raise ValueError("Invalid refresh token")
        
        if refresh_token.expires_at < datetime.utcnow():
            raise ValueError("Refresh token expired")
        
        # 獲取用戶
        user = await UserService.get_user_by_id(refresh_token.user_id)
        if not user or not user.is_active:
            raise ValueError("User not found or inactive")
        
        # 建立新的 tokens
        user_data = {"sub": str(user.id), "email": user.email, "role": user.role}
        
        new_access_token = create_access_token(data=user_data)
        new_refresh_token_str = create_refresh_token(data=user_data)  # 修正：加入 data 參數
        
        # 停用舊的 refresh token
        await refresh_token.update({"$set": {"is_revoked": True}})
        
        # 建立新的 refresh token
        new_refresh_token = RefreshToken(
            token=new_refresh_token_str,
            user_id=str(user.id),
            expires_at=datetime.utcnow() + timedelta(days=7)
        )
        await new_refresh_token.insert()
        
        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token_str
        )
    
    @staticmethod
    async def get_current_user(token: str):
        """根據 token 獲取當前用戶"""
        from app.core.security import verify_token
        from app.domains.user.services import UserService
        
        # 驗證 token
        user_id = verify_token(token)
        if not user_id:
            return None
        
        # 獲取用戶
        user = await UserService.get_user_by_id(user_id)
        return user
    
    @staticmethod
    async def logout(refresh_token_str: str) -> bool:
        """用戶登出"""
        refresh_token = await RefreshToken.find_one(
            {"token": refresh_token_str, "is_active": True}
        )
        
        if refresh_token:
            await refresh_token.update({"$set": {"is_active": False}})
            return True
        
        return False