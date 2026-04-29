/**
 * 标题画面
 * 游戏入口页面，提供开始新游戏和继续游戏的选项
 */
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/game-store';
import './title-screen.css';

export default function TitleScreen() {
  const navigate = useNavigate();
  const { isGameStarted, resetGame } = useGameStore();

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
          由 AI 驱动的视觉小说引擎
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
            新的故事
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
              继续游戏
            </motion.button>
          )}

          <motion.button
            className="ts-menu-btn"
            whileHover={{ scale: 1.03, x: 5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/game')}
          >
            进入游戏
          </motion.button>

          <motion.button
            className="ts-menu-btn"
            whileHover={{ scale: 1.03, x: 5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/about')}
          >
            关于
          </motion.button>
        </motion.div>
      </motion.div>

      {/* 版本信息 */}
      <div className="ts-footer">
        <span>AIgal Engine v1.0.1</span>
      </div>
    </div>
  );
}
