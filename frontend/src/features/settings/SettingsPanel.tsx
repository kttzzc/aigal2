/**
 * 设置面板（通用设置标签页内容）
 * AI 配置、上下文上限、文字速度、动画开关、实验性 UI 等
 */
import { useState, useEffect, useCallback } from 'react';
import type { AppSettings } from '../../types';
import { getSettings, updateSettings } from '../../services/api';
import './settings-panel.css';

interface SettingsPanelProps {
  onSettingsChange?: (settings: AppSettings) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  ai: {
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4',
  },
  contextLimit: 0,
  textSpeed: 50,
  autoPlayInterval: 3000,
  enableMenuAnimation: true,
  experimentalUI: false,
  tts: {
    apiKey: '',
    baseUrl: 'https://api.minimaxi.com',
    model: 'speech-2.8-hd',
    voiceId: 'male-qn-qingse',
    speed: 1.0,
    autoRead: false,
  },
};

export default function SettingsPanel({ onSettingsChange }: SettingsPanelProps) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getSettings();
      setSettings(data);
    } catch {
      // NOTE: 后端未启动时使用默认值
      console.warn('无法加载设置，使用默认值');
    }
  };

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const updated = await updateSettings(settings);
      setSettings(updated);
      onSettingsChange?.(updated);
      setMessage('设置已保存');
      setTimeout(() => setMessage(''), 2000);
    } catch {
      setMessage('保存失败');
    } finally {
      setIsSaving(false);
    }
  }, [settings, onSettingsChange]);

  const updateField = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="settings-panel">
      {/* AI 配置 */}
      <section className="settings-section">
        <h3 className="settings-section-title">🤖 AI 配置</h3>

        <div className="settings-guide-box">
          <p className="settings-guide-title">📋 如何获取 API Key？</p>
          <ol className="settings-guide-steps">
            <li>
              前往你使用的 AI 服务商平台注册账号，常见平台：
              <ul>
                <li><strong>OpenAI</strong>：<a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">platform.openai.com/api-keys</a></li>
                <li><strong>DeepSeek</strong>：<a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener noreferrer">platform.deepseek.com/api_keys</a></li>
                <li><strong>其他兼容 OpenAI 格式的服务商</strong>（如硅基流动、零一万物等）也可使用</li>
              </ul>
            </li>
            <li>在平台的 <strong>API Keys</strong> 页面创建一个新的密钥，复制粘贴到下方</li>
            <li>将 <strong>Base URL</strong> 设置为对应平台的 API 地址（见下方说明）</li>
            <li>填写你想使用的 <strong>模型名称</strong>（如 gpt-4o、deepseek-chat 等）</li>
          </ol>
        </div>

        <div className="settings-field">
          <label className="settings-label">API Key</label>
          <input
            type="password"
            className="settings-input"
            value={settings.ai.apiKey}
            onChange={(e) =>
              updateField('ai', { ...settings.ai, apiKey: e.target.value })
            }
            placeholder="sk-..."
          />
          <p className="settings-field-hint">你的 API 密钥，请妥善保管，不要泄露给他人</p>
        </div>

        <div className="settings-field">
          <label className="settings-label">Base URL</label>
          <input
            type="text"
            className="settings-input"
            value={settings.ai.baseUrl}
            onChange={(e) =>
              updateField('ai', { ...settings.ai, baseUrl: e.target.value })
            }
            placeholder="https://api.openai.com/v1"
          />
          <p className="settings-field-hint">
            不同服务商的 Base URL 不同，常见值：<br />
            • OpenAI：<code>https://api.openai.com/v1</code><br />
            • DeepSeek：<code>https://api.deepseek.com</code><br />
            • 硅基流动：<code>https://api.siliconflow.cn/v1</code><br />
            • 自定义中转 / 本地部署：填入你自己的地址
          </p>
        </div>

        <div className="settings-field">
          <label className="settings-label">模型</label>
          <input
            type="text"
            className="settings-input"
            value={settings.ai.model}
            onChange={(e) =>
              updateField('ai', { ...settings.ai, model: e.target.value })
            }
            placeholder="gpt-4"
          />
          <p className="settings-field-hint">
            填写模型的完整名称，如 gpt-4o、gpt-4o-mini、deepseek-chat、qwen-turbo 等。
            需要与你的 API Key 和 Base URL 对应的服务商一致。
          </p>
        </div>
      </section>

      {/* 上下文设置 */}
      <section className="settings-section">
        <h3 className="settings-section-title">💬 上下文设置</h3>

        <div className="settings-field">
          <label className="settings-label">
            上下文上限
            <span className="settings-hint">
              {settings.contextLimit === 0
                ? '（无限制 — 发送全部历史）'
                : `（最多 ${settings.contextLimit} 轮对话）`}
            </span>
          </label>
          <div className="settings-range-group">
            <input
              type="range"
              className="settings-range"
              min="0"
              max="100"
              value={settings.contextLimit}
              onChange={(e) =>
                updateField('contextLimit', parseInt(e.target.value))
              }
            />
            <input
              type="number"
              className="settings-number"
              min="0"
              value={settings.contextLimit}
              onChange={(e) =>
                updateField('contextLimit', parseInt(e.target.value) || 0)
              }
            />
          </div>
        </div>
      </section>

      {/* 显示设置 */}
      <section className="settings-section">
        <h3 className="settings-section-title">🎮 显示设置</h3>

        <div className="settings-field">
          <label className="settings-label">
            文字速度
            <span className="settings-hint">（{settings.textSpeed}ms/字）</span>
          </label>
          <input
            type="range"
            className="settings-range"
            min="10"
            max="200"
            step="10"
            value={settings.textSpeed}
            onChange={(e) =>
              updateField('textSpeed', parseInt(e.target.value))
            }
          />
        </div>

        <div className="settings-field">
          <label className="settings-label">
            自动播放间隔
            <span className="settings-hint">
              （{(settings.autoPlayInterval / 1000).toFixed(1)}秒）
            </span>
          </label>
          <input
            type="range"
            className="settings-range"
            min="1000"
            max="10000"
            step="500"
            value={settings.autoPlayInterval}
            onChange={(e) =>
              updateField('autoPlayInterval', parseInt(e.target.value))
            }
          />
        </div>

        {/* 菜单动画开关 */}
        <div className="settings-field">
          <div className="settings-toggle-row">
            <label className="settings-label">菜单打开动画</label>
            <button
              type="button"
              className={`settings-toggle-btn ${settings.enableMenuAnimation ? 'on' : 'off'}`}
              onClick={() => updateField('enableMenuAnimation', !settings.enableMenuAnimation)}
            >
              {settings.enableMenuAnimation ? '开启' : '关闭'}
            </button>
          </div>
          <p className="settings-field-hint">控制模态面板打开/关闭时的过渡动画效果</p>
        </div>
      </section>

      {/* 实验性功能 */}
      <section className="settings-section">
        <h3 className="settings-section-title">🧪 实验性功能</h3>

        <div className="settings-field">
          <div className="settings-toggle-row">
            <label className="settings-label">实验性 UI 布局</label>
            <button
              type="button"
              className={`settings-toggle-btn ${settings.experimentalUI ? 'on' : 'off'}`}
              onClick={() => updateField('experimentalUI', !settings.experimentalUI)}
            >
              {settings.experimentalUI ? '开启' : '关闭'}
            </button>
          </div>
          <p className="settings-field-hint">
            启用后，菜单功能项将显示在对话框下方（Save / Load / System / Title），
            世界书、提示词等高级功能转移至独立的 System 页面。需要保存后刷新页面生效。
          </p>
        </div>
      </section>

      {/* TTS 语音合成 */}
      <section className="settings-section">
        <h3 className="settings-section-title">🔊 TTS 语音合成（MiniMax）</h3>

        <div className="settings-field">
          <label className="settings-label">TTS API Key</label>
          <input
            type="password"
            className="settings-input"
            value={settings.tts?.apiKey || ''}
            onChange={(e) =>
              updateField('tts', { ...settings.tts!, apiKey: e.target.value })
            }
            placeholder="输入 MiniMax API Key..."
          />
        </div>

        <div className="settings-field">
          <label className="settings-label">TTS Base URL</label>
          <input
            type="text"
            className="settings-input"
            value={settings.tts?.baseUrl || 'https://api.minimaxi.com'}
            onChange={(e) =>
              updateField('tts', { ...settings.tts!, baseUrl: e.target.value })
            }
            placeholder="https://api.minimaxi.com"
          />
        </div>

        <div className="settings-field">
          <label className="settings-label">TTS 模型</label>
          <select
            className="settings-input"
            value={settings.tts?.model || 'speech-2.8-hd'}
            onChange={(e) =>
              updateField('tts', { ...settings.tts!, model: e.target.value })
            }
          >
            <option value="speech-2.8-hd">speech-2.8-hd（高清）</option>
            <option value="speech-2.8-turbo">speech-2.8-turbo（快速）</option>
            <option value="speech-2.6-hd">speech-2.6-hd</option>
            <option value="speech-2.6-turbo">speech-2.6-turbo</option>
          </select>
        </div>

        <div className="settings-field">
          <label className="settings-label">音色 ID</label>
          <input
            type="text"
            className="settings-input"
            value={settings.tts?.voiceId || 'male-qn-qingse'}
            onChange={(e) =>
              updateField('tts', { ...settings.tts!, voiceId: e.target.value })
            }
            placeholder="male-qn-qingse"
          />
          <p className="settings-field-hint">可在 MiniMax 平台查看支持的音色列表</p>
        </div>

        <div className="settings-field">
          <label className="settings-label">
            语速
            <span className="settings-hint">（{settings.tts?.speed || 1.0}x）</span>
          </label>
          <input
            type="range"
            className="settings-range"
            min="0.5"
            max="2"
            step="0.1"
            value={settings.tts?.speed || 1.0}
            onChange={(e) =>
              updateField('tts', { ...settings.tts!, speed: parseFloat(e.target.value) })
            }
          />
        </div>

        <div className="settings-field">
          <div className="settings-toggle-row">
            <label className="settings-label">自动朗读</label>
            <button
              type="button"
              className={`settings-toggle-btn ${settings.tts?.autoRead ? 'on' : 'off'}`}
              onClick={() =>
                updateField('tts', { ...settings.tts!, autoRead: !settings.tts?.autoRead })
              }
            >
              {settings.tts?.autoRead ? '开启' : '关闭'}
            </button>
          </div>
          <p className="settings-field-hint">
            开启后，每条消息打字完成后会自动调用 TTS 朗读。无论是否开启自动朗读，对话框均显示手动播放按钮。
          </p>
        </div>
      </section>

      {/* 保存按钮 */}
      <div className="settings-actions">
        {message && (
          <span className="settings-message">{message}</span>
        )}
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? '保存中...' : '保存设置'}
        </button>
      </div>
    </div>
  );
}
