/**
 * 关于页面
 * 项目介绍、技术栈和仓库链接
 */
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './about-page.css';

const TECH_STACK = [
  { name: 'React 18', desc: 'UI 框架', icon: '⚛️' },
  { name: 'TypeScript', desc: '类型安全', icon: '🔷' },
  { name: 'Vite', desc: '构建工具', icon: '⚡' },
  { name: 'Zustand', desc: '状态管理', icon: '🐻' },
  { name: 'FastAPI', desc: '后端框架', icon: '🐍' },
  { name: 'Framer Motion', desc: '动画引擎', icon: '🎞️' },
];

const FEATURES = [
  { name: '智能叙事', desc: 'AI 实时生成无限分支剧情', icon: '✨' },
  { name: '角色系统', desc: '多角色立绘与场景切换', icon: '🎭' },
  { name: '世界书', desc: '可自定义的世界观知识注入', icon: '📖' },
  { name: '时间线回溯', desc: '穿越回任意剧情节点', icon: '⏪' },
  { name: 'TTS 语音', desc: 'MiniMax TTS 角色语音合成', icon: '🔊' },
  { name: '调试模式', desc: '实时查看/修改 AI 通信数据', icon: '🐛' },
];

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      {/* 背景粒子 */}
      <div className="about-particles">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="about-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${6 + Math.random() * 8}s`,
            }}
          />
        ))}
      </div>

      <motion.div
        className="about-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* 返回按钮 */}
        <motion.button
          className="about-back-btn"
          onClick={() => navigate(-1)}
          whileHover={{ x: -3 }}
        >
          ← 返回
        </motion.button>

        {/* 标题区 */}
        <header className="about-header">
          <motion.h1
            className="about-title"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <span className="about-title-ai">AI</span>
            <span className="about-title-gal">gal</span>
          </motion.h1>
          <p className="about-subtitle">AI 驱动的视觉小说引擎</p>
          <p className="about-version">v1.01</p>
        </header>

        {/* 介绍 */}
        <section className="about-section">
          <p className="about-desc">
            AIgal 是一个由大语言模型（LLM）驱动的现代化 Galgame 引擎。
            玩家通过自然语言与 AI 互动，AI 实时生成剧情、对话、场景和角色表演，
            创造无限分支的沉浸式叙事体验。
          </p>
        </section>

        {/* 特性 */}
        <section className="about-section">
          <h2 className="about-section-title">核心特性</h2>
          <div className="about-grid">
            {FEATURES.map((feat, idx) => (
              <motion.div
                key={feat.name}
                className="about-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.06 }}
              >
                <span className="about-card-icon">{feat.icon}</span>
                <h3 className="about-card-title">{feat.name}</h3>
                <p className="about-card-desc">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 技术栈 */}
        <section className="about-section">
          <h2 className="about-section-title">技术栈</h2>
          <div className="about-tech-list">
            {TECH_STACK.map((tech, idx) => (
              <motion.div
                key={tech.name}
                className="about-tech-item"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.05 }}
              >
                <span className="about-tech-icon">{tech.icon}</span>
                <span className="about-tech-name">{tech.name}</span>
                <span className="about-tech-desc">{tech.desc}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* GitHub 仓库 */}
        <section className="about-section about-repo">
          <h2 className="about-section-title">开源仓库</h2>
          <a
            className="about-repo-link"
            href="https://github.com/kttzzc/aigal2"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="about-repo-icon">⭐</span>
            <span className="about-repo-text">
              <span className="about-repo-name">kttzzc/aigal2</span>
              <span className="about-repo-url">github.com/kttzzc/aigal2</span>
            </span>
            <span className="about-repo-arrow">→</span>
          </a>
        </section>

        {/* 底部 */}
        <footer className="about-footer">
          <p>AIgal Engine — 让 AI 成为你的故事讲述者 ✨</p>
        </footer>
      </motion.div>
    </div>
  );
}
