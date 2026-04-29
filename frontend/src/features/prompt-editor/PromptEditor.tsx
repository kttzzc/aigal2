/**
 * 系统提示词编辑器
 * 支持 Markdown 编辑和文件切换
 */
import { useState, useEffect, useCallback } from 'react';
import type { PromptFile } from '../../types';
import { getPromptFiles, savePromptFile, createPromptFile, deletePromptFile, setActivePrompt } from '../../services/api';
import './prompt-editor.css';

export default function PromptEditor() {
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
    } catch { console.warn('无法加载提示词文件'); }
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
      setHasChanges(false);
    } catch { console.error('保存失败'); }
    finally { setIsSaving(false); }
  }, [activeFile, content]);

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return;
    try {
      const file = await createPromptFile(newName.trim(), '# 系统提示词\n\n在这里编写你的系统提示词...');
      setFiles((prev) => [...prev, file]);
      setActiveFile(file.filename);
      setContent(file.content);
      setNewName('');
      setIsCreating(false);
    } catch { console.error('创建失败'); }
  }, [newName]);

  const handleDelete = useCallback(async (filename: string) => {
    if (!confirm('确定删除该提示词文件？')) return;
    try {
      await deletePromptFile(filename);
      setFiles((prev) => prev.filter((f) => f.filename !== filename));
      if (activeFile === filename) {
        const remaining = files.filter((f) => f.filename !== filename);
        if (remaining.length > 0) handleSelectFile(remaining[0].filename);
        else { setActiveFile(null); setContent(''); }
      }
    } catch { console.error('删除失败'); }
  }, [activeFile, files, handleSelectFile]);

  const handleSetActive = useCallback(async () => {
    if (!activeFile) return;
    try {
      await setActivePrompt(activeFile);
      alert(`已将 "${currentFile?.name}" 设为当前使用的提示词`);
    } catch { console.error('设置失败'); }
  }, [activeFile, currentFile]);

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
          <span className="pe-sidebar-title">提示词文件</span>
          {isCreating ? (
            <div className="pe-create-form">
              <input value={newName} onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()} placeholder="文件名..." autoFocus />
              <button onClick={handleCreate}>✓</button>
              <button onClick={() => setIsCreating(false)}>✕</button>
            </div>
          ) : (
            <button className="pe-add-btn" onClick={() => setIsCreating(true)}>+</button>
          )}
        </div>
        <div className="pe-file-list">
          {files.map((file) => (
            <div key={file.filename}
              className={`pe-file-item ${activeFile === file.filename ? 'active' : ''}`}
              onClick={() => handleSelectFile(file.filename)}>
              <span className="pe-file-icon">📝</span>
              <span className="pe-file-name">{file.name}</span>
              {file.isDefault && <span className="pe-file-badge">默认</span>}
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
              {hasChanges && <span className="pe-unsaved">● 未保存</span>}
              <div className="pe-toolbar-actions">
                <button className="btn btn-ghost" onClick={handleSetActive}>设为当前</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
            <textarea className="pe-textarea" value={content} onChange={(e) => handleContentChange(e.target.value)}
              placeholder="在此编写系统提示词 (Markdown 格式)..." spellCheck={false} />
          </>
        ) : (
          <div className="pe-empty">选择或创建一个提示词文件</div>
        )}
      </div>
    </div>
  );
}
