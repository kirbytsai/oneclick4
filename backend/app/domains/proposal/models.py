# app/domains/proposal/models.py

from beanie import Document
from pydantic import Field
from datetime import datetime
from typing import Optional
from beanie import PydanticObjectId
from app.shared.models.enums import ProposalStatus

class Proposal(Document):
    # 基本資訊
    title: str
    brief_content: str           # 簡介內容 (未簽 NDA 可見)
    detailed_content: str        # 詳細內容 (簽 NDA 後可見)
    
    # 狀態管理
    status: ProposalStatus = Field(default=ProposalStatus.DRAFT)
    
    # 關聯資訊
    seller_id: str = Field(..., index=True)  # 提案方 ID
    
    # 時間戳記
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    submitted_at: Optional[datetime] = None      # 提交審核時間
    reviewed_at: Optional[datetime] = None       # 審核完成時間
    
    # 審核相關
    reviewed_by: Optional[str] = None            # 審核者 ID
    reject_reason: Optional[str] = None          # 拒絕原因
    
    class Settings:
        collection = "proposals"