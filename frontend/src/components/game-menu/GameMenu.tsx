/**
 * 游戏主菜单组件
 * 显示在游戏画面右上角，提供快捷操作入口
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './game-menu.css';

interface GameMenuProps {
  onOpenSettings: () => void;
  onOpenWorldBook: () => void;
  onOpenPromptEditor: () => void;
  onOpenAssetManager: () => void;
  onOpenUIEditor: () => void;
  onOpenVariablePanel: () => void;
  onOpenTimeline: () => void;
  onSave: () => void;
  onLoad: () => void;
  onBackToTitle: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  onClick: () => void;
}

export default function GameMenu({
  onOpenSettings,
  onOpenWorldBook,
  onOpenPromptEditor,
  onOpenAssetManager,
  onOpenUIEditor,
  onOpenVariablePanel,
  onOpenTimeline,
  onSave,
  onLoad,
  onBackToTitle,
}: GameMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems: MenuItem[] = [
    { id: 'settings', label: '设置', icon: '⚙️', onClick: onOpenSettings },
    { id: 'world-book', label: '世界书', icon: '📖', onClick: onOpenWorldBook },
    { id: 'prompt', label: '提示词', icon: '📝', onClick: onOpenPromptEditor },
    { id: 'assets', label: '素材', icon: '🎨', onClick: onOpenAssetManager },
    { id: 'ui-editor', label: 'UI编辑', icon: '🖌️', onClick: onOpenUIEditor },
    { id: 'variables', label: '变量', icon: '📊', onClick: onOpenVariablePanel },
    { id: 'timeline', label: '时间线', icon: '⏱️', onClick: onOpenTimeline },
    { id: 'save', label: '保存', icon: '💾', onClick: onSave },
    { id: 'load', label: '读档', icon: '📂', onClick: onLoad },
    { id: 'title', label: '标题', icon: '🏠', onClick: onBackToTitle },
  ];

  const handleItemClick = (item: MenuItem) => {
    item.onClick();
    setIsOpen(false);
  };

  return (
    <div className="game-menu">
      {/* 菜单触发按钮 */}
      <motion.button
        className="game-menu-trigger"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="菜单"
      >
        <span className={`menu-icon ${isOpen ? 'open' : ''}`}>
          <span />
          <span />
          <span />
        </span>
      </motion.button>

      {/* 菜单面板 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              className="game-menu-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            {/* 菜单列表 */}
            <motion.div
              className="game-menu-panel"
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  className="game-menu-item"
                  onClick={() => handleItemClick(item)}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ x: -4 }}
                >
                  <span className="menu-item-icon">{item.icon}</span>
                  <span className="menu-item-label">{item.label}</span>
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
