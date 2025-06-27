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