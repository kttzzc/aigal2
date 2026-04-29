/**
 * 游戏核心状态管理
 * 管理对话播放、玩家输入、全局变量、对话历史等
 */
import { create } from 'zustand';
import type { AIMessage, ConversationEntry } from '../types';
import { sendChat, getAssetUrl } from '../services/api';

interface GameStore {
  // ============ 游戏状态 ============
  /** 当前轮 AI 返回的消息列表 */
  messages: AIMessage[];
  /** 当前播放到第几条消息 */
  currentIndex: number;
  /** 是否正在播放打字效果 */
  isTyping: boolean;
  /** 全局变量 */
  variables: Record<string, string>;
  /** 完整对话历史 */
  conversationHistory: ConversationEntry[];
  /** 是否等待 AI 响应 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 游戏是否已开始 */
  isGameStarted: boolean;
  /** 所有消息已阅毕，准备接收玩家输入 */
  inputReady: boolean;

  // ============ 操作方法 ============
  /** 推进到下一条消息 */
  advanceMessage: () => void;
  /** 跳过当前打字动画 */
  skipTyping: () => void;
  /** 设置打字状态 */
  setIsTyping: (typing: boolean) => void;
  /** 发送玩家输入 */
  sendPlayerInput: (input: string) => Promise<void>;
  /** 更新全局变量 */
  updateVariables: (vars: Record<string, string>) => void;
  /** 开始游戏 */
  startGame: () => void;
  /** 加载存档数据 */
  loadSave: (data: {
    conversationHistory: ConversationEntry[];
    variables: Record<string, string>;
  }) => void;
  /** 重置游戏 */
  resetGame: () => void;
  /** 清除错误 */
  clearError: () => void;
  /** 回溯到指定历史节点 */
  rollbackTo: (index: number) => void;
  /** 更新当前轮 AI 的响应 JSON（调试模式用） */
  updateCurrentResponse: (newResponse: any) => void;
}

/**
 * 将对话历史转换为 AI 需要的格式
 * 根据 contextLimit 裁剪历史数量
 */
function buildChatHistory(
  history: ConversationEntry[],
  contextLimit: number
): Array<{ role: 'user' | 'assistant'; content: string }> {
  // contextLimit 为 0 表示不限制
  const effectiveHistory = contextLimit > 0
    ? history.slice(-contextLimit)
    : history;

  const chatHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  for (const entry of effectiveHistory) {
    chatHistory.push({
      role: 'user',
      content: entry.playerInput,
    });
    chatHistory.push({
      role: 'assistant',
      content: JSON.stringify({
        messages: entry.aiMessages,
        variables: entry.variableChanges,
        time: entry.time,
      }),
    });
  }

  return chatHistory;
}

/**
 * 预加载消息中所有角色立绘和背景图
 * 利用 new Image() 让浏览器提前下载并缓存图片资源
 * 这样当用户推进到后续消息时，图片可以瞬间显示
 */
function preloadAssets(messages: AIMessage[]): void {
  const urls = new Set<string>();

  for (const msg of messages) {
    // 背景图
    if (msg.background) {
      urls.add(getAssetUrl('background', msg.background));
    }
    // 角色立绘
    if (msg.roles) {
      for (const role of msg.roles) {
        if (role.img) {
          urls.add(getAssetUrl('character', role.img));
        }
      }
    }
  }

  // 异步预加载，不阻塞主流程
  for (const url of urls) {
    const img = new Image();
    img.src = url;
  }
}

