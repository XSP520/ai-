import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAI } from '../context/AIContext';
import { chat } from '../utils/deepseek';
import { useProgress } from '../hooks/useProgress';
import roadmapData from '../data/roadmapData';

const SYSTEM_PROMPT = `你是一位专业的 AI 学习规划师。根据用户的学习进度数据，生成一份个性化的学习建议报告。请用中文，以 Markdown 格式输出，包含以下部分：

## 📊 当前进度分析
简要总结用户的整体完成情况。

## 🎯 薄弱环节
指出进度较低、需要加强的阶段。

## 📖 推荐下一步学习
从学习路线的知识点中推荐2-3个应该优先学习的内容。

## 🛠️ 实践项目建议
推荐一个适合当前水平的具体实践项目。

请用鼓励、友好的语气，适当使用表情符号。`;

export default function AISuggestions() {
  const { apiKey, isConfigured } = useAI();
  const { getOverallProgress, getStageProgress } = useProgress();
  const [suggestion, setSuggestion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const buildProgressMessage = useCallback(() => {
    const overall = getOverallProgress();
    const stages = roadmapData.map((stage) => {
      const pct = getStageProgress(stage.id);
      // 获取未完成的话题名称
      const incomplete = stage.topics
        .filter(() => {
          // Note: we can't directly access individual topic progress here
          // without the full progress object, but we can use stage-level data
          return true;
        })
        .map((t) => t.name);
      return `- ${stage.icon} ${stage.title}：完成度 ${pct}%`;
    }).join('\n');

    return `以下是我的学习进度数据：

整体完成度：${overall}%

各阶段详情：
${stages}

请根据以上进度给我个性化学习建议。`;
  }, [getOverallProgress, getStageProgress]);

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { content } = await chat({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildProgressMessage() },
        ],
        apiKey,
        model: 'deepseek-chat',
        temperature: 0.8,
        max_tokens: 2048,
      });
      setSuggestion(content);
    } catch (err) {
      setError(err.message || '获取建议失败');
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, buildProgressMessage]);

  return (
    <div className="stage-card-shadow rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#1E293B] gradient-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg text-[#0F172A] dark:text-white flex items-center gap-2">
          <span>🤖</span> AI 学习建议
        </h2>
        {isConfigured && (
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? '生成中...' : suggestion ? '🔄 重新生成' : '✨ 获取建议'}
          </button>
        )}
      </div>

      {!isConfigured ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <span className="text-4xl">🔒</span>
          <p className="text-sm text-[#94A3B8] dark:text-[#64748B]">
            配置 DeepSeek API Key 后获取 AI 个性化学习建议
          </p>
          <a href="/settings" className="text-sm text-primary dark:text-accent underline">
            前往设置 →
          </a>
        </div>
      ) : suggestion ? (
        <div className="prose dark:prose-invert max-w-none text-sm bg-purple-50/50 dark:bg-purple-900/10 rounded-xl p-4 border border-purple-100 dark:border-purple-800/30">
          <ReactMarkdown>{suggestion}</ReactMarkdown>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <span className="text-4xl">💡</span>
          <p className="text-sm text-[#94A3B8] dark:text-[#64748B]">
            AI 将分析你的学习进度，为你推荐下一步学习方向和实战项目
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 text-sm text-red-500 dark:text-red-400 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20">
          {error}
        </div>
      )}
    </div>
  );
}
