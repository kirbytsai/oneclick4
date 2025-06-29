# app/main.py - 確保正確設置

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.database import connect_to_mongo, close_mongo_connection, init_db
from app.core.config import settings
from app.api.v1.router import api_router
from fastapi.middleware.cors import CORSMiddleware  # 添加這行

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 啟動時
    print("🚀 啟動應用程式...")
    try:
        await connect_to_mongo()
        await init_db()
        print("✅ 應用程式啟動完成")
    except Exception as e:
        print(f"❌ 應用程式啟動失敗: {e}")
        raise e
    
    yield
    
    # 關閉時
    print("🔌 關閉應用程式...")
    await close_mongo_connection()


app = FastAPI(
    title=settings.APP_NAME,
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# CORS 設置
app.add_middleware(
    CORSMiddleware,
    # allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # 前端地址
    
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 註冊 API 路由 - 這是關鍵！
app.include_router(api_router, prefix="/api/v1")

# 根路由
@app.get("/")
async def root():
    return {"message": "M&A Platform API", "status": "running"}

# 健康檢查
@app.get("/health")
async def health_check():
    return {"status": "healthy"}