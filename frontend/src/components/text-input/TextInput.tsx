/**
 * 玩家输入组件
 * 所有消息播放完毕后显示，允许玩家输入文字推进剧情
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './text-input.css';

interface TextInputProps {
  /** 是否显示 */
  visible: boolean;
  /** 是否正在等待 AI 响应 */
  isLoading?: boolean;
  /** 提交回调 */
  onSubmit: (text: string) => void;
  /** 占位文本 */
  placeholder?: string;
}

export default function TextInput({
  visible,
  isLoading = false,
  onSubmit,
  placeholder,
}: TextInputProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 显示时自动聚焦
  useEffect(() => {
    if (visible && inputRef.current) {
      // NOTE: 延迟聚焦，确保动画完成后再聚焦
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
    setValue('');
  }, [value, isLoading, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // 回车发送（Shift+回车换行）
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="text-input-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="text-input-wrapper">
            <textarea
              ref={inputRef}
              className="text-input-field"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              rows={2}
            />
            <button
              className={`text-input-send ${value.trim() ? 'active' : ''}`}
              onClick={handleSubmit}
              disabled={!value.trim() || isLoading}
              title={t('game_view.btn_send', '发送')}
            >
              {isLoading ? (
                <span className="send-loading" />
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-input-hint">{t('game_view.input_hint', '按 Enter 发送，Shift+Enter 换行')}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
