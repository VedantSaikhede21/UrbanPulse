from typing import Optional

from pydantic import BaseModel


class MeResponse(BaseModel):
    id: str
    role: str
    email: Optional[str] = None
    phone: Optional[str] = None
    name: Optional[str] = None