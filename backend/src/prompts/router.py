"""
提示词管理路由
管理 .md 格式的系统提示词文件
"""
import os
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/prompts", tags=["提示词"])

PROMPTS_DIR = os.path.join(settings.data_dir, "prompts")


def _ensure_dir() -> None:
    os.makedirs(PROMPTS_DIR, exist_ok=True)


class PromptFileResponse(BaseModel):
    filename: str
    name: str
    content: str
    isDefault: bool
    updatedAt: float


class SavePromptRequest(BaseModel):
    content: str


class CreatePromptRequest(BaseModel):
    name: str
    content: str


class SetActiveRequest(BaseModel):
    filename: str


@router.get("", response_model=list[PromptFileResponse])
async def list_prompts() -> list[PromptFileResponse]:
    """获取所有提示词文件"""
    _ensure_dir()
    files: list[PromptFileResponse] = []
    for filename in os.listdir(PROMPTS_DIR):
        if not filename.endswith(".md"):
            continue
        filepath = os.path.join(PROMPTS_DIR, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        stat = os.stat(filepath)
        files.append(PromptFileResponse(
            filename=filename,
            name=filename.replace(".md", ""),
            content=content,
            isDefault=filename == "default.md",
            updatedAt=stat.st_mtime,
        ))
    return files


@router.get("/{filename}", response_model=PromptFileResponse)
async def get_prompt(filename: str) -> PromptFileResponse:
    """获取单个提示词文件"""
    filepath = os.path.join(PROMPTS_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="文件不存在")
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    stat = os.stat(filepath)
    return PromptFileResponse(
        filename=filename,
        name=filename.replace(".md", ""),
        content=content,
        isDefault=filename == "default.md",
        updatedAt=stat.st_mtime,
    )


@router.put("/{filename}", response_model=PromptFileResponse)
async def save_prompt(filename: str, request: SavePromptRequest) -> PromptFileResponse:
    """保存提示词文件"""
    _ensure_dir()
    filepath = os.path.join(PROMPTS_DIR, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(request.content)
    stat = os.stat(filepath)
    return PromptFileResponse(
        filename=filename,
        name=filename.replace(".md", ""),
        content=request.content,
        isDefault=filename == "default.md",
        updatedAt=stat.st_mtime,
    )


@router.post("", response_model=PromptFileResponse)
async def create_prompt(request: CreatePromptRequest) -> PromptFileResponse:
    """创建新提示词文件"""
    _ensure_dir()
    filename = f"{request.name}.md"
    filepath = os.path.join(PROMPTS_DIR, filename)
    if os.path.exists(filepath):
        raise HTTPException(status_code=400, detail="文件已存在")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(request.content)
    stat = os.stat(filepath)
    return PromptFileResponse(
        filename=filename,
        name=request.name,
        content=request.content,
        isDefault=False,
        updatedAt=stat.st_mtime,
    )


@router.delete("/{filename}")
async def delete_prompt(filename: str) -> dict:
    """删除提示词文件"""
    if filename == "default.md":
        raise HTTPException(status_code=400, detail="无法删除默认提示词")
    filepath = os.path.join(PROMPTS_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="文件不存在")
    os.remove(filepath)
    return {"ok": True}


@router.post("/active")
async def set_active(request: SetActiveRequest) -> dict:
    """设置当前使用的提示词文件"""
    _ensure_dir()
    active_file = os.path.join(PROMPTS_DIR, ".active")
    with open(active_file, "w", encoding="utf-8") as f:
        f.write(request.filename)
    return {"ok": True, "filename": request.filename}
