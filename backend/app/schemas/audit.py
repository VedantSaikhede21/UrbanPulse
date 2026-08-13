from typing import Optional

from pydantic import BaseModel


class AuditOut(BaseModel):
    id: int
    user_id: Optional[str] = None
    action: str
    target_table: str
    record_id: Optional[str] = None
    details: Optional[dict] = None
    created_at: Optional[str] = None
