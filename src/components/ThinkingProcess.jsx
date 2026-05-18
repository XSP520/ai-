import { useState, useEffect, useRef } from 'react';

export default function ThinkingProcess({
  reasoningText = '',
  isThinking = false,
  defaultExpanded = true,
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const containerRef = useRef(null);
  const prevThinking = useRef(isThinking);

  useEffect(() => {
    // 思考完成时自动折叠
    if (prevThinking.current && !isThinking && reasoningText) {
      const timer = setTimeout(() => setExpanded(false), 500);
      prevThinking.current = isThinking;
      return () => clearTimeout(timer);
    }
    prevThinking.current = isThinking;
  }, [isThinking, reasoningText]);

  useEffect(() => {
    // 流式输出时自动滚动到底部
    if (containerRef.current && (isThinking || expanded)) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [reasoningText, isThinking, expanded]);

  if (!reasoningText && !isThinking) return null;

  return (
    <div className="mb-3 rounded-xl overflow-hidden border border-purple-200 dark:border-purple-800/50 bg-purple-50 dark:bg-purple-900/20">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
      >
        <span className="text-base">🧠</span>
        <span>AI 思考过程</span>
        {isThinking && (
          <span className="flex items-center gap-0.5 ml-1">
            <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" />
            <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" />
            <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" />
          </span>
        )}
        <span className="ml-auto text-xs text-purple-400 transition-transform duration-200" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </span>
      </button>
      {expanded && (
        <div
          ref={containerRef}
          className="px-4 py-3 text-sm text-purple-800/80 dark:text-purple-300/70 max-h-48 overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed border-t border-purple-200 dark:border-purple-800/50"
        >
          {reasoningText || (isThinking ? '正在分析中...' : '')}
        </div>
      )}
    </div>
  );
}
