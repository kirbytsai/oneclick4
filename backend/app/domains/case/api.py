# app/domains/case/api.py
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from .schemas import (
    CaseCreate, CaseResponse, CaseListResponse, ContactInfo,
    CommentCreate, CommentResponse
)
from .services import CaseService, CommentService
from app.domains.auth.deps import get_current_active_user
from app.domains.user.models import User
from app.shared.models.enums import CaseStatus, UserRole

router = APIRouter(prefix="/cases", tags=["Cases"])

# === Case CRUD 操作 ===

@router.post("/", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
async def create_case(
    data: CaseCreate,
    current_user: User = Depends(get_current_active_user)
):
    """創建 case 發送給買方 (賣方功能)"""
    # 只有賣方可以創建 case
    if current_user.role != UserRole.SELLER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有賣方可以創建 case"
        )
    
    try:
        case = await CaseService.create_case(data, str(current_user.id))
        
        # 根據當前用戶角色決定是否返回 detailed_content
        response_data = case.dict()
        if current_user.role != UserRole.SELLER or case.seller_id != str(current_user.id):
            response_data["detailed_content"] = None
        
        return CaseResponse(**response_data)
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/my-sent", response_model=List[CaseListResponse])
async def get_my_sent_cases(current_user: User = Depends(get_current_active_user)):
    """獲取我發送的 cases (賣方功能)"""
    if current_user.role != UserRole.SELLER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有賣方可以查看發送的 cases"
        )
    
    cases = await CaseService.get_seller_cases(str(current_user.id))
    
    # 轉換為列表回應格式，並添加買方資訊
    response_cases = []
    for case in cases:
        # 獲取買方基本資訊
        try:
            from app.domains.user.services import UserService
            buyer = await UserService.get_user_by_id(case.buyer_id)
            counterpart_info = buyer.email.split('@')[0] + "..." if buyer else "未知買方"
        except:
            counterpart_info = "未知買方"
        
        response_cases.append(CaseListResponse(
            id=str(case.id),
            proposal_id=case.proposal_id,
            title=case.title,
            status=case.status,
            created_at=case.created_at,
            updated_at=case.updated_at,
            counterpart_info=counterpart_info
        ))
    
    return response_cases

@router.get("/my-received", response_model=List[CaseListResponse])
async def get_my_received_cases(current_user: User = Depends(get_current_active_user)):
    """獲取我收到的 cases (買方功能)"""
    if current_user.role != UserRole.BUYER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有買方可以查看收到的 cases"
        )
    
    cases = await CaseService.get_buyer_cases(str(current_user.id))
    
    # 轉換為列表回應格式，並添加賣方資訊
    response_cases = []
    for case in cases:
        # 獲取賣方基本資訊
        try:
            from app.domains.user.services import UserService
            seller = await UserService.get_user_by_id(case.seller_id)
            counterpart_info = seller.email.split('@')[0] + "..." if seller else "未知賣方"
        except:
            counterpart_info = "未知賣方"
        
        response_cases.append(CaseListResponse(
            id=str(case.id),
            proposal_id=case.proposal_id,
            title=case.title,
            status=case.status,
            created_at=case.created_at,
            updated_at=case.updated_at,
            counterpart_info=counterpart_info
        ))
    
    return response_cases

@router.get("/{case_id}", response_model=CaseResponse)
async def get_case(
    case_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """獲取 case 詳情"""
    case = await CaseService.get_case_by_id(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case 不存在"
        )
    
    # 權限檢查：只有買賣雙方可以查看
    if case.seller_id != str(current_user.id) and case.buyer_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有買賣雙方可以查看此 case"
        )
    
    # 根據用戶角色和 NDA 狀態決定可見內容
    response_data = case.dict()
    
    # 賣方可以看到所有內容
    if case.seller_id == str(current_user.id):
        pass  # 賣方可以看到所有內容
    # 買方只有在簽署 NDA 後才能看到 detailed_content
    elif case.buyer_id == str(current_user.id):
        if case.status != CaseStatus.NDA_SIGNED:
            response_data["detailed_content"] = None
    
    return CaseResponse(**response_data)

# === Case 狀態操作 ===

@router.post("/{case_id}/interest", response_model=CaseResponse)
async def express_interest(
    case_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """表達興趣 (買方功能)"""
    if current_user.role != UserRole.BUYER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有買方可以表達興趣"
        )
    
    try:
        case = await CaseService.express_interest(case_id, str(current_user.id))
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case 不存在"
            )
        
        # 買方視角，未簽 NDA 不顯示詳細內容
        response_data = case.dict()
        if case.status != CaseStatus.NDA_SIGNED:
            response_data["detailed_content"] = None
        
        return CaseResponse(**response_data)
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/{case_id}/reject", response_model=CaseResponse)
async def reject_case(
    case_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """拒絕 case (買方功能)"""
    if current_user.role != UserRole.BUYER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有買方可以拒絕 case"
        )
    
    try:
        case = await CaseService.reject_case(case_id, str(current_user.id))
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case 不存在"
            )
        
        # 買方視角，拒絕後也不顯示詳細內容
        response_data = case.dict()
        response_data["detailed_content"] = None
        
        return CaseResponse(**response_data)
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/{case_id}/sign-nda", response_model=CaseResponse)
async def sign_nda(
    case_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """簽署 NDA (買方功能)"""
    if current_user.role != UserRole.BUYER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有買方可以簽署 NDA"
        )
    
    try:
        case = await CaseService.sign_nda(case_id, str(current_user.id))
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case 不存在"
            )
        
        # 簽署 NDA 後可以看到詳細內容
        return CaseResponse(**case.dict())
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{case_id}/contact-info", response_model=ContactInfo)
async def get_contact_info(
    case_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """獲取雙方聯絡資訊 (NDA 簽署後可用)"""
    try:
        contact_info = await CaseService.get_contact_info(case_id, str(current_user.id))
        if not contact_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case 不存在"
            )
        
        return contact_info
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

# === 留言功能 ===

@router.post("/{case_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    case_id: str,
    data: CommentCreate,
    current_user: User = Depends(get_current_active_user)
):
    """在指定 case 下留言"""
    try:
        comment = await CommentService.create_comment(case_id, data, str(current_user.id))
        
        # 添加用戶資訊
        response_data = comment.dict()
        response_data["user_email"] = current_user.email
        
        # 確定是否為賣方留言
        case = await CaseService.get_case_by_id(case_id)
        response_data["is_seller"] = (case and case.seller_id == str(current_user.id))
        
        return CommentResponse(**response_data)
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{case_id}/comments", response_model=List[CommentResponse])
async def get_case_comments(
    case_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """獲取指定 case 的所有留言"""
    try:
        comments = await CommentService.get_case_comments(case_id, str(current_user.id))
        
        # 獲取 case 資訊以確定賣方
        case = await CaseService.get_case_by_id(case_id)
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case 不存在"
            )
        
        # 為每個留言添加用戶資訊
        response_comments = []
        for comment in comments:
            # 獲取留言者資訊
            try:
                from app.domains.user.services import UserService
                user = await UserService.get_user_by_id(comment.user_id)
                user_email = user.email if user else "未知用戶"
            except:
                user_email = "未知用戶"
            
            response_data = comment.dict()
            response_data["user_email"] = user_email
            response_data["is_seller"] = (comment.user_id == case.seller_id)
            
            response_comments.append(CommentResponse(**response_data))
        
        return response_comments
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )