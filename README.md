# AIgal — AI 驱动的视觉小说引擎

> 🎮 一个由大语言模型（LLM）驱动的现代化 Galgame（视觉小说）游戏引擎。玩家通过自然语言与 AI 互动，AI 实时生成剧情、对话、场景切换和角色表演，创造无限分支的沉浸式叙事体验。

---
## 预览
![preview](preview.png)
*人物与背景素材来源自《巧克甜恋》,侵删*

## 🚀 快速启动

### 环境要求

| 依赖 | 版本 |
|------|------|
| Node.js | ≥ 18 |
| Python | ≥ 3.10 |
| npm | ≥ 9 |

### 一键启动

双击根目录下的 `START.bat` 即可同时启动前后端：

```bat
START.bat
```

启动后：
- 前端：[http://localhost:5173](http://localhost:5173)
- 后端 API：[http://localhost:8000](http://localhost:8000)
- API 文档：[http://localhost:8000/docs](http://localhost:8000/docs)

### 手动启动

**后端**

```bash
cd backend
pip install -r requirements.txt
uvicorn src.main:app --reload
```

**前端**

```bash
cd frontend
npm install
npm run dev
```

### 首次使用配置

1. 启动后进入游戏，打开 **设置**（右上角菜单 → 设置，或实验性 UI 下点击 System）
2. 在 **AI 配置** 中填写你的 API Key、Base URL 和模型名称
3. 保存设置后即可开始游戏

---

## 📖 详细介绍

### 核心游戏循环

```
玩家输入 → AI 生成 JSON 响应 → 引擎渲染对话/角色/背景 → 等待玩家下一步输入
```

AI 以结构化的 JSON 格式返回内容，引擎负责解析并渲染为视觉小说的画面。每次 AI 响应可以包含**多段对话**，玩家逐条点击推进阅读。

### AI 返回的 JSON 结构

```json
{
  "messages": [
    {
      "id": 1,
      "name": "角色名",
      "message": "对话内容",
      "background": "背景图文件名.png",
      "roles": [
        { "id": 1, "img": "角色立绘.png", "loc": "left" },
        { "id": 2, "img": "角色立绘.png", "loc": "right" }
      ]
    }
  ],
  "variables": {
    "好感度": "50",
    "物品": "魔法书"
  },
  "time": {
    "time_id": 1,
    "con": "本轮剧情内容概述"
  }
}
```

### 功能模块一览

#### 🎭 游戏界面
- **对话框**：玻璃拟态风格，支持逐字打字效果，点击推进
- **角色立绘**：支持多角色同屏（左/右/居中），自动高亮说话角色
- **背景层**：跟随消息自动切换场景背景图
- **底部操作栏**（实验性 UI）：Save / Load / Time / System / Title 常驻底部

#### 📖 世界书（World Book）
- 自定义世界观条目，通过关键词匹配自动注入 AI 上下文
- 支持"常驻触发"：无需关键词匹配也能始终注入的条目
- 支持导入/导出 JSON 格式世界书文件

#### 📝 系统提示词（Prompt Editor）
- 系统提示词以 `.md` 文件保存，支持多套提示词切换
- 提供默认提示词模板，可自由编辑创作规则

#### 🎨 素材管理（Asset Manager）
- 上传和管理背景图 / 角色立绘
- 可视化预览已上传素材

#### 📊 全局变量（Variables）
- AI 返回的 `variables` 会持久化存储
- 每次请求时自动回传给 AI，实现跨对话的状态记忆（如好感度、物品、剧情标志等）

#### ⏱️ 时间线（Timeline）
- AI 每次响应自动生成带有递增 `time_id` 的时间线节点
- 可视化查看完整的剧情脉络
- **时间线回溯**：点击历史节点的回溯按钮，可将整个游戏状态（变量 + 对话历史）穿越回当时

#### 💾 存档系统（Save / Load）
- 保存当前游戏进度（对话历史 + 变量快照）
- 支持多存档管理与删除

#### 🖌️ 自定义 UI（UI Editor）
- 玩家可自行编写 HTML / CSS / JS 来定制游戏界面
- 支持实时预览渲染效果

#### 🐛 调试模式（Debug Panel）
- 按 `F12` 唤起内置调试面板（拦截浏览器原生开发者工具）
- 查看每轮对话的 AI 原始请求体 / 响应体
- 直接修改当前对话的 JSON 并热更新到游戏画面

#### ⚙️ 设置
- AI 配置（API Key / Base URL / 模型）
- 上下文上限调整（0 = 无限制，发送全部历史给 AI）
- 文字速度与自动播放间隔
- 菜单动画开关
- 实验性 UI 布局开关

### 两种 UI 模式

| 经典模式 | 实验性 UI |
|----------|-----------|
| 右上角汉堡菜单包含所有功能 | 底部常驻操作栏（Save / Load / Time / System / Title） |
| 功能面板以侧边模态框打开 | 高级功能整合到独立的 `/settings` 页面 |
| 默认启用 | 需在设置中手动开启 |

---

## 🛠️ 技术栈

### 前端

| 技术 | 用途 |
|------|------|
| **React 18** | UI 框架 |
| **TypeScript** | 类型安全 |
| **Vite** | 构建工具与开发服务器 |
| **Zustand** | 轻量级状态管理 |
| **Framer Motion** | UI 动画与过渡效果 |
| **Axios** | HTTP 请求 |
| **React Router** | 页面路由（标题页 / 游戏页 / 设置页） |

### 后端

| 技术 | 用途 |
|------|------|
| **Python 3.10+** | 运行时 |
| **FastAPI** | Web API 框架 |
| **Uvicorn** | ASGI 服务器 |
| **httpx** | 异步 HTTP 客户端（调用 LLM API） |
| **Pydantic** | 数据校验与序列化 |

### 数据存储

- 基于本地 JSON 文件的轻量持久化方案（无需数据库）
- 世界书、存档、设置、自定义 UI 配置均以 JSON 文件存储在 `backend/data/` 目录下

### 项目目录结构

```
aigal2/
├── START.bat                # 一键启动脚本
├── 1.json                   # AI 返回体参考示例
├── frontend/                # 前端项目
│   └── src/
│       ├── components/      # 基础 UI 组件
│       │   ├── action-bar/      # 底部操作栏
│       │   ├── background-layer/# 背景层
│       │   ├── character-sprite/# 角色立绘
│       │   ├── common/          # 通用组件（ModalPanel）
│       │   ├── dialogue-box/    # 对话框
│       │   ├── game-menu/       # 游戏菜单
│       │   ├── text-input/      # 玩家输入框
│       │   └── variable-panel/  # 变量面板
│       ├── features/        # 功能模块
│       │   ├── asset-manager/   # 素材管理
│       │   ├── debug/           # 调试面板
│       │   ├── prompt-editor/   # 提示词编辑
│       │   ├── save-load/       # 存档管理
│       │   ├── settings/        # 设置面板
│       │   ├── timeline/        # 时间线
│       │   ├── ui-editor/       # 自定义 UI
│       │   └── world-book/      # 世界书
│       ├── pages/           # 页面组件
│       ├── store/           # Zustand 状态管理
│       ├── services/        # API 服务层
│       └── types/           # TypeScript 类型定义
└── backend/                 # 后端项目
    ├── data/                # 数据文件目录
    │   ├── prompts/             # 系统提示词 (.md)
    │   ├── world_books/         # 世界书
    │   ├── saves/               # 存档
    │   └── assets/              # 素材文件
    └── src/
        ├── ai/                  # AI 交互服务
        ├── assets/              # 素材路由
        ├── core/                # 核心配置
        ├── custom_ui/           # 自定义 UI 路由
        ├── prompts/             # 提示词路由
        ├── saves/               # 存档路由
        ├── settings/            # 设置路由
        └── world_book/          # 世界书路由
```

---

<p align="center">
  <em>AIgal Engine — 让 AI 成为你的故事讲述者 ✨</em>
</p>
