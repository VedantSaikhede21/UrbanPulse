from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    environment: str
    database_connected: bool
    supabase_configured: bool
    gemini_configured: bool
    twilio_configured: bool
    graphs_loaded: bool


class ReadinessResponse(BaseModel):
    status: str
    environment: str
    database_connected: bool
    graphs_loaded: bool