/**
 * 游戏主页面
 * 整合背景、角色立绘、对话框、玩家输入
 * 支持两种菜单布局：经典菜单（右上角）和实验性 UI（底部操作栏）
 */
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/game-store';
import type { AppSettings } from '../types';
import BackgroundLayer from '../components/background-layer/BackgroundLayer';
import CharacterSprite from '../components/character-sprite/CharacterSprite';
import DialogueBox from '../components/dialogue-box/DialogueBox';
import TextInput from '../components/text-input/TextInput';
import GameMenu from '../components/game-menu/GameMenu';
import ActionBar from '../components/action-bar/ActionBar';
import ModalPanel from '../components/common/ModalPanel';
import SettingsPanel from '../features/settings/SettingsPanel';
import WorldBookPanel from '../features/world-book/WorldBookPanel';
import PromptEditor from '../features/prompt-editor/PromptEditor';
import AssetManager from '../features/asset-manager/AssetManager';
import UIEditor from '../features/ui-editor/UIEditor';
import VariablePanel from '../components/variable-panel/VariablePanel';
import SaveLoadPanel from '../features/save-load/SaveLoadPanel';
import TimelinePanel from '../features/timeline/TimelinePanel';
import DebugPanel from '../features/debug/DebugPanel';
import { getAssetUrl, getSettings } from '../services/api';
import './game-view.css';

type PanelType = 'settings' | 'worldBook' | 'promptEditor' | 'assetManager' | 'uiEditor' | 'variables' | 'save' | 'load' | 'timeline' | 'debug' | null;

