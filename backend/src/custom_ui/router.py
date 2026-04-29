"""
自定义 UI 配置路由
管理自定义的 HTML/CSS/JS 配置
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
router = APIRouter(prefix="/custom-ui", tags=["自定义 UI"])

UI_DIR = os.path.join(settings.data_dir, "custom_ui")


def _ensure_dir() -> None:
    os.makedirs(UI_DIR, exist_ok=True)


class CustomUIModel(BaseModel):
    id: str
    name: str
    html: str = ""
    css: str = ""
    js: str = ""
    createdAt: float = 0
    updatedAt: float = 0


class CreateCustomUIRequest(BaseModel):
    name: str
    html: str = ""
    css: str = ""
    js: str = ""


class UpdateCustomUIRequest(BaseModel):
    name: str | None = None
    html: str | None = None
    css: str | None = None
    js: str | None = None


def _load_ui(ui_id: str) -> CustomUIModel:
    filepath = os.path.join(UI_DIR, f"{ui_id}.json")
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="UI配置不存在")
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    return CustomUIModel(**data)


@router.get("", response_model=list[CustomUIModel])
async def list_custom_uis() -> list[CustomUIModel]:
    _ensure_dir()
    uis: list[CustomUIModel] = []
    for filename in os.listdir(UI_DIR):
        if not filename.endswith(".json"):
            continue
        ui_id = filename.replace(".json", "")
        try:
            uis.append(_load_ui(ui_id))
        except Exception as e:
            logger.warning("加载UI配置失败: %s - %s", filename, e)
    return uis


@router.post("", response_model=CustomUIModel)
async def create_custom_ui(request: CreateCustomUIRequest) -> CustomUIModel:
    _ensure_dir()
    now = time.time()
    ui = CustomUIModel(
        id=str(uuid.uuid4())[:8],
        name=request.name,
        html=request.html,
        css=request.css,
        js=request.js,
        createdAt=now,
        updatedAt=now,
    )
    filepath = os.path.join(UI_DIR, f"{ui.id}.json")
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(ui.model_dump(), f, ensure_ascii=False, indent=2)
    return ui


@router.put("/{ui_id}", response_model=CustomUIModel)
async def update_custom_ui(ui_id: str, request: UpdateCustomUIRequest) -> CustomUIModel:
    ui = _load_ui(ui_id)
    if request.name is not None:
        ui.name = request.name
    if request.html is not None:
        ui.html = request.html
    if request.css is not None:
        ui.css = request.css
    if request.js is not None:
        ui.js = request.js
    ui.updatedAt = time.time()
    
    filepath = os.path.join(UI_DIR, f"{ui.id}.json")
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(ui.model_dump(), f, ensure_ascii=False, indent=2)
    return ui


@router.delete("/{ui_id}")
async def delete_custom_ui(ui_id: str) -> dict:
    filepath = os.path.join(UI_DIR, f"{ui_id}.json")
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="UI配置不存在")
    os.remove(filepath)
    return {"ok": True}