export const useGameStore = create<GameStore>((set, get) => ({
  messages: [],
  currentIndex: 0,
  isTyping: false,
  variables: {},
  conversationHistory: [],
  isLoading: false,
  error: null,
  isGameStarted: false,
  inputReady: false,

  advanceMessage: () => {
    const { currentIndex, messages, isTyping } = get();

    // 如果正在打字，先跳过打字动画
    if (isTyping) {
      set({ isTyping: false });
      return;
    }

    // 如果还有下一条消息，推进
    if (currentIndex < messages.length - 1) {
      set({ currentIndex: currentIndex + 1, isTyping: true });
    } else {
      // 所有消息播放完毕，切换到输入模式
      set({ inputReady: true });
    }
  },

  skipTyping: () => {
    set({ isTyping: false });
  },

  setIsTyping: (typing: boolean) => {
    set({ isTyping: typing });
  },

  sendPlayerInput: async (input: string) => {
    const { variables, conversationHistory } = get();

    set({ isLoading: true, error: null });

    try {
      // TODO: contextLimit 应从设置中获取，暂时使用 0（无限制）
      const history = buildChatHistory(conversationHistory, 0);

      const response = await sendChat({
        input,
        variables,
        history,
      });

      // 合并新变量
      const newVariables = { ...variables, ...response.variables };

      // 预加载所有消息中的角色立绘和背景图，加速后续消息的展示
      preloadAssets(response.messages);

      // 记录本轮对话到历史
      const newEntry: ConversationEntry = {
        playerInput: input,
        aiMessages: response.messages,
        variableChanges: response.variables,
        time: response.time,
        rawRequest: { input, variables, history },
        rawResponse: response,
        timestamp: Date.now(),
      };

      set({
        messages: response.messages,
        currentIndex: 0,
        isTyping: true,
        inputReady: false,
        variables: newVariables,
        conversationHistory: [...conversationHistory, newEntry],
        isLoading: false,
        isGameStarted: true,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '发送失败，请重试';
      set({ isLoading: false, error: errorMessage });
    }
  },

  updateVariables: (vars: Record<string, string>) => {
    const { variables } = get();
    set({ variables: { ...variables, ...vars } });
  },

  startGame: () => {
    set({ isGameStarted: true });
  },

  loadSave: (data) => {
    const lastEntry = data.conversationHistory[data.conversationHistory.length - 1];
    set({
      conversationHistory: data.conversationHistory,
      variables: data.variables,
      messages: lastEntry ? lastEntry.aiMessages : [],
      currentIndex: lastEntry ? lastEntry.aiMessages.length - 1 : 0,
      isTyping: false,
      isGameStarted: true,
    });
  },

  resetGame: () => {
    set({
      messages: [],
      currentIndex: 0,
      isTyping: false,
      variables: {},
      conversationHistory: [],
      isLoading: false,
      error: null,
      isGameStarted: false,
    });
  },

  clearError: () => {
    set({ error: null });
  },

  rollbackTo: (index: number) => {
    const { conversationHistory } = get();
    if (index < 0 || index >= conversationHistory.length) return;

    // 截断历史记录到选中节点（包含）
    const newHistory = conversationHistory.slice(0, index + 1);
    
    // 重新计算全局变量（累加变动）
    const newVariables = newHistory.reduce((acc, entry) => ({
      ...acc,
      ...entry.variableChanges,
    }), {} as Record<string, string>);

    const targetEntry = newHistory[newHistory.length - 1];

    set({
      conversationHistory: newHistory,
      variables: newVariables,
      messages: targetEntry.aiMessages,
      currentIndex: 0,
      isTyping: false,
      inputReady: false,
    });
  },

  updateCurrentResponse: (newResponse: any) => {
    const { conversationHistory, variables } = get();
    if (conversationHistory.length === 0) return;

    // 修改最后一条记录
    const lastEntry = conversationHistory[conversationHistory.length - 1];
    const updatedEntry: ConversationEntry = {
      ...lastEntry,
      aiMessages: newResponse.messages || [],
      variableChanges: newResponse.variables || {},
      time: newResponse.time || lastEntry.time,
      rawResponse: newResponse,
    };

    const newHistory = [...conversationHistory.slice(0, -1), updatedEntry];

    // 重新计算并应用 variables
    const newVariables = newHistory.reduce((acc, entry) => ({
      ...acc,
      ...entry.variableChanges,
    }), {} as Record<string, string>);

    set({
      conversationHistory: newHistory,
      messages: updatedEntry.aiMessages,
      variables: newVariables,
      currentIndex: 0,
      isTyping: false,
    });
  },
}));
