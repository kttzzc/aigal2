/**
 * AIgal 应用根组件
 * 配置路由和全局布局
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TitleScreen from './pages/TitleScreen';
import GameView from './pages/GameView';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TitleScreen />} />
        <Route path="/game" element={<GameView />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </BrowserRouter>
  );
}
