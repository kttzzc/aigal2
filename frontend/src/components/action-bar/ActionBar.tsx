/**
 * 底部操作栏组件
 * 放置在对话框下方，横向排列 Save / Load / System / Title 四个按钮
 */
import './action-bar.css';

interface ActionBarProps {
  onSave: () => void;
  onLoad: () => void;
  onSystem: () => void;
  onTime: () => void;
  onTitle: () => void;
}

export default function ActionBar({
  onSave,
  onLoad,
  onSystem,
  onTime,
  onTitle,
}: ActionBarProps) {
  return (
    <div className="action-bar">
      <button className="action-bar-btn" onClick={onSave}>Save</button>
      <button className="action-bar-btn" onClick={onLoad}>Load</button>
      <button className="action-bar-btn" onClick={onTime}>Time</button>
      <button className="action-bar-btn" onClick={onSystem}>System</button>
      <button className="action-bar-btn" onClick={onTitle}>Title</button>
    </div>
  );
}
