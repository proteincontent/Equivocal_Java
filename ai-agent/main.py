import uvicorn
import os
from dotenv import load_dotenv

# Load .env file explicitly
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.api import api_router

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "Legal AI Agent Service is running"}

if __name__ == "__main__":
    # Windows 上 `8000` 可能落在系统 Excluded Port Range 内，绑定会触发 WinError 10013（Access is denied）。
    # 通过环境变量可覆盖：AGENT_HOST / AGENT_PORT / AGENT_RELOAD
    host = os.getenv("AGENT_HOST", os.getenv("HOST", "127.0.0.1"))
    port = int(os.getenv("AGENT_PORT", os.getenv("PORT", "8100")))
    reload_enabled = os.getenv("AGENT_RELOAD", "true").lower() in {"1", "true", "yes"}

    try:
        uvicorn.run("main:app", host=host, port=port, reload=reload_enabled)
    except OSError as e:
        # 常见：端口在 excluded range / 端口被占用 / 安全策略阻止监听
        winerror = getattr(e, "winerror", None)
        if winerror == 10013:
            print(
                "\n[ERROR] Socket bind 被拒绝（WinError 10013）。\n"
                "可能原因：端口落在 Windows Excluded Port Range 或被安全策略占用。\n"
                "解决：改用其它端口（例如 8100/9000），或设置环境变量 AGENT_PORT。\n"
                "检查 excluded ports：netsh interface ipv4 show excludedportrange protocol=tcp\n"
            )
        raise
