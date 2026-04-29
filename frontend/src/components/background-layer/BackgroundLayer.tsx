/**
 * 背景层组件
 * 全屏渲染背景图片，支持切换过渡动画
 */
import { motion, AnimatePresence } from 'framer-motion';
import './background-layer.css';

interface BackgroundLayerProps {
  /** 背景图 URL，为空时显示默认渐变背景 */
  imageUrl?: string;
}

export default function BackgroundLayer({ imageUrl }: BackgroundLayerProps) {
  return (
    <div className="background-layer">
      <AnimatePresence mode="wait">
        {imageUrl ? (
          <motion.div
            key={imageUrl}
            className="background-image"
            style={{ backgroundImage: `url(${imageUrl})` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
        ) : (
          <motion.div
            key="default-bg"
            className="background-default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        )}
      </AnimatePresence>
      {/* 底部渐变遮罩，确保对话框区域文字可读 */}
      <div className="background-overlay" />
    </div>
  );
}
