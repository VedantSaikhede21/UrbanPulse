from typing import Optional

from pydantic import BaseModel, Field


class OfficerOut(BaseModel):
    id: str
    name: str
    department: str
    department_id: Optional[str] = None
    role: str
    is_active: bool
    created_at: Optional[str] = None


class CreateOfficerRequest(BaseModel):
    name: str
    department: Optional[str] = None  # legacy string; ignored if department_id is provided
    department_id: Optional[str] = None  # preferred path — FK to departments.id
    role: str = Field(default="officer", pattern="^(officer|dept_head|admin|super_admin)$")
    user_id: Optional[str] = None


class UpdateOfficerRequest(BaseModel):
    is_active: bool


class AssignTicketRequest(BaseModel):
    officer_id: str
