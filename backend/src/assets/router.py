"""
素材管理路由
处理背景图和角色立绘的上传、列表和删除
"""
import os
import time
import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

from ..core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/assets", tags=["素材"])

ASSETS_DIR = os.path.join(settings.data_dir, "assets")
VALID_TYPES = {"background", "character"}


def _ensure_dirs() -> None:
    for t in VALID_TYPES:
        os.makedirs(os.path.join(ASSETS_DIR, t), exist_ok=True)


class AssetFileResponse(BaseModel):
    filename: str
    type: str
    url: str
    size: int
    uploadedAt: float


@router.get("", response_model=list[AssetFileResponse])
async def list_assets(type: str | None = None) -> list[AssetFileResponse]:
    """获取素材列表"""
    _ensure_dirs()
    result: list[AssetFileResponse] = []
    types_to_scan = [type] if type and type in VALID_TYPES else list(VALID_TYPES)

    for asset_type in types_to_scan:
        dir_path = os.path.join(ASSETS_DIR, asset_type)
        if not os.path.exists(dir_path):
            continue
        for filename in os.listdir(dir_path):
            filepath = os.path.join(dir_path, filename)
            if not os.path.isfile(filepath):
                continue
            stat = os.stat(filepath)
            result.append(AssetFileResponse(
                filename=filename,
                type=asset_type,
                url=f"/assets/{asset_type}/{filename}",
                size=stat.st_size,
                uploadedAt=stat.st_mtime,
            ))
    return result


@router.post("/upload", response_model=AssetFileResponse)
async def upload_asset(
    file: UploadFile = File(...),
    type: str = Form(...),
) -> AssetFileResponse:
    """上传素材文件"""
    if type not in VALID_TYPES:
        raise HTTPException(status_code=400, detail=f"无效的素材类型: {type}")

    _ensure_dirs()
    filename = file.filename or f"upload_{int(time.time())}"
    dir_path = os.path.join(ASSETS_DIR, type)
    filepath = os.path.join(dir_path, filename)

    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)

    stat = os.stat(filepath)
    logger.info("上传素材: %s/%s (%d bytes)", type, filename, stat.st_size)

    return AssetFileResponse(
        filename=filename,
        type=type,
        url=f"/assets/{type}/{filename}",
        size=stat.st_size,
        uploadedAt=stat.st_mtime,
    )


@router.get("/{asset_type}/{filename}")
async def serve_asset(asset_type: str, filename: str) -> FileResponse:
    """提供素材文件访问"""
    if asset_type not in VALID_TYPES:
        raise HTTPException(status_code=400, detail="无效的素材类型")
    filepath = os.path.join(ASSETS_DIR, asset_type, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="文件不存在")
    return FileResponse(filepath)


@router.delete("/{asset_type}/{filename}")
async def delete_asset(asset_type: str, filename: str) -> dict:
    """删除素材文件"""
    if asset_type not in VALID_TYPES:
        raise HTTPException(status_code=400, detail="无效的素材类型")
    filepath = os.path.join(ASSETS_DIR, asset_type, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="文件不存在")
    os.remove(filepath)
    logger.info("删除素材: %s/%s", asset_type, filename)
    return {"ok": True}
