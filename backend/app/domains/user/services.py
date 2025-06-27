from typing import Optional, List
from datetime import datetime
from beanie import PydanticObjectId
from .models import User
from .schemas import UserCreate, UserUpdate
from app.core.security import get_password_hash


class UserService:
    
    @staticmethod
    async def create_user(user_data: UserCreate) -> User:
        """建立新用戶"""
        # 檢查 email 是否已存在
        existing_user = await User.find_one(User.email == user_data.email)
        if existing_user:
            raise ValueError("Email 已被註冊")
        
        # 檢查 username 是否已存在
        existing_username = await User.find_one(User.username == user_data.username)
        if existing_username:
            raise ValueError("用戶名稱已被使用")
        
        # 建立用戶
        user = User(
            email=user_data.email,
            username=user_data.username,
            hashed_password=get_password_hash(user_data.password),
            role=user_data.role,
            company_name=user_data.company_name,
            contact_person=user_data.contact_person,
            phone=user_data.phone,
            description=user_data.description
        )
        
        return await user.insert()
    
    @staticmethod
    async def get_user_by_id(user_id: str) -> Optional[User]:
        """通過 ID 獲取用戶"""
        try:
            return await User.get(PydanticObjectId(user_id))
        except:
            return None
    
    @staticmethod
    async def get_user_by_email(email: str) -> Optional[User]:
        """通過 email 獲取用戶"""
        return await User.find_one(User.email == email)
    
    @staticmethod
    async def update_user(user_id: str, user_data: UserUpdate) -> Optional[User]:
        """更新用戶資料"""
        user = await UserService.get_user_by_id(user_id)
        if not user:
            return None
        
        # 檢查 username 是否已被其他用戶使用
        if user_data.username and user_data.username != user.username:
            existing_username = await User.find_one(
                User.username == user_data.username,
                User.id != user.id
            )
            if existing_username:
                raise ValueError("用戶名稱已被使用")
        
        # 更新資料
        update_data = user_data.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        await user.update({"$set": update_data})
        return await UserService.get_user_by_id(user_id)
    
    @staticmethod
    async def get_users_by_role(role: str) -> List[User]:
        """獲取指定角色的用戶列表"""
        return await User.find(User.role == role, User.is_active == True).to_list()
    
    @staticmethod
    async def deactivate_user(user_id: str) -> bool:
        """停用用戶"""
        user = await UserService.get_user_by_id(user_id)
        if not user:
            return False
        
        await user.update({"$set": {"is_active": False, "updated_at": datetime.utcnow()}})
        return True