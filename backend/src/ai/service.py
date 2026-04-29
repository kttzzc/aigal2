"""
AI 服务层
负责构建 prompt、调用 AI API、解析 JSON 响应
"""
import json
import logging
import os
from openai import AsyncOpenAI

from ..core.config import settings

logger = logging.getLogger(__name__)


class AIService:
    """AI 交互服务"""

    def __init__(self) -> None:
        self._client: AsyncOpenAI | None = None

    def _get_client(self) -> AsyncOpenAI:
        """延迟初始化 OpenAI 客户端，支持运行时修改配置"""
        # NOTE: 每次使用最新配置创建客户端，确保设置变更生效
        return AsyncOpenAI(
            api_key=settings.ai_api_key,
            base_url=settings.ai_base_url,
        )

    async def load_system_prompt(self) -> str:
        """加载当前使用的系统提示词"""
        prompts_dir = os.path.join(settings.data_dir, "prompts")
        active_file = os.path.join(prompts_dir, ".active")

        # 读取活跃提示词文件名
        filename = "default.md"
        if os.path.exists(active_file):
            with open(active_file, "r", encoding="utf-8") as f:
                filename = f.read().strip() or "default.md"

        prompt_path = os.path.join(prompts_dir, filename)
        if os.path.exists(prompt_path):
            with open(prompt_path, "r", encoding="utf-8") as f:
                return f.read()

        return self._default_prompt()

    async def load_world_book_entries(self, player_input: str) -> str:
        """
        加载世界书条目并注入上下文
        alwaysActive 条目始终注入，其余条目通过关键词匹配触发
        """
        world_books_dir = os.path.join(settings.data_dir, "world_books")
        if not os.path.exists(world_books_dir):
            return ""

        matched_entries: list[str] = []

        for filename in os.listdir(world_books_dir):
            if not filename.endswith(".json"):
                continue
            filepath = os.path.join(world_books_dir, filename)
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    book = json.load(f)
                for entry in book.get("entries", []):
                    if not entry.get("enabled", True):
                        continue

                    # NOTE: alwaysActive 条目无需关键词匹配，每次都注入
                    is_always_active = entry.get("alwaysActive", False)
                    if is_always_active:
                        matched_entries.append(
                            f"[{entry.get('name', '未命名')}]\n{entry.get('content', '')}"
                        )
                        continue

                    # 普通条目通过关键词匹配触发
                    keywords = entry.get("keywords", [])
                    if any(kw in player_input for kw in keywords):
                        matched_entries.append(
                            f"[{entry.get('name', '未命名')}]\n{entry.get('content', '')}"
                        )
            except (json.JSONDecodeError, IOError) as e:
                logger.warning("读取世界书失败: %s - %s", filename, e)

        if matched_entries:
            return "\n\n---\n世界书信息（参考以下设定）：\n" + "\n\n".join(matched_entries)
        return ""

    async def chat(
        self,
        player_input: str,
        variables: dict[str, str],
        history: list[dict[str, str]],
    ) -> dict:
        """
        发送聊天请求到 AI
        构建完整 prompt 并解析 JSON 响应
        """
        client = self._get_client()

        # 构建系统提示词
        system_prompt = await self.load_system_prompt()
        world_book_content = await self.load_world_book_entries(player_input)

        # 拼接变量信息
        variables_text = ""
        if variables:
            variables_text = "\n\n当前全局变量：\n" + json.dumps(
                variables, ensure_ascii=False, indent=2
            )

        full_system = system_prompt + world_book_content + variables_text

        # 构建消息列表
        messages = [{"role": "system", "content": full_system}]

        # 添加历史对话（根据上下文上限裁剪）
        context_limit = settings.max_context_messages
        effective_history = history
        if context_limit > 0:
            # 每轮对话有 user + assistant 两条，所以裁剪 context_limit * 2 条
            effective_history = history[-(context_limit * 2):]

        messages.extend(effective_history)

        # 添加当前玩家输入
        messages.append({"role": "user", "content": player_input})

        logger.info("发送 AI 请求，消息数量: %d", len(messages))

        # 构建脱敏的调试信息，供前端 Debug 面板查看
        debug_request = {
            "model": settings.ai_model,
            "base_url": self._mask_url(settings.ai_base_url),
            "temperature": 0.8,
            "response_format": {"type": "json_object"},
            "messages": self._sanitize_messages(messages),
        }

        try:
            response = await client.chat.completions.create(
                model=settings.ai_model,
                messages=messages,
                temperature=0.8,
                response_format={"type": "json_object"},
            )

            content = response.choices[0].message.content or "{}"
            logger.info("AI 响应内容长度: %d", len(content))

            # 解析 JSON
            result = json.loads(content)

            # 确保有 messages 和 variables 字段
            if "messages" not in result:
                result["messages"] = [
                    {
                        "id": 1,
                        "name": "系统",
                        "message": content,
                        "background": "",
                        "roles": [],
                    }
                ]
            if "variables" not in result:
                result["variables"] = {}

            # 附带脱敏的调试信息
            result["_debug_llm_request"] = debug_request

            return result

        except json.JSONDecodeError as e:
            logger.error("JSON 解析失败: %s", e)
            return {
                "messages": [
                    {
                        "id": 1,
                        "name": "系统",
                        "message": f"AI 返回的内容无法解析为 JSON: {e}",
                        "background": "",
                        "roles": [],
                    }
                ],
                "variables": {},
            }
        except Exception as e:
            logger.error("AI 请求失败: %s", e)
            raise

    @staticmethod
    def _mask_url(url: str) -> str:
        """脱敏 API Base URL，隐藏域名路径中可能的敏感信息"""
        if not url:
            return "(未设置)"
        from urllib.parse import urlparse
        parsed = urlparse(url)
        # 保留 scheme 和 host，隐藏具体路径
        return f"{parsed.scheme}://{parsed.hostname}{parsed.path}"

    @staticmethod
    def _sanitize_messages(messages: list[dict]) -> list[dict]:
        """
        脱敏消息列表：
        - system prompt 仅显示前 200 字 + 总长度信息
        - user / assistant 内容完整保留（这些是玩家自己的输入/AI 输出）
        """
        sanitized = []
        for msg in messages:
            role = msg.get("role", "")
            content = msg.get("content", "")
            if role == "system":
                preview = content[:200]
                sanitized.append({
                    "role": role,
                    "content": f"{preview}... [总计 {len(content)} 字符]",
                })
            else:
                sanitized.append(msg)
        return sanitized

    @staticmethod
    def _default_prompt() -> str:
        """默认系统提示词"""
        return """# 角色设定
你是一个 Galgame（视觉小说）的故事叙述者和角色扮演者。

## 输出格式
你必须以 JSON 格式返回内容，格式如下：

```json
{
  "messages": [
    {
      "id": 1,
      "name": "角色名",
      "message": "对话内容",
      "background": "背景图文件名.png",
      "roles": [
        {"id": 1, "img": "角色立绘文件名.png", "loc": "left"},
        {"id": 2, "img": "角色立绘文件名.png", "loc": "right"}
      ]
    }
  ],
  "variables": {
    "变量名": "变量值"
  },
  "time": {
    "time_id": 1,
    "con": "此次返回内容的概述"
  }
}
```

## 规则
1. messages 数组可以包含多个对话段落，每段由不同角色说出
2. background 是场景背景图的文件名
3. roles 是当前场景中显示的角色立绘，loc 为位置（left/right/middle）
4. middle 位置仅在只有一个角色时使用
5. variables 用于记录游戏中的重要变量（如好感度、物品等）
6. time 字段必填，包含自增的 time_id 以及这一段剧情的内容概述 con
7. 根据玩家输入和当前变量推进剧情
8. 保持角色性格一致性
9. 创造引人入胜的剧情和对话"""


# 单例实例
ai_service = AIService()
