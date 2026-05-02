/**
 * 变量面板
 * 显示和编辑全局变量
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../store/game-store';
import './variable-panel.css';

export default function VariablePanel() {
  const { t } = useTranslation();
  const variables = useGameStore((s) => s.variables);
  const updateVariables = useGameStore((s) => s.updateVariables);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const entries = Object.entries(variables);

  const handleEdit = useCallback((key: string, value: string) => {
    setEditingKey(key);
    setEditValue(value);
  }, []);

  const handleSave = useCallback(() => {
    if (editingKey) {
      updateVariables({ [editingKey]: editValue });
      setEditingKey(null);
    }
  }, [editingKey, editValue, updateVariables]);

  return (
    <div className="variable-panel">
      <p className="vp-description">{t('variables.desc')}</p>
      {entries.length === 0 ? (
        <div className="vp-empty">{t('variables.empty')}</div>
      ) : (
        <div className="vp-list">
          <AnimatePresence>
            {entries.map(([key, value]) => (
              <motion.div key={key} className="vp-item" layout
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <span className="vp-key">{key}</span>
                {editingKey === key ? (
                  <div className="vp-edit-group">
                    <input className="vp-edit-input" value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                      autoFocus />
                    <button className="btn btn-primary" onClick={handleSave} style={{ padding: '4px 12px', fontSize: '12px' }}>✓</button>
                    <button className="btn btn-ghost" onClick={() => setEditingKey(null)} style={{ padding: '4px 8px', fontSize: '12px' }}>✕</button>
                  </div>
                ) : (
                  <div className="vp-value-group">
                    <span className="vp-value">{value}</span>
                    <button className="vp-edit-btn" onClick={() => handleEdit(key, value)}>✏️</button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
