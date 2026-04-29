"""
数据存储工具
使用 JSON 文件代替 SQLite，避免 Python 3.14 上 greenlet 兼容性问题
"""
import json
import os
import logging
from typing import Any

from .config import settings

logger = logging.getLogger(__name__)

DATA_DIR = settings.data_dir


def _get_store_path(store_name: str) -> str:
    """获取存储文件路径"""
    path = os.path.join(DATA_DIR, f"{store_name}.json")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    return path


def load_store(store_name: str) -> dict[str, Any]:
    """从 JSON 文件加载数据"""
    path = _get_store_path(store_name)
    if not os.path.exists(path):
        return {}
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        logger.warning("加载存储失败: %s - %s", store_name, e)
        return {}


def save_store(store_name: str, data: dict[str, Any]) -> None:
    """保存数据到 JSON 文件"""
    path = _get_store_path(store_name)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


async def init_storage() -> None:
    """初始化存储目录"""
    for dir_name in [
        "prompts",
        "world_books",
        "assets/background",
        "assets/character",
        "saves",
        "custom_ui",
    ]:
        os.makedirs(os.path.join(DATA_DIR, dir_name), exist_ok=True)
    logger.info("存储目录初始化完成")
