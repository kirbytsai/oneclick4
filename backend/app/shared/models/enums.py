from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    BUYER = "buyer"
    SELLER = "seller"


class ProposalStatus(str, Enum):
    DRAFT = "draft"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    SENT = "sent"
    ARCHIVED = "archived"


class CaseStatus(str, Enum):
    SENT = "sent"
    VIEWED = "viewed"
    DISCUSSING = "discussing"
    INTERESTED = "interested"
    DECLINED = "declined"
    COMPLETED = "completed"

class ProposalStatus(str, Enum):
    DRAFT = "draft"                  # 草稿 - 可編輯
    UNDER_REVIEW = "under_review"    # 審核中 - 不可編輯
    APPROVED = "approved"            # 已核准 - 可生成 case
    REJECTED = "rejected"            # 已拒絕 - 可退回草稿
    ARCHIVED = "archived"            # 已歸檔

class CaseStatus(str, Enum):
    CREATED = "created"        # 已建立發送給買方
    INTERESTED = "interested"  # 買方表達興趣
    REJECTED = "rejected"      # 買方拒絕
    NDA_SIGNED = "nda_signed"  # 買方已簽 NDA