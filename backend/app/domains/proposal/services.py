# app/domains/proposal/services.py

from typing import Optional, List
from datetime import datetime
from beanie import PydanticObjectId
from .models import Proposal
from .schemas import ProposalCreate, ProposalUpdate, ProposalReview
from app.shared.models.enums import ProposalStatus

class ProposalService:
    
    @staticmethod
    async def create_proposal(data: ProposalCreate, seller_id: str) -> Proposal:
        """建立新提案 (草稿狀態)"""
        proposal = Proposal(
            **data.dict(),
            seller_id=seller_id,
            status=ProposalStatus.DRAFT
        )
        return await proposal.insert()
    
    @staticmethod
    async def get_proposal_by_id(proposal_id: str) -> Optional[Proposal]:
        """通過 ID 獲取提案"""
        try:
            return await Proposal.get(PydanticObjectId(proposal_id))
        except:
            return None
    
    @staticmethod
    async def update_proposal(proposal_id: str, data: ProposalUpdate) -> Optional[Proposal]:
        """更新提案 (只有 draft 狀態可以更新)"""
        proposal = await ProposalService.get_proposal_by_id(proposal_id)
        if not proposal:
            return None
        
        # 只有草稿狀態可以編輯
        if proposal.status != ProposalStatus.DRAFT:
            raise ValueError("只有草稿狀態的提案可以編輯")
        
        update_data = data.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        await proposal.update({"$set": update_data})
        return await ProposalService.get_proposal_by_id(proposal_id)
    
    @staticmethod
    async def submit_for_review(proposal_id: str) -> Optional[Proposal]:
        """提交審核 (draft → under_review)"""
        proposal = await ProposalService.get_proposal_by_id(proposal_id)
        if not proposal:
            return None
        
        if proposal.status != ProposalStatus.DRAFT:
            raise ValueError("只有草稿狀態的提案可以提交審核")
        
        update_data = {
            "status": ProposalStatus.UNDER_REVIEW,
            "submitted_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await proposal.update({"$set": update_data})
        return await ProposalService.get_proposal_by_id(proposal_id)
    
    @staticmethod
    async def review_proposal(proposal_id: str, review_data: ProposalReview, reviewer_id: str) -> Optional[Proposal]:
        """審核提案 (admin 專用)"""
        proposal = await ProposalService.get_proposal_by_id(proposal_id)
        if not proposal:
            return None
        
        if proposal.status != ProposalStatus.UNDER_REVIEW:
            raise ValueError("只有審核中的提案可以進行審核")
        
        new_status = ProposalStatus.APPROVED if review_data.approved else ProposalStatus.REJECTED
        
        update_data = {
            "status": new_status,
            "reviewed_at": datetime.utcnow(),
            "reviewed_by": reviewer_id,
            "updated_at": datetime.utcnow()
        }
        
        if not review_data.approved and review_data.reject_reason:
            update_data["reject_reason"] = review_data.reject_reason
        
        await proposal.update({"$set": update_data})
        return await ProposalService.get_proposal_by_id(proposal_id)
    
    @staticmethod
    async def resubmit_proposal(proposal_id: str) -> Optional[Proposal]:
        """重新提交提案 (rejected → draft)"""
        proposal = await ProposalService.get_proposal_by_id(proposal_id)
        if not proposal:
            return None
        
        if proposal.status != ProposalStatus.REJECTED:
            raise ValueError("只有被拒絕的提案可以重新提交")
        
        update_data = {
            "status": ProposalStatus.DRAFT,
            "reject_reason": None,
            "updated_at": datetime.utcnow()
        }
        
        await proposal.update({"$set": update_data})
        return await ProposalService.get_proposal_by_id(proposal_id)
    
    @staticmethod
    async def archive_proposal(proposal_id: str) -> Optional[Proposal]:
        """歸檔提案"""
        proposal = await ProposalService.get_proposal_by_id(proposal_id)
        if not proposal:
            return None
        
        update_data = {
            "status": ProposalStatus.ARCHIVED,
            "updated_at": datetime.utcnow()
        }
        
        await proposal.update({"$set": update_data})
        return await ProposalService.get_proposal_by_id(proposal_id)
    
    @staticmethod
    async def get_seller_proposals(seller_id: str, status: Optional[ProposalStatus] = None) -> List[Proposal]:
        """獲取提案方的提案列表"""
        query = {"seller_id": seller_id}
        if status:
            query["status"] = status
        
        return await Proposal.find(query).sort(-Proposal.created_at).to_list()
    
    @staticmethod
    async def get_proposals_by_status(status: ProposalStatus) -> List[Proposal]:
        """按狀態獲取提案列表 (admin 用)"""
        return await Proposal.find({"status": status}).sort(-Proposal.created_at).to_list()
    
    @staticmethod
    async def get_all_proposals() -> List[Proposal]:
        """獲取所有提案 (admin 用)"""
        return await Proposal.find().sort(-Proposal.created_at).to_list()