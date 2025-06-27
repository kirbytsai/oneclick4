 
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from .config import settings


class Database:
    client: AsyncIOMotorClient = None
    database = None


db = Database()


async def connect_to_mongo():
    """連接到 MongoDB"""
    db.client = AsyncIOMotorClient(settings.mongodb_url)
    db.database = db.client[settings.database_name]
    
    # 初始化 Beanie (稍後會加入所有 models)
    from app.domains.user.models import User
    from app.domains.auth.models import RefreshToken
    
    await init_beanie(
        database=db.database,
        document_models=[User, RefreshToken]
    )
    print("✅ 連接到 MongoDB 成功")


async def close_mongo_connection():
    """關閉 MongoDB 連接"""
    if db.client:
        db.client.close()
        print("✅ MongoDB 連接已關閉")