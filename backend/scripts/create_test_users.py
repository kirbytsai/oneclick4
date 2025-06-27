# scripts/create_test_users.py

import asyncio
import sys
import os

# 添加 backend 目錄到 Python 路徑
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import connect_to_mongo, init_db
from app.domains.user.models import User
from app.core.security import get_password_hash
from app.shared.models.enums import UserRole

async def create_test_users():
    """建立測試用戶"""
    print("🔌 連接資料庫...")
    await connect_to_mongo()
    await init_db()
    
    print("👥 建立測試用戶...")
    
    test_users = [
        {
            "email": "admin@ma-platform.com",
            "username": "admin",
            "password": "admin123456",
            "role": UserRole.ADMIN,
            "company_name": "M&A Platform",
            "contact_person": "Admin User"
        },
        {
            "email": "seller@test.com",
            "username": "testseller",
            "password": "password123",
            "role": UserRole.SELLER,
            "company_name": "Test Seller Corp",
            "contact_person": "Test Seller"
        },
        {
            "email": "buyer@test.com", 
            "username": "testbuyer",
            "password": "password123",
            "role": UserRole.BUYER,
            "company_name": "Test Buyer Inc",
            "contact_person": "Test Buyer"
        }
    ]
    
    for user_info in test_users:
        try:
            # 檢查用戶是否已存在
            existing_user = await User.find_one({"email": user_info["email"]})
            if existing_user:
                print(f"✅ 用戶 {user_info['email']} 已存在")
                continue
            
            # 檢查用戶名是否已存在
            existing_username = await User.find_one({"username": user_info["username"]})
            if existing_username:
                print(f"✅ 用戶名 {user_info['username']} 已存在")
                continue
            
            # 建立用戶
            hashed_password = get_password_hash(user_info["password"])
            
            user_data = {
                "email": user_info["email"],
                "username": user_info["username"],
                "hashed_password": hashed_password,
                "role": user_info["role"],
                "company_name": user_info["company_name"],
                "contact_person": user_info["contact_person"],
                "is_active": True
            }
            
            user = User(**user_data)
            await user.insert()
            
            print(f"✅ 建立用戶: {user_info['email']} / {user_info['username']} ({user_info['role']})")
            
        except Exception as e:
            print(f"❌ 建立用戶 {user_info['email']} 失敗: {e}")
    
    print("🎉 測試用戶建立完成！")

if __name__ == "__main__":
    asyncio.run(create_test_users())