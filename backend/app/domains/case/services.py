# app/domains/case/services.py
from typing import Optional, List
from datetime import datetime
from beanie import PydanticObjectId
from .models import Case, Comment
from .schemas import CaseCreate, ContactInfo, CommentCreate
from app.domains.proposal.models import Proposal
from app.domains.user.models import User
from app.shared.models.enums import CaseStatus, ProposalStatus

class CaseService:
    
    @staticmethod
    async def create_case(data: CaseCreate, seller_id: str) -> Case:
        """從 approved proposal 創建 case 發送給買方"""
        # 1. 驗證 proposal 存在且已被核准
        try:
            proposal = await Proposal.get(PydanticObjectId(data.proposal_id))
        except:
            raise ValueError("提案不存在")
        
        if not proposal:
            raise ValueError("提案不存在")
        
        if proposal.status != ProposalStatus.APPROVED:
            raise ValueError("只有已核准的提案才能創建 case")
        
        if proposal.seller_id != seller_id:
            raise ValueError("只能為自己的提案創建 case")
        
        # 2. 驗證買方存在
        try:
            buyer = await User.get(PydanticObjectId(data.buyer_id))
        except:
            raise ValueError("買方不存在")
        
        if not buyer:
            raise ValueError("買方不存在")
        
        # 3. 檢查是否已經發送過給同一買方
        existing_case = await Case.find_one({
            "proposal_id": data.proposal_id,
            "buyer_id": data.buyer_id
        })
        
        if existing_case:
            raise ValueError("已經向此買方發送過此提案")
        
        # 4. 創建 case
        case = Case(
            proposal_id=data.proposal_id,
            seller_id=seller_id,
            buyer_id=data.buyer_id,
            title=proposal.title,
            brief_content=proposal.brief_content,
            detailed_content=proposal.detailed_content,
            initial_message=data.initial_message,
            status=CaseStatus.CREATED
        )
        
        return await case.insert()
    
    @staticmethod
    async def get_case_by_id(case_id: str) -> Optional[Case]:
        """通過 ID 獲取 case"""
        try:
            return await Case.get(PydanticObjectId(case_id))
        except:
            return None
    
    @staticmethod
    async def get_seller_cases(seller_id: str) -> List[Case]:
        """獲取賣方發送的所有 cases"""
        return await Case.find({"seller_id": seller_id}).sort(-Case.created_at).to_list()
    
    @staticmethod
    async def get_buyer_cases(buyer_id: str) -> List[Case]:
        """獲取買方收到的所有 cases"""
        return await Case.find({"buyer_id": buyer_id}).sort(-Case.created_at).to_list()
    
    @staticmethod
    async def express_interest(case_id: str, buyer_id: str) -> Optional[Case]:
        """買方表達興趣 (created → interested)"""
        case = await CaseService.get_case_by_id(case_id)
        if not case:
            return None
        
        # 權限檢查
        if case.buyer_id != buyer_id:
            raise ValueError("只能對發送給自己的 case 表達興趣")
        
        # 狀態檢查
        if case.status != CaseStatus.CREATED:
            raise ValueError("只有 created 狀態的 case 可以表達興趣")
        
        # 更新狀態
        update_data = {
            "status": CaseStatus.INTERESTED,
            "interested_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await case.update({"$set": update_data})
        return await CaseService.get_case_by_id(case_id)
    
    @staticmethod
    async def reject_case(case_id: str, buyer_id: str) -> Optional[Case]:
        """買方拒絕 case (created → rejected)"""
        case = await CaseService.get_case_by_id(case_id)
        if not case:
            return None
        
        # 權限檢查
        if case.buyer_id != buyer_id:
            raise ValueError("只能拒絕發送給自己的 case")
        
        # 狀態檢查
        if case.status != CaseStatus.CREATED:
            raise ValueError("只有 created 狀態的 case 可以拒絕")
        
        # 更新狀態
        update_data = {
            "status": CaseStatus.REJECTED,
            "rejected_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await case.update({"$set": update_data})
        return await CaseService.get_case_by_id(case_id)
    
    @staticmethod
    async def sign_nda(case_id: str, buyer_id: str) -> Optional[Case]:
        """買方簽署 NDA (interested → nda_signed)"""
        case = await CaseService.get_case_by_id(case_id)
        if not case:
            return None
        
        # 權限檢查
        if case.buyer_id != buyer_id:
            raise ValueError("只能為發送給自己的 case 簽署 NDA")
        
        # 狀態檢查
        if case.status != CaseStatus.INTERESTED:
            raise ValueError("只有 interested 狀態的 case 可以簽署 NDA")
        
        # 更新狀態
        update_data = {
            "status": CaseStatus.NDA_SIGNED,
            "nda_signed_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await case.update({"$set": update_data})
        return await CaseService.get_case_by_id(case_id)
    
    @staticmethod
    async def get_contact_info(case_id: str, user_id: str) -> Optional[ContactInfo]:
        """獲取雙方聯絡資訊 (僅 NDA 簽署後可用)"""
        case = await CaseService.get_case_by_id(case_id)
        if not case:
            return None
        
        # 權限檢查
        if case.seller_id != user_id and case.buyer_id != user_id:
            raise ValueError("只有案例相關方可以查看聯絡資訊")
        
        # 狀態檢查
        if case.status != CaseStatus.NDA_SIGNED:
            raise ValueError("只有簽署 NDA 後才能查看聯絡資訊")
        
        # 獲取雙方用戶資訊
        try:
            seller = await User.get(PydanticObjectId(case.seller_id))
            buyer = await User.get(PydanticObjectId(case.buyer_id))
        except:
            raise ValueError("無法獲取用戶資訊")
        
        if not seller or not buyer:
            raise ValueError("無法獲取用戶資訊")
        
        return ContactInfo(
            seller_email=seller.email,
            buyer_email=buyer.email,
            seller_name=getattr(seller, 'name', None),
            buyer_name=getattr(buyer, 'name', None)
        )

class CommentService:
    
    @staticmethod
    async def create_comment(case_id: str, data: CommentCreate, user_id: str) -> Comment:
        """在指定 case 下創建留言"""
        # 1. 驗證 case 存在
        case = await CaseService.get_case_by_id(case_id)
        if not case:
            raise ValueError("Case 不存在")
        
        # 2. 權限檢查：只有買賣雙方可以留言
        if case.seller_id != user_id and case.buyer_id != user_id:
            raise ValueError("只有買賣雙方可以在此 case 留言")
        
        # 3. 創建留言
        comment = Comment(
            case_id=case_id,
            user_id=user_id,
            content=data.content
        )
        
        return await comment.insert()
    
    @staticmethod
    async def get_case_comments(case_id: str, user_id: str) -> List[Comment]:
        """獲取指定 case 的所有留言"""
        # 1. 驗證 case 存在且用戶有權限查看
        case = await CaseService.get_case_by_id(case_id)
        if not case:
            raise ValueError("Case 不存在")
        
        if case.seller_id != user_id and case.buyer_id != user_id:
            raise ValueError("只有買賣雙方可以查看此 case 的留言")
        
        # 2. 獲取留言 (按時間排序，新的在前面)
        return await Comment.find({"case_id": case_id}).sort(-Comment.created_at).to_list()