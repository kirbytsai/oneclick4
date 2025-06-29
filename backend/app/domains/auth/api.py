from fastapi import APIRouter, HTTPException, status, Depends
from .schemas import LoginRequest, TokenResponse, TokenRefreshRequest
from .services import AuthService
from .deps import get_current_active_user
from app.domains.user.schemas import UserCreate, UserResponse
from app.domains.user.services import UserService
from app.domains.user.models import User


router = APIRouter(prefix="/auth", tags=["認證"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """用戶註冊"""
    try:
        user = await UserService.create_user(user_data)
        return UserResponse(**user.dict_public())
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="註冊失敗"
        )


@router.post("/login", response_model=TokenResponse)
async def login(login_data: LoginRequest):
    """用戶登入"""
    token_response = await AuthService.login(login_data)
    if not token_response:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="帳號或密碼錯誤",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token_response


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_data: TokenRefreshRequest):
    """刷新 access token"""
    token_response = await AuthService.refresh_token(refresh_data.refresh_token)
    if not token_response:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="無效的 refresh token"
        )
    return token_response


@router.post("/logout")
async def logout(
    refresh_data: TokenRefreshRequest,
    current_user: User = Depends(get_current_active_user)
):
    """用戶登出"""
    success = await AuthService.logout(refresh_data.refresh_token)
    return {"message": "登出成功" if success else "登出失敗"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """獲取當前用戶資訊"""
    return UserResponse(**current_user.dict_public())