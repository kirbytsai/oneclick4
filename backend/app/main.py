from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.database import connect_to_mongo, close_mongo_connection
from app.api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 啟動時執行
    await connect_to_mongo()
    yield
    # 關閉時執行
    await close_mongo_connection()


def create_app() -> FastAPI:
    app = FastAPI(
        title="M&A Platform API",
        description="M&A 媒合平台 MVP 版本",
        version="1.0.0",
        lifespan=lifespan
    )
    
    # CORS 設定
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # 開發環境，生產環境要改為具體域名
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # 註冊路由
    app.include_router(api_router)
    
    @app.get("/")
    async def root():
        return {"message": "M&A Platform API is running!"}
    
    @app.get("/health")
    async def health_check():
        return {"status": "healthy"}
    
    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)