from typing import Optional

from pydantic import BaseModel


class OfficerOut(BaseModel):
    id: str
    name: str
    department: str
    is_active: bool
    created_at: Optional[str] = None


class CreateOfficerRequest(BaseModel):
    name: str
    department: str
    user_id: Optional[str] = None


class UpdateOfficerRequest(BaseModel):
    is_active: bool


class AssignTicketRequest(BaseModel):
    officer_id: str
