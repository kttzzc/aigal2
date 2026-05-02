/**
 * 系统提示词编辑器
 * 支持 Markdown 编辑和文件切换
 */
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { PromptFile } from '../../types';
import { getPromptFiles, savePromptFile, createPromptFile, deletePromptFile, setActivePrompt } from '../../services/api';
import './prompt-editor.css';

export default function PromptEditor() {
  const { t } = useTranslation();
  const [files, setFiles] = useState<PromptFile[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const currentFile = files.find((f) => f.filename === activeFile);

  useEffect(() => { loadFiles(); }, []);

  const loadFiles = async () => {
    try {
      const data = await getPromptFiles();
      setFiles(data);
      if (data.length > 0 && !activeFile) {
        setActiveFile(data[0].filename);
        setContent(data[0].content);
      }
    } catch { console.warn(t('prompt_editor.err_load')); }
  };

  const handleSelectFile = useCallback((filename: string) => {
    const file = files.find((f) => f.filename === filename);
    if (file) {
      setActiveFile(filename);
      setContent(file.content);
      setHasChanges(false);
    }
  }, [files]);

  const handleContentChange = (value: string) => {
    setContent(value);
    setHasChanges(true);
  };

  const handleSave = useCallback(async () => {
    if (!activeFile) return;
    setIsSaving(true);
    try {
      const updated = await savePromptFile(activeFile, content);
      setFiles((prev) => prev.map((f) => (f.filename === activeFile ? updated : f)));
      // 保存后自动将其设为当前使用的提示词，确保修改立刻生效
      await setActivePrompt(activeFile);
      await loadFiles();
    } catch {
      console.error(t('prompt_editor.err_save'));
    } finally { setIsSaving(false); }
  }, [activeFile, content]);

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return;
    try {
      const file = await createPromptFile(newName.trim(), t('prompt_editor.default_content_template'));
      setFiles((prev) => [...prev, file]);
      setActiveFile(file.filename);
      setContent(file.content);
      setNewName('');
      setIsCreating(false);
    } catch { console.error(t('prompt_editor.err_create')); }
  }, [newName]);

  const handleDelete = useCallback(async (filename: string) => {
    if (!confirm(t('prompt_editor.confirm_delete'))) return;
    try {
      await deletePromptFile(filename);
      setFiles((prev) => prev.filter((f) => f.filename !== filename));
      if (activeFile === filename) {
        const remaining = files.filter((f) => f.filename !== filename);
        if (remaining.length > 0) handleSelectFile(remaining[0].filename);
        else { setActiveFile(null); setContent(''); }
      }
    } catch { console.error(t('prompt_editor.err_delete')); }
  }, [files, activeFile, handleSelectFile]);

  const handleSetActive = useCallback(async () => {
    if (!activeFile) return;
    try {
      await setActivePrompt(activeFile);
      alert(`${t('prompt_editor.success_set')} "${currentFile?.name}"`);
    } catch { console.error(t('prompt_editor.err_set')); }
  }, [activeFile, currentFile, t]);

  // 快捷键 Ctrl+S 保存
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave]);

  return (
    <div className="prompt-editor">
      {/* 文件列表侧栏 */}
      <div className="pe-sidebar">
        <div className="pe-sidebar-header">
          <span className="pe-sidebar-title">{t('prompt_editor.title')}</span>
          {isCreating ? (
            <div className="pe-create-form">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t('prompt_editor.placeholder_name')}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
              <div className="pe-create-actions">
                <button className="btn btn-primary btn-sm" onClick={handleCreate}>{t('prompt_editor.btn_ok')}</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setIsCreating(false)}>{t('prompt_editor.btn_cancel')}</button>
              </div>
            </div>
          ) : (
            <button className="btn btn-secondary pe-create-btn" onClick={() => setIsCreating(true)}>
              + {t('prompt_editor.btn_create')}
            </button>
          )}
        </div>
        <div className="pe-file-list">
          {files.map((file) => (
            <div key={file.filename}
              className={`pe-file-item ${activeFile === file.filename ? 'active' : ''}`}
              onClick={() => handleSelectFile(file.filename)}>
              <span className="pe-file-icon">📝</span>
              <span className="pe-file-name">{file.name}</span>
              {file.isDefault && <span className="pe-file-badge">{t('prompt_editor.current')}</span>}
              {!file.isDefault && (
                <button className="pe-file-delete" onClick={(e) => { e.stopPropagation(); handleDelete(file.filename); }}>×</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 编辑器主区域 */}
      <div className="pe-main">
        {activeFile ? (
          <>
            <div className="pe-toolbar">
              <span className="pe-filename">{currentFile?.name}.md</span>
              {hasChanges && <span className="pe-unsaved">● {t('prompt_editor.unsaved')}</span>}
              <div className="pe-toolbar-actions">
                <button className="btn btn-ghost" onClick={handleSetActive}>{t('prompt_editor.btn_set_active')}</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? t('prompt_editor.btn_saving') : t('prompt_editor.btn_save')}
                </button>
              </div>
            </div>
            <textarea className="pe-textarea" value={content} onChange={(e) => handleContentChange(e.target.value)}
              placeholder={t('prompt_editor.placeholder_content')} spellCheck={false} />
          </>
        ) : (
          <div className="pe-empty">{t('prompt_editor.empty_selection')}</div>
        )}
      </div>
    </div>
  );
}
