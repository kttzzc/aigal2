/**
 * 角色立绘组件
 * 根据位置信息渲染角色立绘，支持说话高亮
 */
import type { CharacterRole } from '../../types';
import './character-sprite.css';

interface CharacterSpriteProps {
  /** 需要显示的角色列表 */
  roles: CharacterRole[];
  /** 当前说话的角色名对应的角色 ID（用于高亮） */
  speakingRoleId?: number;
  /** 素材基础 URL */
  assetBaseUrl: string;
}

export default function CharacterSprite({
  roles,
  speakingRoleId,
  assetBaseUrl,
}: CharacterSpriteProps) {
  return (
    <div className="character-layer">
      {roles.map((role) => {
        const isSpeaking = speakingRoleId === role.id;

        return (
          <div
            key={`${role.id}-${role.img}`}
            className={`character-sprite character-${role.loc}`}
          >
            <img
              src={`${assetBaseUrl}/character/${role.img}`}
              alt={`角色 ${role.id}`}
              className={`character-image ${isSpeaking ? 'speaking' : 'dimmed'}`}
              // NOTE: 图片加载失败时隐藏，避免破图
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
