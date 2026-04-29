"""
世界书管理路由
世界书以 JSON 文件存储在 data/world_books 目录下
"""
import json
import os
import time
import uuid
import logging
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import Response
from pydantic import BaseModel

from ..core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/world-book", tags=["世界书"])

WORLD_BOOKS_DIR = os.path.join(settings.data_dir, "world_books")


def _ensure_dir() -> None:
    os.makedirs(WORLD_BOOKS_DIR, exist_ok=True)


class WorldBookEntryModel(BaseModel):
    id: str
    keywords: list[str] = []
    content: str = ""
    enabled: bool = True
    priority: int = 0
    name: str = ""
    alwaysActive: bool = False


class WorldBookModel(BaseModel):
    id: str
    name: str
    description: str = ""
    entries: list[WorldBookEntryModel] = []
    createdAt: float = 0
    updatedAt: float = 0


class CreateWorldBookRequest(BaseModel):
    name: str
    description: str = ""
    entries: list[WorldBookEntryModel] = []


class UpdateWorldBookRequest(BaseModel):
    name: str | None = None
    description: str | None = None
    entries: list[WorldBookEntryModel] | None = None


def _load_book(book_id: str) -> WorldBookModel:
    """从文件加载世界书"""
    filepath = os.path.join(WORLD_BOOKS_DIR, f"{book_id}.json")
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="世界书不存在")
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    return WorldBookModel(**data)


def _save_book(book: WorldBookModel) -> None:
    """保存世界书到文件"""
    _ensure_dir()
    filepath = os.path.join(WORLD_BOOKS_DIR, f"{book.id}.json")
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(book.model_dump(), f, ensure_ascii=False, indent=2)


@router.get("", response_model=list[WorldBookModel])
async def list_world_books() -> list[WorldBookModel]:
    """获取所有世界书"""
    _ensure_dir()
    books: list[WorldBookModel] = []
    for filename in os.listdir(WORLD_BOOKS_DIR):
        if not filename.endswith(".json"):
            continue
        book_id = filename.replace(".json", "")
        try:
            books.append(_load_book(book_id))
        except Exception as e:
            logger.warning("加载世界书失败: %s - %s", filename, e)
    return books


@router.get("/{book_id}", response_model=WorldBookModel)
async def get_world_book(book_id: str) -> WorldBookModel:
    """获取单个世界书"""
    return _load_book(book_id)


@router.post("", response_model=WorldBookModel)
async def create_world_book(request: CreateWorldBookRequest) -> WorldBookModel:
    """创建世界书"""
    now = time.time()
    book = WorldBookModel(
        id=str(uuid.uuid4())[:8],
        name=request.name,
        description=request.description,
        entries=request.entries,
        createdAt=now,
        updatedAt=now,
    )
    _save_book(book)
    return book


@router.put("/{book_id}", response_model=WorldBookModel)
async def update_world_book(book_id: str, request: UpdateWorldBookRequest) -> WorldBookModel:
    """更新世界书"""
    book = _load_book(book_id)
    if request.name is not None:
        book.name = request.name
    if request.description is not None:
        book.description = request.description
    if request.entries is not None:
        book.entries = request.entries
    book.updatedAt = time.time()
    _save_book(book)
    return book


@router.delete("/{book_id}")
async def delete_world_book(book_id: str) -> dict:
    """删除世界书"""
    filepath = os.path.join(WORLD_BOOKS_DIR, f"{book_id}.json")
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="世界书不存在")
    os.remove(filepath)
    return {"ok": True}


@router.get("/{book_id}/export")
async def export_world_book(book_id: str) -> Response:
    """导出世界书为 JSON 下载"""
    book = _load_book(book_id)
    content = json.dumps(book.model_dump(), ensure_ascii=False, indent=2)
    return Response(
        content=content,
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={book.name}.json"},
    )


@router.post("/import", response_model=WorldBookModel)
async def import_world_book(file: UploadFile = File(...)) -> WorldBookModel:
    """导入世界书"""
    content = await file.read()
    try:
        data = json.loads(content)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="无效的 JSON 文件")

    now = time.time()
    book = WorldBookModel(
        id=str(uuid.uuid4())[:8],
        name=data.get("name", "导入的世界书"),
        description=data.get("description", ""),
        entries=[WorldBookEntryModel(**e) for e in data.get("entries", [])],
        createdAt=now,
        updatedAt=now,
    )
    _save_book(book)
    return book
