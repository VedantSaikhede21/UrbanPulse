from typing import Optional

from pydantic import BaseModel, Field


class OfficerOut(BaseModel):
    id: str
    name: str
    department: str
    role: str
    is_active: bool
    created_at: Optional[str] = None


class CreateOfficerRequest(BaseModel):
    name: str
    department: str
    role: str = Field(default="officer", pattern="^(officer|dept_head|admin|super_admin)$")
    user_id: Optional[str] = None


class UpdateOfficerRequest(BaseModel):
    is_active: bool


class AssignTicketRequest(BaseModel):
    officer_id: str
