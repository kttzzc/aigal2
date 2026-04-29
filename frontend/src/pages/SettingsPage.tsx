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

type TabId = 'general' | 'worldBook' | 'promptEditor' | 'assetManager' | 'uiEditor' | 'variables';

interface TabItem {
  id: TabId;
  label: string;
  icon: string;
}

const TABS: TabItem[] = [
  { id: 'general', label: '通用设置', icon: '⚙️' },
  { id: 'worldBook', label: '世界书', icon: '📖' },
  { id: 'promptEditor', label: '系统提示词', icon: '📝' },
  { id: 'assetManager', label: '素材管理', icon: '🎨' },
  { id: 'uiEditor', label: 'UI 编辑器', icon: '🖌️' },
  { id: 'variables', label: '全局变量', icon: '📊' },
];

export default function SettingsPage() {
  const navigate = useNavigate();
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
            ← 返回
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
              <span className="sp-tab-label">{tab.label}</span>
            </motion.button>
          ))}
        </div>

        <div className="sp-sidebar-footer">
          <span className="sp-version">AIgal Engine v1.0.1</span>
        </div>
      </nav>

      {/* 内容区 */}
      <main className="sp-content">
        <div className="sp-content-header">
          <h2>{TABS.find((t) => t.id === activeTab)?.icon} {TABS.find((t) => t.id === activeTab)?.label}</h2>
        </div>
        <div className="sp-content-body">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
