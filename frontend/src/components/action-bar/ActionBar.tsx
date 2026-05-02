/**
 * 底部操作栏组件
 * 放置在对话框下方，横向排列 Save / Load / System / Title 四个按钮
 */
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  return (
    <div className="action-bar">
      <button className="action-bar-btn" onClick={onSave}>{t('game_view.action_save')}</button>
      <button className="action-bar-btn" onClick={onLoad}>{t('game_view.action_load')}</button>
      <button className="action-bar-btn" onClick={onTime}>{t('game_view.action_time')}</button>
      <button className="action-bar-btn" onClick={onSystem}>{t('game_view.action_system')}</button>
      <button className="action-bar-btn" onClick={onTitle}>{t('game_view.action_title')}</button>
    </div>
  );
}
