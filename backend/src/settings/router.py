"""
应用设置路由
管理 AI 配置、上下文上限等运行时设置
"""
import json
import os
import logging
from fastapi import APIRouter
from pydantic import BaseModel

from ..core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/settings", tags=["设置"])

SETTINGS_FILE = os.path.join(settings.data_dir, "settings.json")


class AIConfigModel(BaseModel):
    apiKey: str = ""
    baseUrl: str = "https://api.openai.com/v1"
    model: str = "gpt-4"


class TTSConfigModel(BaseModel):
    apiKey: str = ""
    baseUrl: str = "https://api.minimaxi.com"
    model: str = "speech-2.8-hd"
    voiceId: str = "male-qn-qingse"
    speed: float = 1.0
    autoRead: bool = False


class AppSettingsModel(BaseModel):
    ai: AIConfigModel = AIConfigModel()
    contextLimit: int = 0
    textSpeed: int = 50
    autoPlayInterval: int = 3000
    enableMenuAnimation: bool = True
    experimentalUI: bool = False
    tts: TTSConfigModel = TTSConfigModel()


def _load_settings() -> AppSettingsModel:
    """从文件加载设置"""
    if os.path.exists(SETTINGS_FILE):
        with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        return AppSettingsModel(**data)
    # 从环境变量构建默认设置
    return AppSettingsModel(
        ai=AIConfigModel(
            apiKey=settings.ai_api_key,
            baseUrl=settings.ai_base_url,
            model=settings.ai_model,
        ),
        contextLimit=settings.max_context_messages,
    )


def _save_settings(app_settings: AppSettingsModel) -> None:
    """保存设置到文件并同步到运行时配置"""
    os.makedirs(os.path.dirname(SETTINGS_FILE), exist_ok=True)
    with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(app_settings.model_dump(), f, ensure_ascii=False, indent=2)

    # 同步到运行时配置
    settings.ai_api_key = app_settings.ai.apiKey
    settings.ai_base_url = app_settings.ai.baseUrl
    settings.ai_model = app_settings.ai.model
    settings.max_context_messages = app_settings.contextLimit


@router.get("", response_model=AppSettingsModel)
async def get_settings() -> AppSettingsModel:
    """获取应用设置"""
    return _load_settings()


@router.put("", response_model=AppSettingsModel)
async def update_settings(request: AppSettingsModel) -> AppSettingsModel:
    """更新应用设置"""
    _save_settings(request)
    logger.info("设置已更新")
    return request
