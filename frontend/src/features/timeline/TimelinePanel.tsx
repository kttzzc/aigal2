/**
 * 时间线面板
 * 显示由 AI 自动生成的时间线节点 (time)
 */
import { useGameStore } from '../../store/game-store';
import { motion, AnimatePresence } from 'framer-motion';
import './timeline-panel.css';

export default function TimelinePanel() {
  const { conversationHistory, rollbackTo } = useGameStore();

  // 提取所有有 time 节点的记录，并保留原始的 index 以用于回溯
  const timelineEvents = conversationHistory
    .map((entry, idx) => ({ time: entry.time, originalIndex: idx }))
    .filter((item): item is { time: NonNullable<typeof item.time>, originalIndex: number } => !!item.time);

  const handleRollback = (index: number, timeId: number) => {
    if (confirm(`确定要回溯到时间点 ${timeId} 吗？之后的所有进度将会丢失！`)) {
      rollbackTo(index);
    }
  };

  return (
    <div className="timeline-panel">
      {timelineEvents.length === 0 ? (
        <div className="timeline-empty">暂无时间线记录</div>
      ) : (
        <div className="timeline-list">
          <AnimatePresence>
            {timelineEvents.map((event, index) => (
              <motion.div
                key={event.time.time_id}
                className="timeline-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="timeline-node">
                  <div className="timeline-id">{event.time.time_id}</div>
                  {index !== timelineEvents.length - 1 && <div className="timeline-line" />}
                </div>
                <div className="timeline-content">
                  <p>{event.time.con}</p>
                  
                  {index !== timelineEvents.length - 1 && (
                    <div className="timeline-actions">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleRollback(event.originalIndex, event.time.time_id)}
                      >
                        ⏪ 回溯到此时间点
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
