# app/core/database.py

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from beanie import init_beanie
from typing import Optional
from .config import settings

class Database:
    client: Optional[AsyncIOMotorClient] = None
    database: Optional[AsyncIOMotorDatabase] = None

db = Database()

async def connect_to_mongo():
    """連接到 MongoDB"""
    print("🔌 正在連接到 MongoDB...")
    
    db.client = AsyncIOMotorClient(
        settings.MONGODB_URL,
        maxPoolSize=10,
        minPoolSize=10,
    )
    
    db.database = db.client[settings.DATABASE_NAME]
    
    # 測試連接
    try:
        await db.client.admin.command('ping')
        print("✅ MongoDB 連接成功")
    except Exception as e:
        print(f"❌ MongoDB 連接失敗: {e}")
        raise e

async def init_db():
    """初始化資料庫和 Beanie"""
    print("🏗️ 正在初始化資料庫...")
    
    # 導入所有模型 - 確保導入順序正確
    from app.domains.user.models import User
    from app.domains.auth.models import RefreshToken
    from app.domains.proposal.models import Proposal
    
    # 初始化 Beanie - 確保連接已建立
    try:
        await init_beanie(
            database=db.database,
            document_models=[User, RefreshToken, Proposal]
        )
        
        print("✅ 資料庫初始化完成")
        
        # 驗證初始化是否成功
        user_count = await User.count()
        print(f"📊 資料庫中有 {user_count} 個用戶")
        
    except Exception as e:
        print(f"❌ 資料庫初始化失敗: {e}")
        raise e

async def close_mongo_connection():
    """關閉 MongoDB 連接"""
    print("🔌 正在關閉 MongoDB 連接...")
    if db.client:
        db.client.close()
    print("✅ MongoDB 連接已關閉")