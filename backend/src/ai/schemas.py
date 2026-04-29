"""
AI 交互相关的 Pydantic 模型
"""
from typing import Any, Optional
from pydantic import BaseModel, Field


class CharacterRole(BaseModel):
    """角色立绘信息"""
    id: int
    img: str
    loc: str  # left / right / middle


class AIMessage(BaseModel):
    """AI 返回的单条消息"""
    id: int
    name: str
    message: str
    background: str
    roles: list[CharacterRole]


class AITimeNode(BaseModel):
    """时间线节点"""
    time_id: int
    con: str


class AIResponse(BaseModel):
    """AI 完整响应"""
    model_config = {"populate_by_name": True}

    messages: list[AIMessage]
    variables: dict[str, str] = {}
    time: Optional[AITimeNode] = None
    # NOTE: 下划线前缀字段需要用 alias 处理
    debug_llm_request: Optional[Any] = Field(None, alias="_debug_llm_request")


class ChatRequest(BaseModel):
    """前端发来的聊天请求"""
    input: str
    variables: dict[str, str] = {}
    history: list[dict[str, str]] = []


class ContextLimitRequest(BaseModel):
    """上下文上限设置"""
    limit: int = 0
