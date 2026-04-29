/**
 * 对话框组件
 * Galgame 风格的半透明玻璃拟态对话框
 * 支持打字机效果、角色名高亮、点击推进、TTS 语音朗读
 */
import { useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTypewriter } from '../../hooks/use-typewriter';
import { useTTS } from '../../hooks/use-tts';
import type { AIMessage, TTSConfig } from '../../types';
import './dialogue-box.css';

interface DialogueBoxProps {
  /** 当前要显示的消息 */
  message: AIMessage | null;
  /** 是否正在等待 AI 响应 */
  isLoading?: boolean;
  /** 是否还有下一条消息 */
  hasNext: boolean;
  /** 打字速度（毫秒/字） */
  textSpeed?: number;
  /** 点击推进/跳过回调 */
  onAdvance: () => void;
  /** 打字完成回调 */
  onTypingComplete?: () => void;
  /** TTS 配置，传入则启用语音功能 */
  ttsConfig?: TTSConfig;
}

export default function DialogueBox({
  message,
  isLoading = false,
  hasNext,
  textSpeed = 50,
  onAdvance,
  onTypingComplete,
  ttsConfig,
}: DialogueBoxProps) {
  const { displayedText, isTyping, skip, isComplete } = useTypewriter({
    text: message?.message || '',
    speed: textSpeed,
    enabled: !!message,
    onComplete: onTypingComplete,
  });

  const { isPlaying, isLoading: ttsLoading, speak, stop } = useTTS({
    config: ttsConfig,
  });

  // 追踪已自动朗读过的文本，防止同一段文本重复触发
  const lastAutoReadRef = useRef<string>('');

  /** 自动朗读：打字完成后自动触发 TTS */
  useEffect(() => {
    if (
      ttsConfig?.autoRead &&
      isComplete &&
      message?.message &&
      message.message !== lastAutoReadRef.current
    ) {
      lastAutoReadRef.current = message.message;
      speak(message.message);
    }
  }, [isComplete, message?.message, ttsConfig?.autoRead, speak]);

  /** 手动点击播放按钮 */
  const handleSpeak = useCallback((e: React.MouseEvent) => {
    // 阻止事件冒泡到对话框的 onClick（推进）
    e.stopPropagation();

    if (!ttsConfig?.apiKey) {
      alert('TTS 未配置，请在设置中填写 MiniMax API Key');
      return;
    }

    if (isPlaying) {
      stop();
    } else if (message?.message) {
      speak(message.message);
    }
  }, [isPlaying, message?.message, speak, stop, ttsConfig?.apiKey]);

  /** 处理点击/键盘事件 */
  const handleAdvance = useCallback(() => {
    if (isLoading) return;

    if (isTyping) {
      // 正在打字时点击 → 跳过打字
      skip();
    } else if (isComplete) {
      // 打字完成后点击 → 推进到下一条
      onAdvance();
    }
  }, [isTyping, isComplete, isLoading, skip, onAdvance]);

  // 键盘快捷键：空格/回车推进
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleAdvance();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAdvance]);

  /** TTS 按钮始终显示（只要传入了 ttsConfig 对象） */
  const ttsVisible = !!ttsConfig;

  return (
    <AnimatePresence>
      {(message || isLoading) && (
        <motion.div
          className="dialogue-box"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          onClick={handleAdvance}
        >
          {/* 角色名标签 */}
          {message?.name && (
            <motion.div
              className="dialogue-name-tag"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <span className="dialogue-name">{message.name}</span>
            </motion.div>
          )}

          {/* 对话内容区域 */}
          <div className="dialogue-content">
            {isLoading ? (
              <div className="dialogue-loading">
                <span className="loading-dot" />
                <span className="loading-dot" />
                <span className="loading-dot" />
              </div>
            ) : (
              <p className="dialogue-text">{displayedText}</p>
            )}
          </div>

          {/* TTS 播放按钮 — 文字显示完毕时显示 */}
          {ttsVisible && isComplete && !isLoading && (
            <button
              className={`dialogue-tts-btn ${isPlaying ? 'playing' : ''} ${ttsLoading ? 'loading' : ''}`}
              onClick={handleSpeak}
              title={isPlaying ? '停止朗读' : '朗读此段'}
            >
              {ttsLoading ? '⏳' : isPlaying ? '⏹️' : '🔊'}
            </button>
          )}

          {/* 继续提示 */}
          {isComplete && !isLoading && (
            <motion.div
              className="dialogue-continue"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {hasNext ? (
                <span className="continue-indicator">▼</span>
              ) : (
                <span className="continue-indicator input-ready">●</span>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
