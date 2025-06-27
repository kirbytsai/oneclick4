# app/core/config.py - 允許額外設定版本

import os
from pydantic_settings import BaseSettings
from typing import List
from pydantic import ConfigDict

class Settings(BaseSettings):
    # 應用程式設定
    APP_NAME: str = "M&A Platform"
    DEBUG: bool = True
    
    # MongoDB 設定 - 從 .env 讀取
    MONGODB_URL: str
    DATABASE_NAME: str = "ma_platform"
    
    # JWT 設定 - 從 .env 讀取
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS 設定
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8080"]
    
    # 使用新的 ConfigDict 語法並允許額外欄位
    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"  # 忽略額外的設定項目
    )

# 創建設定實例
settings = Settings()