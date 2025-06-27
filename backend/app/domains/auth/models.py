from beanie import Document
from pydantic import Field
from datetime import datetime
from typing import Optional


class RefreshToken(Document):
    user_id: str = Field(..., index=True)
    token: str = Field(..., unique=True)
    expires_at: datetime
    is_revoked: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        collection = "refresh_tokens"