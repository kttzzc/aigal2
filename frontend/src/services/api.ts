/**
 * API 服务层 — 封装所有与后端的交互
 */
import axios from 'axios';
import type {
  AIResponse,
  WorldBook,
  WorldBookEntry,
  PromptFile,
  AssetFile,
  AssetType,
  GameSave,
  CustomUIConfig,
  AppSettings,
} from '../types';

// NOTE: 开发环境下后端运行在 8000 端口
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 120000, // AI 请求可能较慢，设置 2 分钟超时
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// AI 交互
// ============================================

export interface ChatRequest {
  input: string;
  variables: Record<string, string>;
  history: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

/** 发送玩家输入，获取 AI 响应 */
export async function sendChat(request: ChatRequest): Promise<AIResponse> {
  const { data } = await api.post<AIResponse>('/ai/chat', request);
  return data;
}

// ============================================
// 世界书
// ============================================

/** 获取所有世界书列表 */
export async function getWorldBooks(): Promise<WorldBook[]> {
  const { data } = await api.get<WorldBook[]>('/world-book');
  return data;
}

/** 获取单个世界书 */
export async function getWorldBook(id: string): Promise<WorldBook> {
  const { data } = await api.get<WorldBook>(`/world-book/${id}`);
  return data;
}

/** 创建世界书 */
export async function createWorldBook(book: Omit<WorldBook, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorldBook> {
  const { data } = await api.post<WorldBook>('/world-book', book);
  return data;
}

/** 更新世界书 */
export async function updateWorldBook(id: string, book: Partial<WorldBook>): Promise<WorldBook> {
  const { data } = await api.put<WorldBook>(`/world-book/${id}`, book);
  return data;
}

/** 删除世界书 */
export async function deleteWorldBook(id: string): Promise<void> {
  await api.delete(`/world-book/${id}`);
}

/** 导出世界书 */
export async function exportWorldBook(id: string): Promise<Blob> {
  const { data } = await api.get(`/world-book/${id}/export`, { responseType: 'blob' });
  return data;
}

/** 导入世界书 */
export async function importWorldBook(file: File): Promise<WorldBook> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<WorldBook>('/world-book/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/** 更新世界书条目 */
export async function updateWorldBookEntry(
  bookId: string,
  entryId: string,
  entry: Partial<WorldBookEntry>
): Promise<WorldBookEntry> {
  const { data } = await api.put<WorldBookEntry>(`/world-book/${bookId}/entry/${entryId}`, entry);
  return data;
}

// ============================================
// 系统提示词
// ============================================

/** 获取提示词文件列表 */
export async function getPromptFiles(): Promise<PromptFile[]> {
  const { data } = await api.get<PromptFile[]>('/prompts');
  return data;
}

/** 获取单个提示词文件内容 */
export async function getPromptFile(filename: string): Promise<PromptFile> {
  const { data } = await api.get<PromptFile>(`/prompts/${filename}`);
  return data;
}

/** 保存提示词文件 */
export async function savePromptFile(filename: string, content: string): Promise<PromptFile> {
  const { data } = await api.put<PromptFile>(`/prompts/${filename}`, { content });
  return data;
}

/** 创建新提示词文件 */
export async function createPromptFile(name: string, content: string): Promise<PromptFile> {
  const { data } = await api.post<PromptFile>('/prompts', { name, content });
  return data;
}

/** 删除提示词文件 */
export async function deletePromptFile(filename: string): Promise<void> {
  await api.delete(`/prompts/${filename}`);
}

/** 设置当前使用的提示词文件 */
export async function setActivePrompt(filename: string): Promise<void> {
  await api.post('/prompts/active', { filename });
}

// ============================================
// 素材管理
// ============================================

/** 获取素材列表 */
export async function getAssets(type?: AssetType): Promise<AssetFile[]> {
  const params = type ? { type } : {};
  const { data } = await api.get<AssetFile[]>('/assets', { params });
  return data;
}

/** 上传素材 */
export async function uploadAsset(file: File, type: AssetType): Promise<AssetFile> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  const { data } = await api.post<AssetFile>('/assets/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/** 删除素材 */
export async function deleteAsset(type: AssetType, filename: string): Promise<void> {
  await api.delete(`/assets/${type}/${filename}`);
}

/** 获取素材文件 URL */
export function getAssetUrl(type: AssetType, filename: string): string {
  return `${API_BASE}/assets/${type}/${filename}`;
}

// ============================================
// 游戏存档
// ============================================

/** 获取存档列表 */
export async function getSaves(): Promise<GameSave[]> {
  const { data } = await api.get<GameSave[]>('/saves');
  return data;
}

/** 获取单个存档 */
export async function getSave(id: string): Promise<GameSave> {
  const { data } = await api.get<GameSave>(`/saves/${id}`);
  return data;
}

/** 创建存档 */
export async function createSave(save: Omit<GameSave, 'id' | 'createdAt' | 'updatedAt'>): Promise<GameSave> {
  const { data } = await api.post<GameSave>('/saves', save);
  return data;
}

/** 删除存档 */
export async function deleteSave(id: string): Promise<void> {
  await api.delete(`/saves/${id}`);
}

// ============================================
// 自定义 UI
// ============================================

/** 获取自定义 UI 列表 */
export async function getCustomUIs(): Promise<CustomUIConfig[]> {
  const { data } = await api.get<CustomUIConfig[]>('/custom-ui');
  return data;
}

/** 保存自定义 UI */
export async function saveCustomUI(config: Omit<CustomUIConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomUIConfig> {
  const { data } = await api.post<CustomUIConfig>('/custom-ui', config);
  return data;
}

/** 更新自定义 UI */
export async function updateCustomUI(id: string, config: Partial<CustomUIConfig>): Promise<CustomUIConfig> {
  const { data } = await api.put<CustomUIConfig>(`/custom-ui/${id}`, config);
  return data;
}

/** 删除自定义 UI */
export async function deleteCustomUI(id: string): Promise<void> {
  await api.delete(`/custom-ui/${id}`);
}

// ============================================
// 设置
// ============================================

/** 获取应用设置 */
export async function getSettings(): Promise<AppSettings> {
  const { data } = await api.get<AppSettings>('/settings');
  return data;
}

/** 更新应用设置 */
export async function updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  const { data } = await api.put<AppSettings>('/settings', settings);
  return data;
}

// ============================================
// TTS 语音合成
// ============================================

/** TTS 合成请求参数 */
interface TTSParams {
  text: string;
  voice_id?: string;
  speed?: number;
  emotion?: string;
  model?: string;
}

/**
 * 调用后端 TTS 接口合成语音
 * 后端会自动缓存相同参数的音频，避免重复消耗 token
 */
export async function synthesizeTTS(params: TTSParams): Promise<Blob> {
  const { data } = await api.post('/tts', params, {
    responseType: 'blob',
  });
  return data;
}

export default api;
