/**
 * 设置面板（通用设置标签页内容）
 * AI 配置、上下文上限、文字速度、动画开关、实验性 UI 等
 */
import { useState, useEffect, useCallback } from 'react';
import { useTranslation, Trans } from 'react-i18next';
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
  const { t, i18n } = useTranslation();
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
      setMessage(t('settings.msg_saved'));
      setTimeout(() => setMessage(''), 2000);
    } catch {
      setMessage(t('settings.msg_save_failed'));
    } finally {
      setIsSaving(false);
    }
  }, [settings, onSettingsChange, t]);

  const updateField = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="settings-panel">
      {/* 语言设置 */}
      <section className="settings-section">
        <div className="settings-field">
          <label className="settings-label">{t('settings.general.language')}</label>
          <select
            className="settings-input"
            value={i18n.language.startsWith('en') ? 'en' : 'zh'}
            onChange={handleLanguageChange}
          >
            <option value="zh">简体中文 (Chinese)</option>
            <option value="en">English</option>
          </select>
        </div>
      </section>

      {/* AI 配置 */}
      <section className="settings-section">
        <h3 className="settings-section-title">{t('settings.ai_config.title')}</h3>

        <div className="settings-guide-box">
          <p className="settings-guide-title">{t('settings.ai_config.guide_title')}</p>
          <ol className="settings-guide-steps">
            <li>
              {t('settings.ai_config.guide_step_1')}
              <ul>
                <li><strong>OpenAI</strong>: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">platform.openai.com/api-keys</a></li>
                <li><strong>DeepSeek</strong>: <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener noreferrer">platform.deepseek.com/api_keys</a></li>
                <li><strong>{t('settings.ai_config.guide_step_1_sub_1')}</strong></li>
              </ul>
            </li>
            <li>{t('settings.ai_config.guide_step_2')}</li>
            <li>{t('settings.ai_config.guide_step_3')}</li>
            <li>{t('settings.ai_config.guide_step_4')}</li>
          </ol>
        </div>

        <div className="settings-field">
          <label className="settings-label">{t('settings.ai_config.api_key')}</label>
          <input
            type="password"
            className="settings-input"
            value={settings.ai.apiKey}
            onChange={(e) =>
              updateField('ai', { ...settings.ai, apiKey: e.target.value })
            }
            placeholder="sk-..."
          />
          <p className="settings-field-hint">{t('settings.ai_config.api_key_hint')}</p>
        </div>

        <div className="settings-field">
          <label className="settings-label">{t('settings.ai_config.base_url')}</label>
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
            <Trans
              i18nKey="settings.ai_config.base_url_hint"
              components={{ br: <br />, code: <code /> }}
            />
          </p>
        </div>

        <div className="settings-field">
          <label className="settings-label">{t('settings.ai_config.model')}</label>
          <input
            type="text"
            className="settings-input"
            value={settings.ai.model}
            onChange={(e) =>
              updateField('ai', { ...settings.ai, model: e.target.value })
            }
            placeholder="gpt-4"
          />
          <p className="settings-field-hint">{t('settings.ai_config.model_hint')}</p>
        </div>
      </section>

      {/* 上下文设置 */}
      <section className="settings-section">
        <h3 className="settings-section-title">{t('settings.ai_config.context')}</h3>

        <div className="settings-field">
          <label className="settings-label">
            {t('settings.ai_config.context_limit')}
            <span className="settings-hint">
              {settings.contextLimit === 0
                ? t('settings.ai_config.context_limit_none')
                : t('settings.ai_config.context_limit_val', { limit: settings.contextLimit })}
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
        <h3 className="settings-section-title">{t('settings.general.ui_display')}</h3>

        <div className="settings-field">
          <label className="settings-label">
            {t('settings.general.text_speed')}
            <span className="settings-hint">（{settings.textSpeed}）</span>
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
            {t('settings.general.auto_delay')}
            <span className="settings-hint">
              （{(settings.autoPlayInterval / 1000).toFixed(1)}）
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
            <label className="settings-label">{t('settings.general.menu_animation')}</label>
            <button
              type="button"
              className={`settings-toggle-btn ${settings.enableMenuAnimation ? 'on' : 'off'}`}
              onClick={() => updateField('enableMenuAnimation', !settings.enableMenuAnimation)}
            >
              {settings.enableMenuAnimation ? t('settings.general.menu_animation_on') : t('settings.general.menu_animation_off')}
            </button>
          </div>
        </div>
      </section>

      {/* 实验性功能 */}
      <section className="settings-section">
        <h3 className="settings-section-title">🧪 Experimental Features</h3>

        <div className="settings-field">
          <div className="settings-toggle-row">
            <label className="settings-label">{t('settings.general.experimental_ui')}</label>
            <button
              type="button"
              className={`settings-toggle-btn ${settings.experimentalUI ? 'on' : 'off'}`}
              onClick={() => updateField('experimentalUI', !settings.experimentalUI)}
            >
              {settings.experimentalUI ? t('settings.general.experimental_ui_on') : t('settings.general.experimental_ui_off')}
            </button>
          </div>
        </div>
      </section>

      {/* TTS 语音合成 */}
      <section className="settings-section">
        <h3 className="settings-section-title">{t('settings.general.tts')} (MiniMax)</h3>

        <div className="settings-field">
          <label className="settings-label">TTS API Key</label>
          <input
            type="password"
            className="settings-input"
            value={settings.tts?.apiKey || ''}
            onChange={(e) =>
              updateField('tts', { ...settings.tts!, apiKey: e.target.value })
            }
            placeholder="API Key..."
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
          <label className="settings-label">TTS Model</label>
          <select
            className="settings-input"
            value={settings.tts?.model || 'speech-2.8-hd'}
            onChange={(e) =>
              updateField('tts', { ...settings.tts!, model: e.target.value })
            }
          >
            <option value="speech-2.8-hd">speech-2.8-hd</option>
            <option value="speech-2.8-turbo">speech-2.8-turbo</option>
            <option value="speech-2.6-hd">speech-2.6-hd</option>
            <option value="speech-2.6-turbo">speech-2.6-turbo</option>
          </select>
        </div>

        <div className="settings-field">
          <label className="settings-label">{t('settings.general.voice_id')}</label>
          <input
            type="text"
            className="settings-input"
            value={settings.tts?.voiceId || 'male-qn-qingse'}
            onChange={(e) =>
              updateField('tts', { ...settings.tts!, voiceId: e.target.value })
            }
            placeholder="male-qn-qingse"
          />
        </div>

        <div className="settings-field">
          <label className="settings-label">
            {t('settings.general.speed')}
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
            <label className="settings-label">{t('settings.general.tts_auto_read')}</label>
            <button
              type="button"
              className={`settings-toggle-btn ${settings.tts?.autoRead ? 'on' : 'off'}`}
              onClick={() =>
                updateField('tts', { ...settings.tts!, autoRead: !settings.tts?.autoRead })
              }
            >
              {settings.tts?.autoRead ? t('settings.general.tts_auto_read_on') : t('settings.general.tts_auto_read_off')}
            </button>
          </div>
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
          {isSaving ? t('settings.msg_saving') : t('settings.btn_save')}
        </button>
      </div>
    </div>
  );
}
