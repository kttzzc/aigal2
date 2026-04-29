/**
 * 世界书管理面板
 * 支持条目的增删改查、启用/禁用、导入/导出
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WorldBook, WorldBookEntry } from '../../types';
import {
  getWorldBooks,
  createWorldBook,
  updateWorldBook,
  deleteWorldBook,
  exportWorldBook,
  importWorldBook,
} from '../../services/api';
import './world-book-panel.css';

export default function WorldBookPanel() {
  const [books, setBooks] = useState<WorldBook[]>([]);
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<WorldBookEntry | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newBookName, setNewBookName] = useState('');

  const activeBook = books.find((b) => b.id === activeBookId);

  useEffect(() => { loadBooks(); }, []);

  const loadBooks = async () => {
    try {
      const data = await getWorldBooks();
      setBooks(data);
      if (data.length > 0 && !activeBookId) {
        setActiveBookId(data[0].id);
      }
    } catch {
      console.warn('无法加载世界书');
    }
  };

  const handleCreateBook = useCallback(async () => {
    if (!newBookName.trim()) return;
    try {
      const book = await createWorldBook({
        name: newBookName.trim(),
        description: '',
        entries: [],
      });
      setBooks((prev) => [...prev, book]);
      setActiveBookId(book.id);
      setNewBookName('');
      setIsCreating(false);
    } catch {
      console.error('创建世界书失败');
    }
  }, [newBookName]);

  const handleDeleteBook = useCallback(async (id: string) => {
    if (!confirm('确定要删除这个世界书吗？')) return;
    try {
      await deleteWorldBook(id);
      setBooks((prev) => prev.filter((b) => b.id !== id));
      if (activeBookId === id) {
        setActiveBookId(books.find((b) => b.id !== id)?.id || null);
      }
    } catch {
      console.error('删除世界书失败');
    }
  }, [activeBookId, books]);

  const handleAddEntry = useCallback(() => {
    if (!activeBook) return;
    const newEntry: WorldBookEntry = {
      id: `entry-${Date.now()}`,
      keywords: [],
      content: '',
      enabled: true,
      priority: 0,
      name: '新条目',
      alwaysActive: false,
    };
    setEditingEntry(newEntry);
  }, [activeBook]);

  const handleSaveEntry = useCallback(async (entry: WorldBookEntry) => {
    if (!activeBook) return;
    const existingIndex = activeBook.entries.findIndex((e) => e.id === entry.id);
    const newEntries = existingIndex >= 0
      ? activeBook.entries.map((e) => (e.id === entry.id ? entry : e))
      : [...activeBook.entries, entry];
    try {
      const updated = await updateWorldBook(activeBook.id, { entries: newEntries });
      setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setEditingEntry(null);
    } catch {
      console.error('保存条目失败');
    }
  }, [activeBook]);

  const handleToggleEntry = useCallback(async (entryId: string) => {
    if (!activeBook) return;
    const newEntries = activeBook.entries.map((e) =>
      e.id === entryId ? { ...e, enabled: !e.enabled } : e
    );
    try {
      const updated = await updateWorldBook(activeBook.id, { entries: newEntries });
      setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    } catch {
      console.error('切换条目失败');
    }
  }, [activeBook]);

  const handleDeleteEntry = useCallback(async (entryId: string) => {
    if (!activeBook) return;
    const newEntries = activeBook.entries.filter((e) => e.id !== entryId);
    try {
      const updated = await updateWorldBook(activeBook.id, { entries: newEntries });
      setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    } catch {
      console.error('删除条目失败');
    }
  }, [activeBook]);

  const handleExport = useCallback(async () => {
    if (!activeBook) return;
    try {
      const blob = await exportWorldBook(activeBook.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeBook.name}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      console.error('导出失败');
    }
  }, [activeBook]);

  const handleImport = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const book = await importWorldBook(file);
        setBooks((prev) => [...prev, book]);
        setActiveBookId(book.id);
      } catch {
        console.error('导入失败');
      }
    };
    input.click();
  }, []);

  return (
    <div className="world-book-panel">
      {/* 世界书选择器 */}
      <div className="wb-selector">
        <div className="wb-tabs">
          {books.map((book) => (
            <button key={book.id}
              className={`wb-tab ${activeBookId === book.id ? 'active' : ''}`}
              onClick={() => setActiveBookId(book.id)}>
              {book.name}
              <span className="wb-tab-delete" onClick={(e) => {
                e.stopPropagation();
                handleDeleteBook(book.id);
              }}>×</span>
            </button>
          ))}
          {isCreating ? (
            <div className="wb-tab-create">
              <input type="text" value={newBookName}
                onChange={(e) => setNewBookName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateBook()}
                placeholder="名称..." autoFocus />
              <button onClick={handleCreateBook}>✓</button>
              <button onClick={() => setIsCreating(false)}>✕</button>
            </div>
          ) : (
            <button className="wb-tab-add" onClick={() => setIsCreating(true)}>+</button>
          )}
        </div>
        <div className="wb-actions">
          <button className="btn btn-ghost" onClick={handleImport}>📥 导入</button>
          <button className="btn btn-ghost" onClick={handleExport} disabled={!activeBook}>📤 导出</button>
        </div>
      </div>

      {/* 条目列表 */}
      {activeBook ? (
        <div className="wb-entries">
          <div className="wb-entries-header">
            <span className="wb-entries-count">{activeBook.entries.length} 个条目</span>
            <button className="btn btn-primary" onClick={handleAddEntry}>+ 添加条目</button>
          </div>
          <AnimatePresence>
            {activeBook.entries.map((entry) => (
              <motion.div key={entry.id}
                className={`wb-entry ${entry.enabled ? '' : 'disabled'}`}
                layout initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="wb-entry-header">
                  <button className={`wb-entry-toggle ${entry.enabled ? 'on' : 'off'}`}
                    onClick={() => handleToggleEntry(entry.id)}>
                    {entry.enabled ? '●' : '○'}
                  </button>
                  <span className="wb-entry-name">{entry.name}</span>
                  {entry.alwaysActive && (
                    <span className="wb-always-active-badge">📌 常驻</span>
                  )}
                  <div className="wb-entry-keywords">
                    {entry.keywords.map((kw, i) => (
                      <span key={i} className="wb-keyword-tag">{kw}</span>
                    ))}
                  </div>
                  <div className="wb-entry-actions">
                    <button onClick={() => setEditingEntry(entry)}>✏️</button>
                    <button onClick={() => handleDeleteEntry(entry.id)}>🗑️</button>
                  </div>
                </div>
                <p className="wb-entry-preview">
                  {entry.content.slice(0, 100)}{entry.content.length > 100 ? '...' : ''}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="wb-empty">
          <p>还没有世界书，点击 "+" 创建一个或导入已有的世界书</p>
        </div>
      )}

      {/* 条目编辑弹窗 */}
      <AnimatePresence>
        {editingEntry && (
          <EntryEditor entry={editingEntry}
            onSave={handleSaveEntry} onClose={() => setEditingEntry(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/** 条目编辑器子组件 */
function EntryEditor({ entry, onSave, onClose }: {
  entry: WorldBookEntry;
  onSave: (entry: WorldBookEntry) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<WorldBookEntry>(entry);
  const [keywordInput, setKeywordInput] = useState('');

  const handleAddKeyword = () => {
    const kw = keywordInput.trim();
    if (kw && !form.keywords.includes(kw)) {
      setForm((prev) => ({ ...prev, keywords: [...prev.keywords, kw] }));
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (kw: string) => {
    setForm((prev) => ({ ...prev, keywords: prev.keywords.filter((k) => k !== kw) }));
  };

  return (
    <motion.div className="wb-editor-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="wb-editor"
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}>
        <h3>编辑条目</h3>
        <div className="wb-editor-field">
          <label>名称</label>
          <input type="text" value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
        </div>
        <div className="wb-editor-field">
          <label className="wb-toggle-label">
            <span>常驻触发</span>
            <button
              type="button"
              className={`wb-toggle-btn ${form.alwaysActive ? 'on' : 'off'}`}
              onClick={() => setForm((prev) => ({ ...prev, alwaysActive: !prev.alwaysActive }))}
            >
              {form.alwaysActive ? '开启' : '关闭'}
            </button>
          </label>
          <p className="wb-field-hint">
            {form.alwaysActive
              ? '此条目会在每次 AI 请求时自动注入，无需关键词匹配'
              : '关闭时需要通过关键词匹配触发'}
          </p>
        </div>
        {!form.alwaysActive && (
          <div className="wb-editor-field">
            <label>关键词</label>
            <div className="wb-keywords-input">
              <input type="text" value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                placeholder="输入关键词后回车添加" />
            </div>
            <div className="wb-keywords-list">
              {form.keywords.map((kw) => (
                <span key={kw} className="wb-keyword-tag">
                  {kw}<button onClick={() => handleRemoveKeyword(kw)}>×</button>
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="wb-editor-field">
          <label>内容</label>
          <textarea value={form.content}
            onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
            rows={8} placeholder="条目内容..." />
        </div>
        <div className="wb-editor-field">
          <label>优先级</label>
          <input type="number" value={form.priority}
            onChange={(e) => setForm((prev) => ({ ...prev, priority: parseInt(e.target.value) || 0 }))} />
        </div>
        <div className="wb-editor-actions">
          <button className="btn btn-secondary" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}>保存</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
