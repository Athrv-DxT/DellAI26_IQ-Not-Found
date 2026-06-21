import os
from dotenv import load_dotenv

# Load .env file from the root directory
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
load_dotenv(dotenv_path)

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://minion@localhost:5432/hackathon_os"
    )
    # Automatically toggle pgvector based on availability or environment
    USE_PGVECTOR: bool = os.getenv("USE_PGVECTOR", "False").lower() in ("true", "1", "yes")
    PROJECT_NAME: str = "State-Driven Agentic OS"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-12345")

    class Config:
        case_sensitive = True

settings = Settings()
