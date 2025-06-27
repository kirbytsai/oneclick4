from beanie import Document
from pydantic import EmailStr, Field
from typing import Optional
from datetime import datetime
from app.shared.models.enums import UserRole


class User(Document):
    # 基本資料
    email: EmailStr = Field(..., unique=True)
    username: str = Field(..., min_length=3, max_length=50)
    hashed_password: str
    role: UserRole
    
    # 詳細資料
    company_name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None
    
    # 系統欄位
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        collection = "users"
        
    def dict_public(self):
        """返回公開資訊（不包含密碼）"""
        return {
            "id": str(self.id),
            "email": self.email,
            "username": self.username,
            "role": self.role,
            "company_name": self.company_name,
            "contact_person": self.contact_person,
            "phone": self.phone,
            "description": self.description,
            "is_active": self.is_active,
            "created_at": self.created_at
        }