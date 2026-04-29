/**
 * 打字机效果 Hook
 * 逐字显示文本，支持跳过动画
 */
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTypewriterOptions {
  /** 完整文本 */
  text: string;
  /** 每个字的间隔（毫秒），默认 50ms */
  speed?: number;
  /** 是否启用打字效果 */
  enabled?: boolean;
  /** 打字完成回调 */
  onComplete?: () => void;
}

interface UseTypewriterReturn {
  /** 当前已显示的文本 */
  displayedText: string;
  /** 是否正在打字 */
  isTyping: boolean;
  /** 跳过打字，立即显示全部文本 */
  skip: () => void;
  /** 是否已完成 */
  isComplete: boolean;
}

export function useTypewriter({
  text,
  speed = 50,
  enabled = true,
  onComplete,
}: UseTypewriterOptions): UseTypewriterReturn {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCompleteRef = useRef(onComplete);

  // 保持回调引用最新
  onCompleteRef.current = onComplete;

  // 文本变化时重置
  useEffect(() => {
    if (!enabled) {
      setDisplayedText(text);
      setIsComplete(true);
      setIsTyping(false);
      return;
    }

    setDisplayedText('');
    setIsComplete(false);
    setIsTyping(true);
    indexRef.current = 0;

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [text, enabled]);

  // 打字效果定时器
  useEffect(() => {
    if (!isTyping || isComplete || !enabled) return;

    const tick = () => {
      if (indexRef.current < text.length) {
        indexRef.current += 1;
        setDisplayedText(text.slice(0, indexRef.current));

        timerRef.current = setTimeout(tick, speed);
      } else {
        setIsTyping(false);
        setIsComplete(true);
        onCompleteRef.current?.();
      }
    };

    timerRef.current = setTimeout(tick, speed);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isTyping, isComplete, text, speed, enabled]);

  const skip = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setDisplayedText(text);
    setIsTyping(false);
    setIsComplete(true);
    indexRef.current = text.length;
    onCompleteRef.current?.();
  }, [text]);

  return { displayedText, isTyping, skip, isComplete };
}
