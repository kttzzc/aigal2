/**
 * 游戏主菜单组件
 * 显示在游戏画面右上角，提供快捷操作入口
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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
  labelKey: string;
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
  const { t } = useTranslation();

  const menuItems: MenuItem[] = [
    { id: 'settings', labelKey: 'game_menu.settings', icon: '⚙️', onClick: onOpenSettings },
    { id: 'world-book', labelKey: 'game_menu.world_book', icon: '📖', onClick: onOpenWorldBook },
    { id: 'prompt', labelKey: 'game_menu.prompt', icon: '📝', onClick: onOpenPromptEditor },
    { id: 'assets', labelKey: 'game_menu.assets', icon: '🎨', onClick: onOpenAssetManager },
    { id: 'ui-editor', labelKey: 'game_menu.ui_editor', icon: '🖌️', onClick: onOpenUIEditor },
    { id: 'variables', labelKey: 'game_menu.variables', icon: '📊', onClick: onOpenVariablePanel },
    { id: 'timeline', labelKey: 'game_menu.timeline', icon: '⏱️', onClick: onOpenTimeline },
    { id: 'save', labelKey: 'game_menu.save', icon: '💾', onClick: onSave },
    { id: 'load', labelKey: 'game_menu.load', icon: '📂', onClick: onLoad },
    { id: 'title', labelKey: 'game_menu.title', icon: '🏠', onClick: onBackToTitle },
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
                  <span className="menu-item-label">{t(item.labelKey)}</span>
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
