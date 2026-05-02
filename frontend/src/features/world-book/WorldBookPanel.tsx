/**
 * 世界书管理面板
 * 支持条目的增删改查、启用/禁用、导入/导出
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      console.warn(t('world_book.err_load'));
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
      console.error(t('world_book.err_create_book'));
    }
  }, [newBookName, t]);

  const handleDeleteBook = useCallback(async (id: string) => {
    if (!confirm(t('world_book.confirm_delete_book'))) return;
    try {
      await deleteWorldBook(id);
      setBooks((prev) => prev.filter((b) => b.id !== id));
      if (activeBookId === id) {
        setActiveBookId(null);
      }
    } catch {
      console.error(t('world_book.err_delete_book'));
    }
  }, [activeBookId, t]);

  const handleAddEntry = () => {
    setEditingEntry({
      id: crypto.randomUUID(),
      name: t('world_book.new_entry'),
      keywords: [],
      content: '',
      alwaysActive: false,
      priority: 100,
    });
  };

  const handleSaveEntry = useCallback(async (entry: WorldBookEntry) => {
    if (!activeBook) return;
    const existingIndex = activeBook.entries.findIndex((e) => e.id === entry.id);
    const newEntries = existingIndex >= 0
      ? activeBook.entries.map((e) => (e.id === entry.id ? entry : e))
      : [...activeBook.entries, entry];
    try {
      const updatedBook = await updateWorldBook(activeBook.id, { entries: newEntries });
      setBooks((prev) => prev.map((b) => (b.id === activeBookId ? updatedBook : b)));
      setEditingEntry(null);
    } catch {
      console.error(t('world_book.err_save_entry'));
    }
  }, [activeBook, activeBookId, t]);

  const handleToggleEntry = useCallback(async (entryId: string) => {
    if (!activeBook) return;
    const updatedEntries = activeBook.entries.map((e) =>
      e.id === entryId ? { ...e, enabled: !e.enabled } : e
    );
    const updatedBook = { ...activeBook, entries: updatedEntries };
    try {
      await updateWorldBook(updatedBook.id, updatedBook);
      setBooks((prev) => prev.map((b) => (b.id === activeBookId ? updatedBook : b)));
    } catch {
      console.error(t('world_book.err_toggle_entry'));
    }
  }, [activeBook, activeBookId, t]);

  const handleDeleteEntry = useCallback(async (entryId: string) => {
    if (!activeBook) return;
    const updatedEntries = activeBook.entries.filter((e) => e.id !== entryId);
    const updatedBook = { ...activeBook, entries: updatedEntries };
    try {
      await updateWorldBook(updatedBook.id, updatedBook);
      setBooks((prev) => prev.map((b) => (b.id === activeBookId ? updatedBook : b)));
    } catch {
      console.error(t('world_book.err_delete_entry'));
    }
  }, [activeBook, activeBookId, t]);

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
      console.error(t('world_book.err_export'));
    }
  }, [activeBook, t]);

  const handleImport = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const newBook = await importWorldBook(file);
        setBooks((prev) => [...prev, newBook]);
        setActiveBookId(newBook.id);
      } catch {
        console.error(t('world_book.err_import'));
      }
    };
    input.click();
  }, [t]);

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
            <div className="wb-create-form">
                <input type="text" value={newBookName} onChange={(e) => setNewBookName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateBook()}
                  placeholder={t('world_book.placeholder_name')} autoFocus />
                <button className="btn btn-primary" onClick={handleCreateBook}>✓</button>
                <button className="btn btn-ghost" onClick={() => setIsCreating(false)}>✕</button>
            </div>
          ) : (
            <button className="wb-tab-add" onClick={() => setIsCreating(true)}>+</button>
          )}
        </div>
        <div className="wb-actions">
          <button className="btn btn-ghost" onClick={handleImport}>{t('world_book.btn_import')}</button>
          <button className="btn btn-ghost" onClick={handleExport} disabled={!activeBook}>{t('world_book.btn_export')}</button>
        </div>
      </div>

      {/* 条目列表 */}
      <div className="wb-main">
        {activeBook ? (
          <>
            <div className="wb-entries-header">
              <span className="wb-entries-count">{t('world_book.entries_count', { count: activeBook.entries.length })}</span>
              <button className="btn btn-primary" onClick={handleAddEntry}>{t('world_book.btn_add_entry')}</button>
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
                  <div className="wb-entry-info">
                    <span className="wb-entry-name">{entry.name}</span>
                    {entry.alwaysActive ? (
                      <span className="wb-always-active-badge">{t('world_book.always_active_badge')}</span>
                    ) : null}
                  </div>
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
          </>
        ) : (
          <p>{t('world_book.empty_books')}</p>
        )}
      </div>

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
function EntryEditor({
  entry,
  onSave,
  onClose,
}: {
  entry: WorldBookEntry;
  onSave: (entry: WorldBookEntry) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState(entry);
  const [newKeyword, setNewKeyword] = useState('');

  const handleAddKeyword = () => {
    const kw = newKeyword.trim();
    if (kw && !form.keywords.includes(kw)) {
      setForm((prev) => ({ ...prev, keywords: [...prev.keywords, kw] }));
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (kw: string) => {
    setForm((prev) => ({ ...prev, keywords: prev.keywords.filter((k) => k !== kw) }));
  };

  return (
    <div className="wb-editor-overlay" onClick={onClose}>
      <div className="wb-editor-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{t('world_book.edit_title')}</h3>
        <div className="wb-form">
          <label>{t('world_book.label_name')}</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="wb-editor-field">
          <div className="wb-always-active-toggle">
            <span>{t('world_book.label_always')}</span>
            <button
              className={`btn btn-sm ${form.alwaysActive ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setForm({ ...form, alwaysActive: !form.alwaysActive })}
            >
              {form.alwaysActive ? t('world_book.always_on') : t('world_book.always_off')}
            </button>
            <p className="wb-hint">
              {form.alwaysActive
              ? t('world_book.always_hint_on')
              : t('world_book.always_hint_off')}
            </p>
          </div>

          {!form.alwaysActive && (
            <>
              <label>{t('world_book.label_keywords')}</label>
              <div className="wb-keywords-input">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                  placeholder={t('world_book.placeholder_keyword')} />
                <button className="btn btn-secondary" onClick={handleAddKeyword}>+</button>
              </div>
              <div className="wb-keywords-list">
              {form.keywords.map((kw) => (
                <span key={kw} className="wb-keyword-tag">
                  {kw}<button onClick={() => handleRemoveKeyword(kw)}>×</button>
                </span>
              ))}
            </div>
            </>
          )}

          <label>{t('world_book.label_content')}</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={8} placeholder={t('world_book.placeholder_content')} />

          <label>{t('world_book.label_priority')}</label>
          <input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })} />
        </div>
        <div className="wb-editor-actions">
          <button className="btn btn-secondary" onClick={onClose}>{t('world_book.btn_cancel')}</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}>{t('world_book.btn_save')}</button>
        </div>
      </div>
    </div>
  );
}
