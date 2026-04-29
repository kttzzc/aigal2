"""
AIgal 核心配置
从环境变量读取所有敏感信息和可配置项
"""
import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    """应用配置，优先从环境变量读取"""

    # AI API 配置
    ai_api_key: str = os.getenv("AI_API_KEY", "")
    ai_base_url: str = os.getenv("AI_BASE_URL", "https://api.openai.com/v1")
    ai_model: str = os.getenv("AI_MODEL", "gpt-4")

    # 数据库
    database_url: str = os.getenv(
        "DATABASE_URL", "sqlite+aiosqlite:///./data/aigal.db"
    )

    # 数据文件目录
    data_dir: str = os.getenv("DATA_DIR", "./data")

    # 上下文消息上限（0 = 无限制）
    max_context_messages: int = int(os.getenv("MAX_CONTEXT_MESSAGES", "0"))

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
