# app/domains/proposal/api.py

from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from .schemas import (
    ProposalCreate, 
    ProposalUpdate, 
    ProposalResponse, 
    ProposalListResponse,
    ProposalReview
)
from .services import ProposalService
from app.domains.auth.deps import get_current_active_user, require_admin
from app.domains.user.models import User
from app.shared.models.enums import UserRole, ProposalStatus

router = APIRouter(prefix="/proposals", tags=["Proposals"])

# ========== 提案方功能 ==========

@router.post("/", response_model=ProposalResponse, status_code=status.HTTP_201_CREATED)
async def create_proposal(
    data: ProposalCreate,
    current_user: User = Depends(get_current_active_user)
):
    """建立新提案 (提案方專用)"""
    # 只有賣方可以建立提案
    if current_user.role != UserRole.SELLER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有賣方可以建立提案"
        )
    
    try:
        proposal = await ProposalService.create_proposal(data, str(current_user.id))
        return ProposalResponse(**proposal.dict())
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/my", response_model=List[ProposalListResponse])
async def get_my_proposals(
    status_filter: Optional[ProposalStatus] = Query(None, alias="status"),
    current_user: User = Depends(get_current_active_user)
):
    """獲取我的提案列表 (提案方專用)"""
    if current_user.role != UserRole.SELLER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有賣方可以查看提案"
        )
    
    proposals = await ProposalService.get_seller_proposals(str(current_user.id), status_filter)
    return [ProposalListResponse(**proposal.dict()) for proposal in proposals]

@router.get("/{proposal_id}", response_model=ProposalResponse)
async def get_proposal(
    proposal_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """獲取單個提案詳情"""
    proposal = await ProposalService.get_proposal_by_id(proposal_id)
    if not proposal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="提案不存在"
        )
    
    # 權限檢查：只有提案方或管理員可以查看
    if proposal.seller_id != str(current_user.id) and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="權限不足"
        )
    
    return ProposalResponse(**proposal.dict())

@router.put("/{proposal_id}", response_model=ProposalResponse)
async def update_proposal(
    proposal_id: str,
    data: ProposalUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """更新提案 (只有草稿狀態可以更新)"""
    proposal = await ProposalService.get_proposal_by_id(proposal_id)
    if not proposal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="提案不存在"
        )
    
    # 權限檢查：只有提案方可以編輯
    if proposal.seller_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只能編輯自己的提案"
        )
    
    try:
        updated_proposal = await ProposalService.update_proposal(proposal_id, data)
        return ProposalResponse(**updated_proposal.dict())
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/{proposal_id}/submit", response_model=ProposalResponse)
async def submit_proposal(
    proposal_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """提交提案審核"""
    proposal = await ProposalService.get_proposal_by_id(proposal_id)
    if not proposal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="提案不存在"
        )
    
    # 權限檢查：只有提案方可以提交
    if proposal.seller_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只能提交自己的提案"
        )
    
    try:
        submitted_proposal = await ProposalService.submit_for_review(proposal_id)
        return ProposalResponse(**submitted_proposal.dict())
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/{proposal_id}/resubmit", response_model=ProposalResponse)
async def resubmit_proposal(
    proposal_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """重新提交被拒絕的提案"""
    proposal = await ProposalService.get_proposal_by_id(proposal_id)
    if not proposal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="提案不存在"
        )
    
    # 權限檢查：只有提案方可以重新提交
    if proposal.seller_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只能重新提交自己的提案"
        )
    
    try:
        resubmitted_proposal = await ProposalService.resubmit_proposal(proposal_id)
        return ProposalResponse(**resubmitted_proposal.dict())
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.delete("/{proposal_id}", response_model=dict)
async def delete_proposal(
    proposal_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """刪除提案 (只能刪除草稿或被拒絕的提案)"""
    proposal = await ProposalService.get_proposal_by_id(proposal_id)
    if not proposal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="提案不存在"
        )
    
    # 權限檢查：只有提案方可以刪除自己的提案
    if proposal.seller_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只能刪除自己的提案"
        )
    
    # 只能刪除草稿或被拒絕的提案
    if proposal.status not in [ProposalStatus.DRAFT, ProposalStatus.REJECTED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="只能刪除草稿或被拒絕的提案"
        )
    
    success = await ProposalService.delete_proposal(proposal_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="刪除提案失敗"
        )
    
    return {"message": "提案已刪除", "proposal_id": proposal_id}

# ========== 管理員功能 ==========

@router.get("/", response_model=List[ProposalListResponse])
async def get_all_proposals(
    status_filter: Optional[ProposalStatus] = Query(None, alias="status"),
    current_user: User = Depends(require_admin)
):
    """獲取所有提案列表 (管理員專用)"""
    if status_filter:
        proposals = await ProposalService.get_proposals_by_status(status_filter)
    else:
        proposals = await ProposalService.get_all_proposals()
    
    return [ProposalListResponse(**proposal.dict()) for proposal in proposals]

@router.post("/{proposal_id}/review", response_model=ProposalResponse)
async def review_proposal(
    proposal_id: str,
    review_data: ProposalReview,
    current_user: User = Depends(require_admin)
):
    """審核提案 (管理員專用) - 可以核准或拒絕"""
    try:
        reviewed_proposal = await ProposalService.review_proposal(
            proposal_id, 
            review_data, 
            str(current_user.id)
        )
        if not reviewed_proposal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="提案不存在"
            )
        
        return ProposalResponse(**reviewed_proposal.dict())
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/{proposal_id}/archive", response_model=ProposalResponse)
async def archive_proposal(
    proposal_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """歸檔提案 (提案方或管理員)"""
    proposal = await ProposalService.get_proposal_by_id(proposal_id)
    if not proposal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="提案不存在"
        )
    
    # 權限檢查：只有提案方或管理員可以歸檔
    if proposal.seller_id != str(current_user.id) and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有提案方或管理員可以歸檔提案"
        )
    
    # 只有已核准的提案可以歸檔
    if proposal.status != ProposalStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="只有已核准的提案可以歸檔"
        )
    
    archived_proposal = await ProposalService.archive_proposal(proposal_id)
    return ProposalResponse(**archived_proposal.dict())