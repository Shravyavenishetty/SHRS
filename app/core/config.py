import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

class Settings:
    """Application settings and configurations."""
    
    PROJECT_NAME: str = "Swecha Health Records System"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "A FastAPI-based Health Records System using MongoDB"

    # MongoDB Configuration
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "swecha_health_records")

    # Security (JWT Secret Key)
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60  # Token expiration time

settings = Settings()
