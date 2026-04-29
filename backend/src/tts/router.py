"""
TTS 语音合成路由
使用 MiniMax T2A v2 API 进行语音合成，支持缓存避免重复调用
"""
import hashlib
import os
import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel

import httpx

from ..core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/tts", tags=["TTS 语音合成"])

# TTS 音频缓存目录
TTS_CACHE_DIR = os.path.join(settings.data_dir, "tts_cache")
os.makedirs(TTS_CACHE_DIR, exist_ok=True)


class TTSRequest(BaseModel):
    """TTS 请求体"""
    text: str
    voice_id: str = "male-qn-qingse"
    speed: float = 1.0
    emotion: str = ""
    model: str = "speech-2.8-hd"


def _cache_key(text: str, voice_id: str, speed: float, emotion: str, model: str) -> str:
    """
    基于文本 + 音色 + 速度 + 情绪 + 模型生成唯一缓存 key
    相同文本和参数组合只会调用一次 MiniMax API
    """
    raw = f"{text}|{voice_id}|{speed}|{emotion}|{model}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def _load_tts_settings() -> dict:
    """
    从应用设置文件中读取 TTS 相关配置
    返回 apiKey 等信息
    """
    import json
    settings_file = os.path.join(settings.data_dir, "settings.json")
    if os.path.exists(settings_file):
        with open(settings_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


@router.post("")
async def synthesize(request: TTSRequest) -> Response:
    """
    合成语音
    优先读取缓存，缓存未命中时调用 MiniMax API
    """
    cache_key = _cache_key(
        request.text, request.voice_id, request.speed, request.emotion, request.model
    )
    cache_path = os.path.join(TTS_CACHE_DIR, f"{cache_key}.mp3")

    # 命中缓存直接返回
    if os.path.exists(cache_path):
        logger.info("TTS 缓存命中: %s", cache_key[:12])
        with open(cache_path, "rb") as f:
            return Response(content=f.read(), media_type="audio/mpeg")

    # 从设置中读取 TTS API Key
    app_settings = _load_tts_settings()
    tts_config = app_settings.get("tts", {})
    api_key = tts_config.get("apiKey", "")

    if not api_key:
        raise HTTPException(status_code=400, detail="TTS API Key 未配置，请在设置中填写 MiniMax API Key")

    # 构建 MiniMax T2A v2 请求
    api_url = tts_config.get("baseUrl", "https://api.minimaxi.com") + "/v1/t2a_v2"

    voice_setting: dict = {
        "voice_id": request.voice_id,
        "speed": request.speed,
        "vol": 1,
        "pitch": 0,
    }
    if request.emotion:
        voice_setting["emotion"] = request.emotion

    payload = {
        "model": request.model,
        "text": request.text,
        "stream": False,
        "voice_setting": voice_setting,
        "audio_setting": {
            "sample_rate": 32000,
            "bitrate": 128000,
            "format": "mp3",
            "channel": 1,
        },
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                api_url,
                json=payload,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}",
                },
            )
            resp.raise_for_status()
            data = resp.json()

        # 检查 API 响应状态
        base_resp = data.get("base_resp", {})
        if base_resp.get("status_code", 0) != 0:
            raise HTTPException(
                status_code=502,
                detail=f"MiniMax TTS 错误: {base_resp.get('status_msg', '未知错误')}"
            )

        audio_hex = data.get("data", {}).get("audio", "")
        if not audio_hex:
            raise HTTPException(status_code=502, detail="MiniMax TTS 返回空音频")

        # 将 hex 编码的音频解码为二进制
        audio_bytes = bytes.fromhex(audio_hex)

        # 写入缓存
        with open(cache_path, "wb") as f:
            f.write(audio_bytes)
        logger.info("TTS 合成成功并已缓存: %s (%d bytes)", cache_key[:12], len(audio_bytes))

        return Response(content=audio_bytes, media_type="audio/mpeg")

    except httpx.HTTPError as e:
        logger.error("MiniMax TTS 请求失败: %s", e)
        raise HTTPException(status_code=502, detail=f"TTS 请求失败: {str(e)}")
