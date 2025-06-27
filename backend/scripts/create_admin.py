"""
建立預設管理員帳號的腳本
"""
import asyncio
import sys
import os

# 添加專案根目錄到 Python 路徑
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import connect_to_mongo
from app.domains.user.services import UserService
from app.domains.user.schemas import UserCreate
from app.shared.models.enums import UserRole


async def create_admin():
    """建立預設管理員帳號"""
    await connect_to_mongo()
    
    admin_data = UserCreate(
        email="admin@ma-platform.com",
        username="admin",
        password="admin123456",
        role=UserRole.ADMIN,
        company_name="M&A Platform",
        contact_person="System Administrator"
    )
    
    try:
        # 檢查是否已存在
        existing_admin = await UserService.get_user_by_email(admin_data.email)
        if existing_admin:
            print("❌ 管理員帳號已存在")
            return
        
        admin_user = await UserService.create_user(admin_data)
        print("✅ 管理員帳號建立成功")
        print(f"Email: {admin_user.email}")
        print(f"Username: {admin_user.username}")
        print(f"Role: {admin_user.role}")
        
    except Exception as e:
        print(f"❌ 建立失敗: {e}")


if __name__ == "__main__":
    asyncio.run(create_admin())