from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from app.domains.user.models import User
from .services import AuthService
from app.shared.models.enums import UserRole


security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """獲取當前用戶"""
    token = credentials.credentials
    user = await AuthService.get_current_user(token)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="無效的認證憑證",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用戶帳號已被停用"
        )
    
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """獲取當前活躍用戶"""
    return current_user


def require_role(allowed_roles: list[UserRole]):
    """檢查用戶角色權限"""
    def role_checker(current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="權限不足"
            )
        return current_user
    return role_checker


# 常用的角色權限檢查
require_admin = require_role([UserRole.ADMIN])
require_seller = require_role([UserRole.SELLER])
require_buyer = require_role([UserRole.BUYER])
require_seller_or_admin = require_role([UserRole.SELLER, UserRole.ADMIN])
require_buyer_or_admin = require_role([UserRole.BUYER, UserRole.ADMIN])