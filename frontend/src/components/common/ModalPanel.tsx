/**
 * 通用模态面板组件
 * 从右侧滑入的全屏面板，用于设置、编辑器等子界面
 */
import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './modal-panel.css';

interface ModalPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** 面板宽度，默认 640px */
  width?: number | string;
  /** 是否全屏 */
  fullScreen?: boolean;
}

export default function ModalPanel({
  isOpen,
  onClose,
  title,
  children,
  width = 640,
  fullScreen = false,
}: ModalPanelProps) {
  // ESC 键关闭
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-panel-wrapper">
          {/* 背景遮罩 */}
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* 面板 */}
          <motion.div
            className={`modal-panel ${fullScreen ? 'full-screen' : ''}`}
            style={!fullScreen ? { width } : undefined}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* 头部 */}
            <div className="modal-panel-header">
              <h2 className="modal-panel-title">{title}</h2>
              <button
                className="modal-panel-close"
                onClick={onClose}
                title="关闭 (Esc)"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 内容 */}
            <div className="modal-panel-content">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
