"""
AI 交互路由
处理聊天请求和上下文配置
"""
import logging
from fastapi import APIRouter
from fastapi.responses import JSONResponse

from .schemas import ChatRequest, AIResponse, ContextLimitRequest
from .service import ai_service
from ..core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/chat")
async def chat(request: ChatRequest) -> JSONResponse:
    """发送玩家输入，获取 AI 响应"""
    logger.info("收到聊天请求: %s", request.input[:50])
    result = await ai_service.chat(
        player_input=request.input,
        variables=request.variables,
        history=request.history,
    )
    response = AIResponse(**result)
    # NOTE: by_alias=True 确保 _debug_llm_request 以下划线前缀输出
    return JSONResponse(content=response.model_dump(by_alias=True))


@router.get("/context-limit")
async def get_context_limit() -> dict:
    """获取当前上下文上限"""
    return {"limit": settings.max_context_messages}


@router.put("/context-limit")
async def update_context_limit(request: ContextLimitRequest) -> dict:
    """更新上下文上限"""
    settings.max_context_messages = request.limit
    return {"limit": settings.max_context_messages}
