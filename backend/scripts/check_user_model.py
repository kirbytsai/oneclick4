# scripts/check_user_model.py

import asyncio
from app.domains.user.models import User
from app.domains.user.schemas import UserCreate
from app.domains.auth.schemas import LoginRequest

async def check_models():
    """檢查模型結構"""
    print("🔍 檢查 User 模型結構...")
    
    # 檢查 User 模型的欄位
    print("\n📋 User 模型欄位：")
    for field_name, field_info in User.model_fields.items():
        print(f"  - {field_name}: {field_info.annotation}")
    
    print("\n📋 UserCreate Schema 欄位：")
    for field_name, field_info in UserCreate.model_fields.items():
        print(f"  - {field_name}: {field_info.annotation}")
    
    print("\n📋 LoginRequest Schema 欄位：")
    for field_name, field_info in LoginRequest.model_fields.items():
        print(f"  - {field_name}: {field_info.annotation}")

if __name__ == "__main__":
    asyncio.run(check_models())