/**
 * AIgal 核心类型定义
 * 定义 AI 交互协议、游戏状态、世界书等数据结构
 */

// ============================================
// AI 交互协议类型
// ============================================

/** 角色立绘位置 */
export type CharacterLocation = 'left' | 'right' | 'middle';

/** 角色立绘信息 */
export interface CharacterRole {
  id: number;
  img: string;
  /** 位置：left/right/middle（middle 仅在只有一个角色时有效） */
  loc: CharacterLocation;
}

/** AI 返回的单条消息 */
export interface AIMessage {
  id: number;
  /** 说话角色的名称 */
  name: string;
  /** 对话内容 */
  message: string;
  /** 背景图文件名 */
  background: string;
  /** 当前场景中显示的角色列表 */
  roles: CharacterRole[];
}

/** AI 返回的时间线节点 */
export interface AITime {
  /** 递增的时间线节点ID */
  time_id: number;
  /** 该节点发生的内容概述 */
  con: string;
}

/** AI 完整响应 */
export interface AIResponse {
  messages: AIMessage[];
  /** 全局变量，会持久化并在下次请求时回传 */
  variables: Record<string, string>;
  /** 时间线节点信息 */
  time?: AITime;
}

// ============================================
// 对话历史类型
// ============================================

/** 单轮对话记录（玩家输入 + AI 响应） */
export interface ConversationEntry {
  /** 玩家的输入文本 */
  playerInput: string;
  /** AI 返回的消息列表 */
  aiMessages: AIMessage[];
  /** 该轮对话产生的变量变化 */
  variableChanges: Record<string, string>;
  /** 该轮对话生成的时间线节点 */
  time?: AITime;
  /** 原始发给 AI 的请求 JSON 体 */
  rawRequest?: any;
  /** AI 返回的原始 JSON 体 */
  rawResponse?: any;
  /** 时间戳 */
  timestamp: number;
}

// ============================================
// 世界书类型
// ============================================

/** 世界书条目 */
export interface WorldBookEntry {
  id: string;
  /** 触发关键词列表 */
  keywords: string[];
  /** 条目内容 */
  content: string;
  /** 是否启用 */
  enabled: boolean;
  /** 优先级（数字越大越优先） */
  priority: number;
  /** 条目名称/标题 */
  name: string;
  /** 常驻触发：为 true 时无需关键词匹配，每次请求都会注入上下文 */
  alwaysActive: boolean;
}

/** 世界书（一组条目的集合） */
export interface WorldBook {
  id: string;
  name: string;
  description: string;
  entries: WorldBookEntry[];
  createdAt: number;
  updatedAt: number;
}

// ============================================
// 系统提示词类型
// ============================================

/** 提示词文件信息 */
export interface PromptFile {
  filename: string;
  /** 不含扩展名的名称 */
  name: string;
  content: string;
  isDefault: boolean;
  updatedAt: number;
}

// ============================================
// 素材类型
// ============================================

export type AssetType = 'background' | 'character';

/** 素材文件信息 */
export interface AssetFile {
  filename: string;
  type: AssetType;
  /** 可访问的 URL 路径 */
  url: string;
  size: number;
  uploadedAt: number;
}

// ============================================
// 自定义 UI 类型
// ============================================

/** 自定义 UI 配置 */
export interface CustomUIConfig {
  id: string;
  name: string;
  html: string;
  css: string;
  js: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

/** 主应用 → iframe 推送的游戏数据 */
export interface GameDataMessage {
  type: 'GAME_DATA';
  payload: {
    currentMessage: AIMessage | null;
    variables: Record<string, string>;
  };
}

/** iframe → 主应用的玩家操作 */
export interface PlayerActionMessage {
  type: 'PLAYER_ACTION';
  payload: {
    action: 'advance' | 'input';
    data?: string;
  };
}

// ============================================
// 游戏存档类型
// ============================================

/** 游戏存档 */
export interface GameSave {
  id: string;
  name: string;
  /** 对话历史 */
  conversationHistory: ConversationEntry[];
  /** 全局变量快照 */
  variables: Record<string, string>;
  /** 当前使用的世界书 ID */
  worldBookId?: string;
  /** 当前使用的提示词文件名 */
  promptFilename?: string;
  createdAt: number;
  updatedAt: number;
}

// ============================================
// 设置类型
// ============================================

/** AI 配置 */
export interface AIConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

/** TTS 语音合成配置 */
export interface TTSConfig {
  /** MiniMax TTS API Key */
  apiKey: string;
  /** MiniMax TTS API Base URL */
  baseUrl: string;
  /** TTS 模型版本 */
  model: string;
  /** 音色 ID */
  voiceId: string;
  /** 语速 */
  speed: number;
  /** 是否开启自动朗读 */
  autoRead: boolean;
}

/** 应用设置 */
export interface AppSettings {
  ai: AIConfig;
  /** 上下文消息上限，0 = 无限制 */
  contextLimit: number;
  /** 文字显示速度（毫秒/字） */
  textSpeed: number;
  /** 自动播放间隔（毫秒） */
  autoPlayInterval: number;
  /** 是否启用菜单打开动画 */
  enableMenuAnimation: boolean;
  /** 是否启用实验性 UI（底部操作栏布局） */
  experimentalUI: boolean;
  /** TTS 语音合成配置 */
  tts?: TTSConfig;
}
