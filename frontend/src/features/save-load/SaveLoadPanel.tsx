/**
 * 存档管理面板
 * 支持保存当前游戏状态和加载历史存档
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../store/game-store';
import { getSaves, createSave, deleteSave } from '../../services/api';
import './save-load-panel.css';

interface SaveEntry {
  id: string;
  name: string;
  messages: Array<Record<string, unknown>>;
  currentIndex: number;
  variables: Record<string, string>;
  history: Array<Record<string, unknown>>;
  createdAt: number;
  updatedAt: number;
}

interface SaveLoadPanelProps {
  /** 打开模式：save = 保存，load = 读取 */
  mode: 'save' | 'load';
  onClose: () => void;
}

export default function SaveLoadPanel({ mode, onClose }: SaveLoadPanelProps) {
  const { t } = useTranslation();
  const [saves, setSaves] = useState<SaveEntry[]>([]);
  const [saveName, setSaveName] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const {
    messages,
    currentIndex,
    variables,
    conversationHistory,
    loadSave,
  } = useGameStore();

  useEffect(() => {
    loadSaves();
  }, []);

  const loadSaves = async () => {
    try {
      const data = await getSaves();
      setSaves(data as unknown as SaveEntry[]);
    } catch {
      console.warn(t('save_load.err_load_list'));
    }
  };

  /** 保存当前状态 */
  const handleSave = useCallback(async () => {
    if (!saveName.trim()) return;
    setIsBusy(true);
    try {
      await createSave({
        name: saveName.trim(),
        messages: messages as unknown as Array<Record<string, unknown>>,
        currentIndex,
        variables,
        history: conversationHistory as unknown as Array<Record<string, unknown>>,
      });
      setSaveName('');
      await loadSaves();
    } catch {
      console.error(t('save_load.err_save'));
    } finally {
      setIsBusy(false);
    }
  }, [saveName, messages, currentIndex, variables, conversationHistory]);

  /** 加载存档 */
  const handleLoad = useCallback(async (save: SaveEntry) => {
    if (!confirm(t('save_load.confirm_load', { name: save.name }))) return;
    loadSave({
      conversationHistory: save.history as unknown as typeof conversationHistory,
      variables: save.variables,
    });
    onClose();
  }, [loadSave, onClose]);

  /** 删除存档 */
  const handleDelete = useCallback(async (id: string) => {
    if (!confirm(t('save_load.confirm_delete'))) return;
    try {
      await deleteSave(id);
      setSaves((prev) => prev.filter((s) => s.id !== id));
    } catch {
      console.error(t('save_load.err_delete'));
    }
  }, [t]);

  const formatTime = (ts: number) => {
    return new Date(ts * 1000).toLocaleString('zh-CN');
  };

  return (
    <div className="save-load-panel">
      <h3 className="slp-title">
        {mode === 'save' ? t('save_load.title_save') : t('save_load.title_load')}
      </h3>

      {/* 保存模式：新存档输入 */}
      {mode === 'save' && (
        <div className="slp-new-save">
          <input
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder={t('save_load.placeholder_name')}
            autoFocus
          />
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={isBusy || !saveName.trim()}
          >
            {isBusy ? t('save_load.btn_saving') : t('save_load.btn_save')}
          </button>
        </div>
      )}

      {/* 存档列表 */}
      <div className="slp-list">
        {saves.length === 0 ? (
          <div className="slp-empty">{t('save_load.empty')}</div>
        ) : (
          <AnimatePresence>
            {saves.map((save) => (
              <motion.div
                key={save.id}
                className="slp-item"
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="slp-item-info">
                  <span className="slp-item-name">{save.name}</span>
                  <span className="slp-item-time">{formatTime(save.createdAt)}</span>
                  <span className="slp-item-detail">
                    {t('save_load.vars_count', { count: Object.keys(save.variables).length })}
                  </span>
                </div>
                <div className="slp-item-actions">
                  {mode === 'load' && (
                    <button className="btn btn-primary btn-sm" onClick={() => handleLoad(save)}>
                      {t('save_load.btn_load')}
                    </button>
                  )}
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(save.id)}>
                    🗑️
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
