import os
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # LLM Configuration (OpenAI-compatible)
    LLM_API_KEY: str
    LLM_API_BASE: str 
    LLM_MODEL: str 
    
    # Embedding Configuration (智谱 AI)
    EMBEDDING_API_KEY: str
    EMBEDDING_API_BASE: str = "https://open.bigmodel.cn/api/paas/v4"
    EMBEDDING_MODEL: str = "embedding-3"
    EMBEDDING_DIMENSION: int = 1024
    
    # Cloudflare Vectorize
    CF_ACCOUNT_ID: str
    CF_API_TOKEN: str
    CF_VECTORIZE_INDEX: str = "legal-knowledge-base"
    
    # Cloudflare R2
    R2_ACCESS_KEY_ID: str
    R2_SECRET_ACCESS_KEY: str
    R2_ENDPOINT_URL: str
    R2_BUCKET_NAME: str
    R2_PUBLIC_URL: str
    
    # Timeout Configuration (防止请求无限挂起)
    LLM_REQUEST_TIMEOUT: int = 120  # LLM API 请求超时（秒）
    LLM_MAX_RETRIES: int = 2        # LLM API 最大重试次数
    R2_CONNECT_TIMEOUT: int = 10    # R2 连接超时（秒）
    R2_READ_TIMEOUT: int = 60       # R2 读取超时（秒）
    
    # App
    APP_NAME: str = "Legal AI Agent"
    API_V1_STR: str = "/v1"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore" # Allow extra fields in .env

@lru_cache()
def get_settings():
    return Settings()