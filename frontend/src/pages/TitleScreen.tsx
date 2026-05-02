/**
 * 标题画面
 * 游戏入口页面，提供开始新游戏和继续游戏的选项
 */
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../store/game-store';
import './title-screen.css';

export default function TitleScreen() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isGameStarted, resetGame } = useGameStore();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleNewGame = () => {
    resetGame();
    navigate('/game');
  };

  const handleContinue = () => {
    navigate('/game');
  };

  return (
    <div className="title-screen">
      {/* 背景动画粒子 */}
      <div className="ts-particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="ts-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* 标题 */}
      <motion.div
        className="ts-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
      >
        <motion.h1
          className="ts-title"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <span className="ts-title-ai">AI</span>
          <span className="ts-title-gal">gal</span>
        </motion.h1>

        <motion.p
          className="ts-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {t('title_screen.title_sub')}
        </motion.p>

        {/* 菜单按钮 */}
        <motion.div
          className="ts-menu"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <motion.button
            className="ts-menu-btn ts-menu-primary"
            whileHover={{ scale: 1.03, x: 5 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNewGame}
          >
            {t('title_screen.btn_new_game')}
          </motion.button>

          {isGameStarted && (
            <motion.button
              className="ts-menu-btn"
              whileHover={{ scale: 1.03, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleContinue}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {t('title_screen.btn_continue')}
            </motion.button>
          )}

          <motion.button
            className="ts-menu-btn"
            whileHover={{ scale: 1.03, x: 5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/game')}
          >
            {t('title_screen.btn_enter_game')}
          </motion.button>

          <motion.button
            className="ts-menu-btn"
            whileHover={{ scale: 1.03, x: 5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/about')}
          >
            {t('title_screen.btn_about')}
          </motion.button>
        </motion.div>
      </motion.div>

      {/* 底部 */}
      <div className="ts-footer">
        <button className="ts-lang-btn" onClick={toggleLanguage}>
          {i18n.language === 'en' ? 'English' : '简体中文'}
        </button>
        <span>AIgal v1.0.1</span>
      </div>
    </div>
  );
}
