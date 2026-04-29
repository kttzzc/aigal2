/**
 * 调试面板组件
 * 提供全局的 AI 会话调试能力：
 * 1. 查看所有的历史会话原始请求与响应
 * 2. 直接编辑当前会话（最后一条）的 JSON 响应，并热重载
 */
import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/game-store';
import { motion, AnimatePresence } from 'framer-motion';
import './debug-panel.css';

type Tab = 'history' | 'current' | 'llm';

export default function DebugPanel() {
  const { conversationHistory, updateCurrentResponse } = useGameStore();
  const [activeTab, setActiveTab] = useState<Tab>('current');
  const [currentJsonText, setCurrentJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 初始化或切换到 current 时，加载最后一次会话的数据
  useEffect(() => {
    if (activeTab === 'current' && conversationHistory.length > 0) {
      const lastEntry = conversationHistory[conversationHistory.length - 1];
      const rawRes = lastEntry.rawResponse || {
        messages: lastEntry.aiMessages,
        variables: lastEntry.variableChanges,
        time: lastEntry.time,
      };
      setCurrentJsonText(JSON.stringify(rawRes, null, 2));
      setJsonError(null);
    }
  }, [activeTab, conversationHistory]);

  const handleSaveJson = () => {
    setJsonError(null);
    setIsSaving(true);
    try {
      const parsed = JSON.parse(currentJsonText);
      updateCurrentResponse(parsed);
      setTimeout(() => setIsSaving(false), 300); // 制造一点视觉反馈
    } catch (e: any) {
      setJsonError(`JSON 解析失败: ${e.message}`);
      setIsSaving(false);
    }
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="debug-panel">
      {/* 顶部标签页 */}
      <div className="dp-tabs">
        <button
          className={`dp-tab ${activeTab === 'current' ? 'active' : ''}`}
          onClick={() => setActiveTab('current')}
        >
          当前对话 JSON 修改
        </button>
        <button
          className={`dp-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          历史会话原数据
        </button>
        <button
          className={`dp-tab ${activeTab === 'llm' ? 'active' : ''}`}
          onClick={() => setActiveTab('llm')}
        >
          LLM 原始请求
        </button>
      </div>

      <div className="dp-content">
        {/* 当前 JSON 修改视图 */}
        {activeTab === 'current' && (
          <div className="dp-current-view">
            {conversationHistory.length === 0 ? (
              <div className="dp-empty">当前没有对话记录</div>
            ) : (
              <>
                <p className="dp-hint">在这里可以直接修改本轮对话的原始响应。点击保存后，游戏界面将立刻同步。</p>
                <textarea
                  className="dp-textarea"
                  value={currentJsonText}
                  onChange={(e) => setCurrentJsonText(e.target.value)}
                  spellCheck={false}
                />
                {jsonError && <div className="dp-error">{jsonError}</div>}
                <div className="dp-actions">
                  <button
                    className="btn btn-primary"
                    onClick={handleSaveJson}
                    disabled={isSaving}
                  >
                    {isSaving ? '保存中...' : '💾 保存修改'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* 历史视图 */}
        {activeTab === 'history' && (
          <div className="dp-history-view">
            {conversationHistory.length === 0 ? (
              <div className="dp-empty">暂无历史记录</div>
            ) : (
              <div className="dp-history-list">
                {conversationHistory.map((entry, idx) => (
                  <div key={idx} className="dp-history-item">
                    <div className="dp-history-header" onClick={() => toggleExpand(idx)}>
                      <span className="dp-history-turn">Turn {idx + 1}</span>
                      <span className="dp-history-preview">
                        {entry.playerInput.substring(0, 20) || '（无输入）'} ...
                      </span>
                      <span className="dp-history-toggle">
                        {expandedIndex === idx ? '▼' : '▶'}
                      </span>
                    </div>

                    <AnimatePresence>
                      {expandedIndex === idx && (
                        <motion.div
                          className="dp-history-body"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          <div className="dp-code-block">
                            <div className="dp-code-title">↗️ Request 发送体</div>
                            <pre>
                              {entry.rawRequest
                                ? JSON.stringify(entry.rawRequest, null, 2)
                                : '（无原始请求数据）'}
                            </pre>
                          </div>
                          <div className="dp-code-block">
                            <div className="dp-code-title">↙️ Response 响应体</div>
                            <pre>
                              {entry.rawResponse
                                ? JSON.stringify(entry.rawResponse, null, 2)
                                : '（无原始响应数据）'}
                            </pre>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LLM 原始请求查看 */}
        {activeTab === 'llm' && (
          <div className="dp-history-view">
            {conversationHistory.length === 0 ? (
              <div className="dp-empty">暂无 LLM 请求记录</div>
            ) : (
              <div className="dp-history-list">
                {conversationHistory.map((entry, idx) => {
                  const llmReq = entry.rawResponse?._debug_llm_request;
                  return (
                    <div key={idx} className="dp-history-item">
                      <div className="dp-history-header" onClick={() => toggleExpand(idx)}>
                        <span className="dp-history-turn">Turn {idx + 1}</span>
                        <span className="dp-history-preview">
                          {llmReq ? `→ ${llmReq.model} @ ${llmReq.base_url}` : '(无调试数据)'}
                        </span>
                        <span className="dp-history-toggle">
                          {expandedIndex === idx ? '▼' : '▶'}
                        </span>
                      </div>

                      <AnimatePresence>
                        {expandedIndex === idx && (
                          <motion.div
                            className="dp-history-body"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                          >
                            <div className="dp-code-block">
                              <div className="dp-code-title">📡 发往 LLM 的请求体（已脱敏）</div>
                              <pre>
                                {llmReq
                                  ? JSON.stringify(llmReq, null, 2)
                                  : '(无调试数据，可能是早期会话)'}
                              </pre>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
