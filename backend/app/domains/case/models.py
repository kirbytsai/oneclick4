# app/domains/case/models.py
from beanie import Document
from pydantic import Field
from datetime import datetime
from typing import Optional
from app.shared.models.enums import CaseStatus

class Case(Document):
    # 關聯資訊
    proposal_id: str = Field(..., index=True)  # 來源提案 ID
    seller_id: str = Field(..., index=True)    # 賣方 ID (提案方)
    buyer_id: str = Field(..., index=True)     # 買方 ID
    
    # 提案內容 (從 proposal 複製)
    title: str                                  # 提案標題
    brief_content: str                          # 簡介內容 (買方可見)
    detailed_content: str                       # 詳細內容 (簽 NDA 後可見)
    
    # 狀態管理
    status: CaseStatus = Field(default=CaseStatus.CREATED)
    
    # 時間戳記
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    interested_at: Optional[datetime] = None    # 表達興趣時間
    rejected_at: Optional[datetime] = None      # 拒絕時間
    nda_signed_at: Optional[datetime] = None    # NDA 簽署時間
    
    # 可選的初始訊息
    initial_message: Optional[str] = None       # 賣方發送時的初始訊息
    
    class Settings:
        collection = "cases"

class Comment(Document):
    # 關聯資訊
    case_id: str = Field(..., index=True)      # 所屬 case ID
    user_id: str = Field(..., index=True)      # 留言者 ID
    
    # 留言內容
    content: str = Field(..., min_length=1, max_length=1000)
    
    # 時間戳記
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        collection = "comments"