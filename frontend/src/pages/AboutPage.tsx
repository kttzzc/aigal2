/**
 * 关于页面
 * 项目介绍、技术栈和仓库链接
 */
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './about-page.css';

export default function AboutPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const TECH_STACK = [
    { name: 'React 18', desc: t('about.tech_1_desc'), icon: '⚛️' },
    { name: 'TypeScript', desc: t('about.tech_2_desc'), icon: '🔷' },
    { name: 'Vite', desc: t('about.tech_3_desc'), icon: '⚡' },
    { name: 'Zustand', desc: t('about.tech_4_desc'), icon: '🐻' },
    { name: 'FastAPI', desc: t('about.tech_5_desc'), icon: '🐍' },
    { name: 'Framer Motion', desc: t('about.tech_6_desc'), icon: '🎞️' },
  ];

  const FEATURES = [
    { name: t('about.feature_1_name'), desc: t('about.feature_1_desc'), icon: '✨' },
    { name: t('about.feature_2_name'), desc: t('about.feature_2_desc'), icon: '🎭' },
    { name: t('about.feature_3_name'), desc: t('about.feature_3_desc'), icon: '📖' },
    { name: t('about.feature_4_name'), desc: t('about.feature_4_desc'), icon: '⏪' },
    { name: t('about.feature_5_name'), desc: t('about.feature_5_desc'), icon: '🔊' },
    { name: t('about.feature_6_name'), desc: t('about.feature_6_desc'), icon: '🐛' },
  ];

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
          {t('about.btn_back')}
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
          <p className="about-subtitle">{t('about.title_sub')}</p>
          <p className="about-version">v1.01</p>
        </header>

        {/* 介绍 */}
        <section className="about-section">
          <p className="about-desc">
            {t('about.desc')}
          </p>
        </section>

        {/* 特性 */}
        <section className="about-section">
          <h2 className="about-section-title">{t('about.features_title')}</h2>
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
          <h2 className="about-section-title">{t('about.tech_stack')}</h2>
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
          <h2 className="about-section-title">{t('about.repo')}</h2>
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
          <p>{t('about.footer')}</p>
        </footer>
      </motion.div>
    </div>
  );
}
