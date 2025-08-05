from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    DATABASE_NAME: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    AI_SERVICE_URL: str
    OPENAI_API_KEY: str

    class Config:
        env_file = ".env"

settings = Settings()