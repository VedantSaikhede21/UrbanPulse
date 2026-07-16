from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # API Configurations
    SUPABASE_URL: Optional[str] = "http://localhost:54321"
    SUPABASE_ANON_KEY: Optional[str] = "placeholder-anon-key"
    DATABASE_URL: Optional[str] = "postgresql://postgres:postgres@localhost:5432/postgres"
    
    GEMINI_API_KEY: Optional[str] = None
    
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_WHATSAPP_NUMBER: Optional[str] = "whatsapp:+14155238886"

    # Environment
    ENV: str = "development"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
