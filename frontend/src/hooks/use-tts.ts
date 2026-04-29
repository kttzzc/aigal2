/**
 * TTS 语音播放 Hook
 * 管理语音合成、播放、缓存和自动朗读逻辑
 * 前端使用 Map 缓存 Blob URL，后端同时也基于参数哈希做文件级缓存
 *
 * 防重入机制：
 * - isLoadingRef 防止并发合成请求
 * - pendingRequests 防止同一 key 发出多个网络请求
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { synthesizeTTS } from '../services/api';
import type { TTSConfig } from '../types';

interface UseTTSOptions {
  /** TTS 配置，为 undefined 时禁用 */
  config?: TTSConfig;
}

interface UseTTSReturn {
  /** 是否正在播放 */
  isPlaying: boolean;
  /** 是否正在加载（合成中） */
  isLoading: boolean;
  /** 朗读指定文本 */
  speak: (text: string) => Promise<void>;
  /** 停止播放 */
  stop: () => void;
}

/**
 * 前端内存级缓存
 * key = text + voiceId + speed + model
 * value = Blob URL（整个会话期间持久有效）
 */
const audioCache = new Map<string, string>();

/**
 * 正在进行中的合成请求
 * 同一个 key 只会发出一个网络请求，后续调用等待同一个 Promise
 */
const pendingRequests = new Map<string, Promise<string>>();

function cacheKey(text: string, voiceId: string, speed: number, model: string): string {
  return `${text}|${voiceId}|${speed}|${model}`;
}

export function useTTS({ config }: UseTTSOptions): UseTTSReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // 防重入标志：防止 speak 被并发调用
  const isLoadingRef = useRef(false);

  /** 停止当前播放 */
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  /** 朗读一段文本 */
  const speak = useCallback(async (text: string) => {
    if (!config?.apiKey || !text.trim()) return;

    // 防重入：如果正在加载中，直接忽略
    if (isLoadingRef.current) return;

    // 停止上一段
    stop();

    const voiceId = config.voiceId || 'male-qn-qingse';
    const speed = config.speed || 1.0;
    const model = config.model || 'speech-2.8-hd';
    const key = cacheKey(text, voiceId, speed, model);

    let blobUrl = audioCache.get(key);

    if (!blobUrl) {
      // 检查是否已有同一 key 的请求在进行中
      let pending = pendingRequests.get(key);
      if (!pending) {
        // 没有进行中的请求，发起新的
        isLoadingRef.current = true;
        setIsLoading(true);

        pending = synthesizeTTS({
          text,
          voice_id: voiceId,
          speed,
          model,
        })
          .then((blob) => {
            const url = URL.createObjectURL(blob);
            audioCache.set(key, url);
            return url;
          })
          .finally(() => {
            pendingRequests.delete(key);
            isLoadingRef.current = false;
            setIsLoading(false);
          });

        pendingRequests.set(key, pending);
      }

      try {
        blobUrl = await pending;
      } catch (err) {
        console.error('TTS 合成失败:', err);
        return;
      }
    }

    // 播放前再次检查是否被 stop 了（异步等待期间可能用户点了停止）
    const audio = new Audio(blobUrl);
    audioRef.current = audio;
    setIsPlaying(true);

    audio.onended = () => {
      setIsPlaying(false);
      audioRef.current = null;
    };

    audio.onerror = () => {
      setIsPlaying(false);
      audioRef.current = null;
    };

    await audio.play().catch(() => {
      setIsPlaying(false);
    });
  }, [config?.apiKey, config?.voiceId, config?.speed, config?.model, stop]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { isPlaying, isLoading, speak, stop };
}
