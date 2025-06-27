from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from .schemas import UserResponse, UserUpdate, UserProfile
from .services import UserService
from .models import User
from app.domains.auth.deps import get_current_active_user, require_admin
from app.shared.models.enums import UserRole


router = APIRouter(prefix="/users", tags=["用戶管理"])


@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: User = Depends(get_current_active_user)):
    """獲取自己的用戶資料"""
    return UserResponse(**current_user.dict_public())


@router.put("/me", response_model=UserResponse)
async def update_my_profile(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """更新自己的用戶資料"""
    try:
        updated_user = await UserService.update_user(str(current_user.id), user_data)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用戶不存在"
            )
        return UserResponse(**updated_user.dict_public())
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/buyers", response_model=List[UserResponse])
async def get_buyers(current_user: User = Depends(get_current_active_user)):
    """獲取買方用戶列表（用於發送 case）"""
    # 只有 seller 和 admin 可以查看買方列表
    if current_user.role not in [UserRole.SELLER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="權限不足"
        )
    
    buyers = await UserService.get_users_by_role(UserRole.BUYER)
    return [UserResponse(**buyer.dict_public()) for buyer in buyers]


@router.get("/profile/{user_id}", response_model=UserProfile)
async def get_user_profile(
    user_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """獲取用戶完整檔案（包含聯絡資訊）- 用於 NDA 後的資訊交換"""
    user = await UserService.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用戶不存在"
        )
    
    # 這裡之後會加入 NDA 驗證邏輯
    # 現在先簡單實作，只有 admin 可以查看所有人的完整檔案
    if current_user.role != UserRole.ADMIN and str(current_user.id) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="權限不足"
        )
    
    return UserProfile(**user.dict_public())


# 管理員專用 API
@router.get("/", response_model=List[UserResponse])
async def get_all_users(admin_user: User = Depends(require_admin)):
    """獲取所有用戶列表（管理員專用）"""
    users = await User.find(User.is_active == True).to_list()
    return [UserResponse(**user.dict_public()) for user in users]


@router.delete("/{user_id}")
async def deactivate_user(
    user_id: str,
    admin_user: User = Depends(require_admin)
):
    """停用用戶（管理員專用）"""
    success = await UserService.deactivate_user(user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用戶不存在"
        )
    return {"message": "用戶已停用"}