/**
 * 自定义 UI 编辑器
 * 三栏代码编辑器（HTML/CSS/JS），通过 iframe 沙箱实时预览
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './ui-editor.css';

interface UIEditorProps {
  initialHtml?: string;
  initialCss?: string;
  initialJs?: string;
  onSave?: (html: string, css: string, js: string) => void;
}

const DEFAULT_HTML = `<div class="game-container">
  <div id="dialogue-box">
    <div id="speaker-name"></div>
    <div id="dialogue-text"></div>
  </div>
</div>`;

const DEFAULT_CSS = `.game-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

#dialogue-box {
  background: rgba(0, 0, 0, 0.75);
  padding: 20px 30px;
  margin: 20px;
  border-radius: 12px;
  border: 1px solid rgba(124, 92, 191, 0.3);
}

#speaker-name {
  color: #f0c674;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}

#dialogue-text {
  color: #e8e6f0;
  font-size: 16px;
  line-height: 1.8;
}`;

const DEFAULT_JS = `// Listen to game data from main app
window.addEventListener('message', (event) => {
  const data = event.data;
  if (data.type === 'GAME_DATA') {
    const { currentMessage } = data.payload;
    if (currentMessage) {
      document.getElementById('speaker-name').textContent = currentMessage.name;
      document.getElementById('dialogue-text').textContent = currentMessage.message;
    }
  }
});`;

export default function UIEditor({
  initialHtml = DEFAULT_HTML,
  initialCss = DEFAULT_CSS,
  initialJs = DEFAULT_JS,
  onSave,
}: UIEditorProps) {
  const { t } = useTranslation();
  const [html, setHtml] = useState(initialHtml);
  const [css, setCss] = useState(initialCss);
  const [js, setJs] = useState(initialJs);
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 实时更新 iframe 预览
  const updatePreview = useCallback(() => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    const content = `<!DOCTYPE html>
<html><head><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Noto Sans SC', sans-serif; width: 100%; height: 100vh; overflow: hidden; }
  ${css}
</style></head><body>
  ${html}
  <script>${js}<\/script>
</body></html>`;

    doc.open();
    doc.write(content);
    doc.close();
  }, [html, css, js]);

  useEffect(() => {
    const timer = setTimeout(updatePreview, 300);
    return () => clearTimeout(timer);
  }, [updatePreview]);

  const handleSave = () => onSave?.(html, css, js);

  const getActiveCode = () => {
    switch (activeTab) {
      case 'html': return html;
      case 'css': return css;
      case 'js': return js;
    }
  };

  const setActiveCode = (value: string) => {
    switch (activeTab) {
      case 'html': setHtml(value); break;
      case 'css': setCss(value); break;
      case 'js': setJs(value); break;
    }
  };

  return (
    <div className="ui-editor">
      <div className="ue-editor-section">
        <div className="ue-tabs">
          {(['html', 'css', 'js'] as const).map((tab) => (
            <button key={tab} className={`ue-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}>
              {tab.toUpperCase()}
            </button>
          ))}
          <button className="btn btn-primary ue-save-btn" onClick={handleSave}>
            {t('ui_editor.btn_save')}
          </button>
        </div>
        <textarea className="ue-code-area" value={getActiveCode()}
          onChange={(e) => setActiveCode(e.target.value)}
          spellCheck={false} placeholder={t('ui_editor.placeholder', { type: activeTab.toUpperCase() })} />
      </div>
      <div className="ue-preview-section">
        <div className="ue-preview-header">{t('ui_editor.preview')}</div>
        <iframe ref={iframeRef} className="ue-preview-frame" sandbox="allow-scripts" title={t('ui_editor.preview')} />
      </div>
    </div>
  );
}
