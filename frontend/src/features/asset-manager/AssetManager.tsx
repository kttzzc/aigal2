/**
 * 素材管理器
 * 管理背景图和角色立绘的上传、预览、删除
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { AssetFile, AssetType } from '../../types';
import { getAssets, uploadAsset, deleteAsset, getAssetUrl } from '../../services/api';
import './asset-manager.css';

export default function AssetManager() {
  const { t } = useTranslation();
  const [assets, setAssets] = useState<AssetFile[]>([]);
  const [activeTab, setActiveTab] = useState<AssetType>('background');
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const filteredAssets = assets.filter((a) => a.type === activeTab);

  useEffect(() => { loadAssets(); }, []);

  const loadAssets = async () => {
    try {
      const data = await getAssets();
      setAssets(data);
    } catch { console.warn(t('asset_manager.err_load')); }
  };

  const handleUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;
      setIsUploading(true);
      try {
        for (const file of Array.from(files)) {
          const asset = await uploadAsset(file, activeTab);
          setAssets((prev) => [...prev, asset]);
        }
      } catch { console.error(t('asset_manager.err_upload')); }
      finally { setIsUploading(false); }
    };
    input.click();
  }, [activeTab]);

  const handleDelete = useCallback(async (asset: AssetFile) => {
    if (!confirm(t('asset_manager.confirm_delete', { filename: asset.filename }))) return;
    try {
      await deleteAsset(asset.type, asset.filename);
      setAssets((prev) => prev.filter((a) => a.filename !== asset.filename || a.type !== asset.type));
    } catch { console.error(t('asset_manager.err_delete')); }
  }, [t]);

  // 拖放上传
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;
    setIsUploading(true);
    try {
      for (const file of files) {
        const asset = await uploadAsset(file, activeTab);
        setAssets((prev) => [...prev, asset]);
      }
    } catch { console.error(t('asset_manager.err_upload')); }
    finally { setIsUploading(false); }
  }, [activeTab, t]);

  return (
    <div className="asset-manager">
      {/* 标签切换 */}
      <div className="am-tabs">
        <button className={`am-tab ${activeTab === 'background' ? 'active' : ''}`}
          onClick={() => setActiveTab('background')}>{t('asset_manager.tab_bg')}</button>
        <button className={`am-tab ${activeTab === 'character' ? 'active' : ''}`}
          onClick={() => setActiveTab('character')}>{t('asset_manager.tab_char')}</button>
        <button className="btn btn-primary am-upload-btn" onClick={handleUpload} disabled={isUploading}>
          {isUploading ? t('asset_manager.btn_uploading') : t('asset_manager.btn_upload')}
        </button>
      </div>

      {/* 素材网格 */}
      <div className="am-grid" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
        {filteredAssets.length === 0 ? (
          <div className="am-empty">
            <p>{activeTab === 'background' ? t('asset_manager.empty_bg') : t('asset_manager.empty_char')}</p>
            <p className="am-empty-hint">{t('asset_manager.empty_hint')}</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredAssets.map((asset) => (
              <motion.div key={`${asset.type}-${asset.filename}`} className="am-card"
                layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                <div className="am-card-image" onClick={() => setPreview(getAssetUrl(asset.type, asset.filename))}>
                  <img src={getAssetUrl(asset.type, asset.filename)} alt={asset.filename}
                    onError={(e) => { (e.target as HTMLImageElement).src = ''; }} />
                </div>
                <div className="am-card-info">
                  <span className="am-card-name" title={asset.filename}>{asset.filename}</span>
                  <button className="am-card-delete" onClick={() => handleDelete(asset)}>🗑️</button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* 预览弹窗 */}
      <AnimatePresence>
        {preview && (
          <motion.div className="am-preview-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setPreview(null)}>
            <img src={preview} alt={t('asset_manager.preview')} className="am-preview-image" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
