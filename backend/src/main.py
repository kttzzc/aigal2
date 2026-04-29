"""
AIgal 后端主入口
FastAPI 应用初始化、中间件配置和路由注册
"""
import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .core.config import settings
from .core.database import init_storage
from .ai.router import router as ai_router
from .prompts.router import router as prompts_router
from .assets.router import router as assets_router
from .world_book.router import router as world_book_router
from .settings.router import router as settings_router
from .saves.router import router as saves_router
from .custom_ui.router import router as custom_ui_router
from .tts.router import router as tts_router

# 日志配置
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    logger.info("AIgal 后端启动中...")

    # 确保数据目录存在
    for dir_name in ["prompts", "world_books", "assets/background", "assets/character", "saves", "custom_ui", "tts_cache"]:
        os.makedirs(os.path.join(settings.data_dir, dir_name), exist_ok=True)

    # 创建默认系统提示词（如果不存在）
    default_prompt_path = os.path.join(settings.data_dir, "prompts", "default.md")
    if not os.path.exists(default_prompt_path):
        from .ai.service import ai_service
        with open(default_prompt_path, "w", encoding="utf-8") as f:
            f.write(ai_service._default_prompt())
        logger.info("已创建默认系统提示词")

    # 初始化数据目录
    await init_storage()
    logger.info("数据目录初始化完成")

    logger.info("AIgal 后端启动完成 ✓")
    yield
    logger.info("AIgal 后端关闭")


app = FastAPI(
    title="AIgal",
    description="AI 驱动的 Galgame 引擎后端",
    version="1.0.1",
    lifespan=lifespan,
)

# CORS 配置 — 允许前端跨域访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # HACK: 开发环境允许所有来源，生产环境应限制
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(ai_router, prefix="/api")
app.include_router(prompts_router, prefix="/api")
app.include_router(assets_router, prefix="/api")
app.include_router(world_book_router, prefix="/api")
app.include_router(settings_router, prefix="/api")
app.include_router(saves_router, prefix="/api")
app.include_router(custom_ui_router, prefix="/api")
app.include_router(tts_router, prefix="/api")

# 静态文件服务 — 素材文件直接访问
assets_dir = os.path.join(settings.data_dir, "assets")
os.makedirs(assets_dir, exist_ok=True)
app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")


@app.get("/")
async def root() -> dict:
    """健康检查"""
    return {"name": "AIgal", "version": "0.1.0", "status": "running"}
