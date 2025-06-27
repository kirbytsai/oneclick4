# app/domains/user/services.py - 修正版

from typing import Optional, List
from datetime import datetime
from beanie import PydanticObjectId
from .models import User
from .schemas import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password
from app.shared.models.enums import UserRole

class UserService:
    
    @staticmethod
    async def create_user(user_data: UserCreate) -> User:
        """建立新用戶"""
        # 檢查 email 是否已存在
        existing_user = await User.find_one({"email": user_data.email})
        if existing_user:
            raise ValueError("Email 已存在")
        
        # 檢查 username 是否已存在
        existing_username = await User.find_one({"username": user_data.username})
        if existing_username:
            raise ValueError("用戶名已存在")
        
        # 加密密碼
        hashed_password = get_password_hash(user_data.password)
        
        # 準備用戶資料
        user_dict = user_data.dict()
        user_dict["hashed_password"] = hashed_password
        del user_dict["password"]
        
        user = User(**user_dict)
        return await user.insert()
    
    @staticmethod
    async def get_user_by_email(email: str) -> Optional[User]:
        """通過 email 獲取用戶"""
        try:
            return await User.find_one({"email": email})
        except Exception as e:
            print(f"❌ 查詢用戶失敗: {e}")
            # 如果 Beanie 沒有初始化，嘗試重新初始化
            from app.core.database import init_db
            await init_db()
            return await User.find_one({"email": email})
    
    @staticmethod
    async def get_user_by_username(username: str) -> Optional[User]:
        """通過 username 獲取用戶"""
        return await User.find_one({"username": username})
    
    @staticmethod
    async def get_user_by_id(user_id: str) -> Optional[User]:
        """通過 ID 獲取用戶"""
        try:
            return await User.get(PydanticObjectId(user_id))
        except:
            return None
    
    @staticmethod
    async def update_user(user_id: str, user_data: UserUpdate) -> Optional[User]:
        """更新用戶資料"""
        user = await UserService.get_user_by_id(user_id)
        if not user:
            return None
        
        update_data = user_data.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        await user.update({"$set": update_data})
        return await UserService.get_user_by_id(user_id)
    
    @staticmethod
    async def deactivate_user(user_id: str) -> Optional[User]:
        """停用用戶"""
        user = await UserService.get_user_by_id(user_id)
        if not user:
            return None
        
        await user.update({"$set": {"is_active": False, "updated_at": datetime.utcnow()}})
        return await UserService.get_user_by_id(user_id)
    
    @staticmethod
    async def get_users_by_role(role: UserRole) -> List[User]:
        """根據角色獲取用戶列表"""
        return await User.find({"role": role, "is_active": True}).to_list()
    
    @staticmethod
    async def get_all_users() -> List[User]:
        """獲取所有用戶 (管理員用)"""
        return await User.find().to_list()
    
    @staticmethod
    async def verify_user_password(user: User, password: str) -> bool:
        """驗證用戶密碼"""
        return verify_password(password, user.hashed_password)