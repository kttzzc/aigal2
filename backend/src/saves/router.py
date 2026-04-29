"""
存档管理路由
处理游戏进度和变量的保存与加载
"""
import json
import os
import time
import uuid
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/saves", tags=["存档"])

SAVES_DIR = os.path.join(settings.data_dir, "saves")


def _ensure_dir() -> None:
    os.makedirs(SAVES_DIR, exist_ok=True)


class GameSaveModel(BaseModel):
    id: str
    name: str
    messages: list[dict] = []
    currentIndex: int = 0
    variables: dict[str, str] = {}
    history: list[dict] = []
    createdAt: float = 0
    updatedAt: float = 0


class CreateSaveRequest(BaseModel):
    name: str
    messages: list[dict] = []
    currentIndex: int = 0
    variables: dict[str, str] = {}
    history: list[dict] = []


def _load_save(save_id: str) -> GameSaveModel:
    filepath = os.path.join(SAVES_DIR, f"{save_id}.json")
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="存档不存在")
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    return GameSaveModel(**data)


@router.get("", response_model=list[GameSaveModel])
async def list_saves() -> list[GameSaveModel]:
    _ensure_dir()
    saves: list[GameSaveModel] = []
    for filename in os.listdir(SAVES_DIR):
        if not filename.endswith(".json"):
            continue
        save_id = filename.replace(".json", "")
        try:
            saves.append(_load_save(save_id))
        except Exception as e:
            logger.warning("加载存档失败: %s - %s", filename, e)
    # 按更新时间倒序
    saves.sort(key=lambda x: x.updatedAt, reverse=True)
    return saves


@router.get("/{save_id}", response_model=GameSaveModel)
async def get_save(save_id: str) -> GameSaveModel:
    return _load_save(save_id)


@router.post("", response_model=GameSaveModel)
async def create_save(request: CreateSaveRequest) -> GameSaveModel:
    _ensure_dir()
    now = time.time()
    save = GameSaveModel(
        id=str(uuid.uuid4())[:8],
        name=request.name,
        messages=request.messages,
        currentIndex=request.currentIndex,
        variables=request.variables,
        history=request.history,
        createdAt=now,
        updatedAt=now,
    )
    filepath = os.path.join(SAVES_DIR, f"{save.id}.json")
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(save.model_dump(), f, ensure_ascii=False, indent=2)
    return save


@router.delete("/{save_id}")
async def delete_save(save_id: str) -> dict:
    filepath = os.path.join(SAVES_DIR, f"{save_id}.json")
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="存档不存在")
    os.remove(filepath)
    return {"ok": True}
