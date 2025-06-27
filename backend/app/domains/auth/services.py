from typing import Optional, Tuple
from datetime import datetime, timedelta
from .models import RefreshToken
from .schemas import LoginRequest, TokenResponse
from app.domains.user.models import User
from app.domains.user.services import UserService
from app.core.security import verify_password, create_access_token, create_refresh_token, verify_token
from app.core.config import settings


class AuthService:
    
    @staticmethod
    async def authenticate_user(login_data: LoginRequest) -> Optional[User]:
        """驗證用戶登入"""
        user = await UserService.get_user_by_email(login_data.email)
        if not user:
            return None
        
        if not user.is_active:
            return None
            
        if not verify_password(login_data.password, user.hashed_password):
            return None
            
        return user
    
    @staticmethod
    async def login(login_data: LoginRequest) -> Optional[TokenResponse]:
        """用戶登入"""
        user = await AuthService.authenticate_user(login_data)
        if not user:
            return None
        
        # 建立 access token
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email, "role": user.role}
        )
        
        # 建立 refresh token
        refresh_token_str = create_refresh_token()
        refresh_token = RefreshToken(
            user_id=str(user.id),
            token=refresh_token_str,
            expires_at=datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)
        )
        await refresh_token.insert()
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token_str
        )
    
    @staticmethod
    async def refresh_access_token(refresh_token_str: str) -> Optional[TokenResponse]:
        """刷新 access token"""
        # 查找 refresh token
        refresh_token = await RefreshToken.find_one(
            RefreshToken.token == refresh_token_str,
            RefreshToken.is_revoked == False
        )
        
        if not refresh_token:
            return None
        
        # 檢查是否過期
        if refresh_token.expires_at < datetime.utcnow():
            await refresh_token.update({"$set": {"is_revoked": True}})
            return None
        
        # 獲取用戶
        user = await UserService.get_user_by_id(refresh_token.user_id)
        if not user or not user.is_active:
            return None
        
        # 建立新的 access token
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email, "role": user.role}
        )
        
        # 建立新的 refresh token
        new_refresh_token_str = create_refresh_token()
        new_refresh_token = RefreshToken(
            user_id=str(user.id),
            token=new_refresh_token_str,
            expires_at=datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)
        )
        
        # 撤銷舊的 refresh token
        await refresh_token.update({"$set": {"is_revoked": True}})
        await new_refresh_token.insert()
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token_str
        )
    
    @staticmethod
    async def logout(refresh_token_str: str) -> bool:
        """用戶登出"""
        refresh_token = await RefreshToken.find_one(RefreshToken.token == refresh_token_str)
        if refresh_token:
            await refresh_token.update({"$set": {"is_revoked": True}})
            return True
        return False
    
    @staticmethod
    async def get_current_user(token: str) -> Optional[User]:
        """通過 token 獲取當前用戶"""
        payload = verify_token(token)
        if not payload:
            return None
        
        user_id = payload.get("sub")
        if not user_id:
            return None
        
        return await UserService.get_user_by_id(user_id)