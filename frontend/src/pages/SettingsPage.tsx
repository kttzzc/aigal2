/**
 * 独立设置页面
 * 整合 AI 配置、世界书、提示词、素材管理、UI 编辑、变量面板等所有高级功能
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SettingsPanel from '../features/settings/SettingsPanel';
import WorldBookPanel from '../features/world-book/WorldBookPanel';
import PromptEditor from '../features/prompt-editor/PromptEditor';
import AssetManager from '../features/asset-manager/AssetManager';
import UIEditor from '../features/ui-editor/UIEditor';
import VariablePanel from '../components/variable-panel/VariablePanel';
import './settings-page.css';

import { useTranslation } from 'react-i18next';

type TabId = 'general' | 'worldBook' | 'promptEditor' | 'assetManager' | 'uiEditor' | 'variables';

interface TabItem {
  id: TabId;
  labelKey: string;
  icon: string;
}

const TABS: TabItem[] = [
  { id: 'general', labelKey: 'settings.tab_general', icon: '⚙️' },
  { id: 'worldBook', labelKey: 'settings.tab_world_book', icon: '📖' },
  { id: 'promptEditor', labelKey: 'settings.tab_prompt_editor', icon: '📝' },
  { id: 'assetManager', labelKey: 'settings.tab_asset_manager', icon: '🎨' },
  { id: 'uiEditor', labelKey: 'settings.tab_ui_editor', icon: '🖌️' },
  { id: 'variables', labelKey: 'settings.tab_variables', icon: '📊' },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabId>('general');

  const renderContent = () => {
    switch (activeTab) {
      case 'general': return <SettingsPanel />;
      case 'worldBook': return <WorldBookPanel />;
      case 'promptEditor': return <PromptEditor />;
      case 'assetManager': return <AssetManager />;
      case 'uiEditor': return <UIEditor />;
      case 'variables': return <VariablePanel />;
    }
  };

  return (
    <div className="settings-page">
      {/* 侧边栏 */}
      <nav className="sp-sidebar">
        <div className="sp-sidebar-header">
          <button className="sp-back-btn" onClick={() => navigate(-1)}>
            {t('settings.btn_back')}
          </button>
          <h2 className="sp-sidebar-title">System</h2>
        </div>

        <div className="sp-tabs">
          {TABS.map((tab) => (
            <motion.button
              key={tab.id}
              className={`sp-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="sp-tab-icon">{tab.icon}</span>
              <span className="sp-tab-label">{t(tab.labelKey)}</span>
            </motion.button>
          ))}
        </div>

        <div className="sp-sidebar-footer">
          <span className="sp-version">AIgal v1.0.1</span>
        </div>
      </nav>

      {/* 内容区 */}
      <main className="sp-content">
        <div className="sp-content-header">
          <h2>{TABS.find((t) => t.id === activeTab)?.icon} {t(TABS.find((tab) => tab.id === activeTab)?.labelKey || '')}</h2>
        </div>
        <div className="sp-content-body">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