export default function GameView() {
  const navigate = useNavigate();
  const {
    messages,
    currentIndex,
    isLoading,
    isGameStarted,
    inputReady,
    sendPlayerInput,
    advanceMessage,
  } = useGameStore();

  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);

  /** 加载应用设置以确定 UI 模式 */
  useEffect(() => {
    getSettings()
      .then(setAppSettings)
      .catch(() => {
        // NOTE: 后端未启动时使用默认值
        setAppSettings({
          ai: { apiKey: '', baseUrl: '', model: '' },
          contextLimit: 0,
          textSpeed: 50,
          autoPlayInterval: 3000,
          enableMenuAnimation: true,
          experimentalUI: false,
          tts: {
            apiKey: '',
            baseUrl: 'https://api.minimaxi.com',
            model: 'speech-2.8-hd',
            voiceId: 'male-qn-qingse',
            speed: 1.0,
            autoRead: false,
          },
        });
      });
  }, []);

  const useExperimentalUI = appSettings?.experimentalUI ?? false;

  /** 拦截 F12 进入调试模式 */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12') {
        e.preventDefault();
        setActivePanel('debug');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /** 当前显示的消息 */
  const currentMessage = useMemo(() => {
    if (messages.length === 0) return null;
    return messages[currentIndex] || null;
  }, [messages, currentIndex]);

  /** 是否还有下一条消息 */
  const hasNextMessage = currentIndex < messages.length - 1;

  /**
   * 是否显示玩家输入框
   * 只有当用户在最后一条消息上再次点击（inputReady = true）后才显示
   */
  const showInput = isGameStarted && inputReady && !isLoading;

  /** 处理消息推进 */
  const handleAdvance = useCallback(() => {
    advanceMessage();
  }, [advanceMessage]);

  /** 处理玩家输入 */
  const handlePlayerInput = useCallback(
    async (input: string) => {
      await sendPlayerInput(input);
    },
    [sendPlayerInput]
  );

  /** 背景图 URL */
  const backgroundUrl = useMemo(() => {
    if (!currentMessage?.background) return undefined;
    return getAssetUrl('background', currentMessage.background);
  }, [currentMessage]);

  /** 当前说话角色的 ID */
  const speakingRoleId = useMemo(() => {
    if (!currentMessage?.roles) return undefined;
    return currentMessage.roles[0]?.id;
  }, [currentMessage]);

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

  return (
    <div className={`game-view ${useExperimentalUI ? 'experimental-ui' : ''}`}>
      {/* 背景层 */}
      <BackgroundLayer imageUrl={backgroundUrl} />

      {/* 角色立绘 */}
      {currentMessage?.roles && currentMessage.roles.length > 0 && (
        <CharacterSprite
          roles={currentMessage.roles}
          speakingRoleId={speakingRoleId}
          assetBaseUrl={`${API_BASE}/assets`}
        />
      )}

      {/* 对话框 — 有消息时显示，且未处于输入模式 */}
      {!showInput && (
        <DialogueBox
          message={currentMessage}
          isLoading={isLoading}
          hasNext={hasNextMessage}
          onAdvance={handleAdvance}
          ttsConfig={appSettings?.tts}
        />
      )}

      {/* 玩家输入框 */}
      <TextInput
        visible={showInput || (!isGameStarted && !isLoading)}
        isLoading={isLoading}
        onSubmit={handlePlayerInput}
        placeholder={isGameStarted ? '继续你的故事...' : '输入开场白，开始你的冒险...'}
      />

      {/* ======= 菜单模式切换 ======= */}
      {useExperimentalUI ? (
        /* 实验性 UI：底部操作栏 */
        <ActionBar
          onSave={() => setActivePanel('save')}
          onLoad={() => setActivePanel('load')}
          onTime={() => setActivePanel('timeline')}
          onSystem={() => navigate('/settings')}
          onTitle={() => navigate('/')}
        />
      ) : (
        /* 经典 UI：右上角汉堡菜单 */
        <GameMenu
          onOpenSettings={() => setActivePanel('settings')}
          onOpenWorldBook={() => setActivePanel('worldBook')}
          onOpenPromptEditor={() => setActivePanel('promptEditor')}
          onOpenAssetManager={() => setActivePanel('assetManager')}
          onOpenUIEditor={() => setActivePanel('uiEditor')}
          onOpenVariablePanel={() => setActivePanel('variables')}
          onOpenTimeline={() => setActivePanel('timeline')}
          onSave={() => setActivePanel('save')}
          onLoad={() => setActivePanel('load')}
          onBackToTitle={() => navigate('/')}
        />
      )}

      {/* ======= 功能面板（两种模式共用） ======= */}
      {/* 存档 */}
      <ModalPanel isOpen={activePanel === 'save'} onClose={() => setActivePanel(null)} title="💾 保存游戏">
        <SaveLoadPanel mode="save" onClose={() => setActivePanel(null)} />
      </ModalPanel>

      <ModalPanel isOpen={activePanel === 'load'} onClose={() => setActivePanel(null)} title="📂 读取存档">
        <SaveLoadPanel mode="load" onClose={() => setActivePanel(null)} />
      </ModalPanel>

      <ModalPanel isOpen={activePanel === 'timeline'} onClose={() => setActivePanel(null)} title="⏱️ 时间线" width={600}>
        <TimelinePanel />
      </ModalPanel>

      <ModalPanel isOpen={activePanel === 'debug'} onClose={() => setActivePanel(null)} title="🐛 调试模式" width={800}>
        <DebugPanel />
      </ModalPanel>

      {/* 经典模式下的功能面板（实验性模式下这些在 /settings 页面） */}
      {!useExperimentalUI && (
        <>
          <ModalPanel isOpen={activePanel === 'settings'} onClose={() => setActivePanel(null)} title="⚙️ 设置">
            <SettingsPanel />
          </ModalPanel>

          <ModalPanel isOpen={activePanel === 'worldBook'} onClose={() => setActivePanel(null)} title="📖 世界书" width={700}>
            <WorldBookPanel />
          </ModalPanel>

          <ModalPanel isOpen={activePanel === 'promptEditor'} onClose={() => setActivePanel(null)} title="📝 系统提示词" width={900}>
            <PromptEditor />
          </ModalPanel>

          <ModalPanel isOpen={activePanel === 'assetManager'} onClose={() => setActivePanel(null)} title="🎨 素材管理" width={800}>
            <AssetManager />
          </ModalPanel>

          <ModalPanel isOpen={activePanel === 'uiEditor'} onClose={() => setActivePanel(null)} title="🖌️ 自定义 UI" fullScreen>
            <UIEditor />
          </ModalPanel>

          <ModalPanel isOpen={activePanel === 'variables'} onClose={() => setActivePanel(null)} title="📊 全局变量">
            <VariablePanel />
          </ModalPanel>
        </>
      )}
    </div>
  );
}
