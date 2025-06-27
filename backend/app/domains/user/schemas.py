from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.shared.models.enums import UserRole


class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)
    role: UserRole
    company_name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None


class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    company_name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    username: str
    role: UserRole
    company_name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None
    is_active: bool
    created_at: datetime


class UserProfile(BaseModel):
    """用戶完整檔案（包含聯絡資訊）"""
    id: str
    email: EmailStr
    username: str
    role: UserRole
    company_name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None