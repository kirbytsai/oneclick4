# app/domains/case/schemas.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from app.shared.models.enums import CaseStatus

# === Case Schemas ===

class CaseCreate(BaseModel):
    """創建 Case 的 Schema"""
    proposal_id: str = Field(..., description="提案 ID")
    buyer_id: str = Field(..., description="買方 ID")
    initial_message: Optional[str] = Field(None, max_length=500, description="初始訊息")

class CaseResponse(BaseModel):
    """Case 回應 Schema"""
    id: str
    proposal_id: str
    seller_id: str
    buyer_id: str
    title: str
    brief_content: str
    detailed_content: Optional[str] = None  # 根據 NDA 狀態決定是否返回
    status: CaseStatus
    created_at: datetime
    updated_at: datetime
    interested_at: Optional[datetime] = None
    rejected_at: Optional[datetime] = None
    nda_signed_at: Optional[datetime] = None
    initial_message: Optional[str] = None

class CaseListResponse(BaseModel):
    """Case 列表回應 Schema (簡化版)"""
    id: str
    proposal_id: str
    title: str
    status: CaseStatus
    created_at: datetime
    updated_at: datetime
    # 根據角色顯示對方資訊
    counterpart_info: Optional[str] = None  # 對方的基本資訊 (如 email 前綴)

class ContactInfo(BaseModel):
    """聯絡資訊 Schema (NDA 簽署後可見)"""
    seller_email: str
    buyer_email: str
    seller_name: Optional[str] = None
    buyer_name: Optional[str] = None

# === Comment Schemas ===

class CommentCreate(BaseModel):
    """創建留言的 Schema"""
    content: str = Field(..., min_length=1, max_length=1000, description="留言內容")

class CommentResponse(BaseModel):
    """留言回應 Schema"""
    id: str
    case_id: str
    user_id: str
    content: str
    created_at: datetime
    # 額外的用戶資訊 (方便前端顯示)
    user_email: Optional[str] = None
    is_seller: bool = False  # 是否為賣方留言

# === 狀態操作 Schemas ===

class CaseStatusUpdate(BaseModel):
    """Case 狀態更新 Schema"""
    action: str = Field(..., description="操作類型: interest, reject, sign_nda")
    message: Optional[str] = Field(None, max_length=500, description="操作附帶訊息")