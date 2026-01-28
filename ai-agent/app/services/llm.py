from langchain_openai import ChatOpenAI
from app.core.config import get_settings

settings = get_settings()

def get_llm(temperature: float = 0.7):
    """
    Get configured LLM instance (OpenAI-compatible API).
    配置了请求超时和重试，防止请求无限挂起。
    """
    return ChatOpenAI(
        model=settings.LLM_MODEL,
        openai_api_key=settings.LLM_API_KEY,
        openai_api_base=settings.LLM_API_BASE,
        temperature=temperature,
        request_timeout=settings.LLM_REQUEST_TIMEOUT,
        max_retries=settings.LLM_MAX_RETRIES
    )

def get_coder_llm(temperature: float = 0.0):
    """
    Get configured LLM instance for code generation (same as main LLM).
    配置了请求超时和重试，防止请求无限挂起。
    """
    return ChatOpenAI(
        model=settings.LLM_MODEL,
        openai_api_key=settings.LLM_API_KEY,
        openai_api_base=settings.LLM_API_BASE,
        temperature=temperature,
        request_timeout=settings.LLM_REQUEST_TIMEOUT,
        max_retries=settings.LLM_MAX_RETRIES
    )