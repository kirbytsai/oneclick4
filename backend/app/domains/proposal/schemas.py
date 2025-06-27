# app/domains/proposal/schemas.py

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.shared.models.enums import ProposalStatus

# 建立提案用的 Schema
class ProposalCreate(BaseModel):
    title: str
    brief_content: str
    detailed_content: str

# 更新提案用的 Schema (只有 draft 狀態可以更新)
class ProposalUpdate(BaseModel):
    title: Optional[str] = None
    brief_content: Optional[str] = None
    detailed_content: Optional[str] = None

# 審核用的 Schema
class ProposalReview(BaseModel):
    approved: bool
    reject_reason: Optional[str] = None

# 回應用的 Schema
class ProposalResponse(BaseModel):
    id: str
    title: str
    brief_content: str
    detailed_content: str
    status: ProposalStatus
    seller_id: str
    created_at: datetime
    updated_at: datetime
    submitted_at: Optional[datetime]
    reviewed_at: Optional[datetime]
    reviewed_by: Optional[str]
    reject_reason: Optional[str]

# 提案列表用的 Schema (不包含詳細內容)
class ProposalListResponse(BaseModel):
    id: str
    title: str
    brief_content: str
    status: ProposalStatus
    seller_id: str
    created_at: datetime
    updated_at: datetime
    submitted_at: Optional[datetime]