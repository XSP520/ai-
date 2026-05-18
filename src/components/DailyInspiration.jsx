import { useState, useEffect, useCallback } from 'react';
import { useAI } from '../context/AIContext';
import { useProgress } from '../hooks/useProgress';
import { chat } from '../utils/deepseek';
import roadmapData from '../data/roadmapData';

const CACHE_KEY = 'ai-roadmap-daily-inspiration';

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.date === getTodayStr()) return data;
  } catch {
    localStorage.removeItem(CACHE_KEY);
  }
  return null;
}

function saveCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...data, date: getTodayStr() }));
  } catch { /* ignore */ }
}

function getFallbackInspiration(stage) {
  const quotes = [
    '“学习 AI 就像爬山，每一步都在提升你的视野。”',
    '“代码只是工具，思维才是武器。”',
    '“伟大的 AI 工程师都是从一行 print 开始的。”',
    '“不要害怕报错，每次调试都是学习的机会。”',
  ];
  const idx = Math.floor(Math.random() * quotes.length);
  return {
    quote: quotes[idx],
    quiz: {
      question: `${stage?.title || 'AI'} 阶段的核心学习目标是什么？`,
      options: [
        stage?.objective?.slice(0, 40) || '掌握基础概念',
        '学会所有编程语言',
        '成为数学家',
        '考取证书',
      ],
      correctIndex: 0,
      explanation: '每个阶段都有明确的学习目标，聚焦核心知识才能高效进阶。',
    },
    fallback: true,
  };
}

export default function DailyInspiration() {
  const { apiKey, isConfigured } = useAI();
  const { getOverallProgress, getStageProgress } = useProgress();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  const generateInspiration = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // 找到进度最高的阶段作为当前阶段
    let currentStage = roadmapData[0];
    let maxProgress = 0;
    roadmapData.forEach((stage) => {
      const pct = getStageProgress(stage.id);
      if (pct > maxProgress) {
        maxProgress = pct;
        currentStage = stage;
      }
    });

    const prompt = `你是一个 AI 学习激励助手。用户正在学习「AI 进化之路」的「${currentStage.title}」阶段（完成度 ${maxProgress}%）。
请生成一句与 AI 学习相关的励志格言，和一个与当前阶段相关的选择题。

请严格使用以下 JSON 格式回复（不要加其他文字）：
{
  "quote": "一句励志格言（15-40字）",
  "quiz": {
    "question": "选择题题干",
    "options": ["A选项", "B选项", "C选项", "D选项"],
    "correctIndex": 0,
    "explanation": "简短解释为什么选这个"
  }
}`;

    try {
      const { content } = await chat({
        messages: [{ role: 'user', content: prompt }],
        apiKey,
        model: 'deepseek-chat',
        temperature: 0.9,
        max_tokens: 1024,
      });

      // 尝试解析 JSON
      let parsed;
      try {
        // 提取 JSON（可能被```包裹）
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      } catch {
        parsed = null;
      }

      if (parsed && parsed.quote && parsed.quiz) {
        saveCache(parsed);
        setData(parsed);
      } else {
        // AI 返回格式不对，使用后备
        const fallback = getFallbackInspiration(currentStage);
        setData(fallback);
      }
    } catch (err) {
      const fallback = getFallbackInspiration(currentStage);
      setData(fallback);
      setError(err.message || '获取失败，使用本地内容');
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, getStageProgress]);

  // 初始化：加载缓存或生成
  useEffect(() => {
    const cached = loadCache();
    if (cached) {
      setData(cached);
    } else if (isConfigured) {
      generateInspiration();
    } else {
      const fallback = getFallbackInspiration(roadmapData[0]);
      setData(fallback);
    }
  }, [isConfigured, generateInspiration]);

  const handleSubmitAnswer = useCallback(async () => {
    if (selectedAnswer === null || !data?.quiz) return;

    const isCorrect = selectedAnswer === data.quiz.correctIndex;
    const quiz = data.quiz;

    setEvaluating(true);
    setEvaluation(null);

    if (isConfigured) {
      try {
        const { content } = await chat({
          messages: [
            {
              role: 'user',
              content: `用户做了一道选择题：\n题目：${quiz.question}\n选项：${quiz.options.join(' | ')}\n正确答案：${quiz.options[quiz.correctIndex]}\n用户选择：${quiz.options[selectedAnswer]}\n结果：${isCorrect ? '正确' : '错误'}\n\n请用鼓励的语气给用户一个简短的反馈和解释（50-100字）。`,
            },
          ],
          apiKey,
          model: 'deepseek-chat',
          temperature: 0.7,
          max_tokens: 512,
        });
        setEvaluation(content);
      } catch {
        setEvaluation(
          isCorrect
            ? `✅ 完全正确！${quiz.explanation}`
            : `❌ 正确答案是 ${quiz.options[quiz.correctIndex]}。${quiz.explanation}`
        );
      }
    } else {
      setEvaluation(
        isCorrect
          ? `✅ 完全正确！${quiz.explanation}`
          : `❌ 正确答案是 ${quiz.options[quiz.correctIndex]}。${quiz.explanation}`
      );
    }
    setEvaluating(false);
  }, [selectedAnswer, data, isConfigured, apiKey]);

  if (!data) {
    return (
      <div className="stage-card-shadow rounded-2xl p-5 bg-white dark:bg-[#1E293B] gradient-border">
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-1 text-sm text-[#94A3B8]">
            <span className="thinking-dot w-2 h-2 rounded-full bg-[#94A3B8] inline-block" />
            <span className="thinking-dot w-2 h-2 rounded-full bg-[#94A3B8] inline-block" />
            <span className="thinking-dot w-2 h-2 rounded-full bg-[#94A3B8] inline-block" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stage-card-shadow rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#1E293B] gradient-border">
      <h2 className="font-bold text-lg text-[#0F172A] dark:text-white mb-4 flex items-center gap-2">
        <span>🌟</span> 每日 AI 激励
      </h2>

      {/* Quote */}
      <div className="mb-5 px-4 py-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-400 dark:border-purple-600">
        <p className="text-sm italic text-purple-700 dark:text-purple-300 leading-relaxed">
          {data.quote}
        </p>
      </div>

      {/* Quiz */}
      {data.quiz && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-[#334155] dark:text-[#CBD5E1]">
            📝 {data.quiz.question}
          </p>
          <div className="space-y-2">
            {data.quiz.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => {
                  if (evaluation) return;
                  setSelectedAnswer(i);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all border ${
                  evaluation && i === data.quiz.correctIndex
                    ? 'border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : evaluation && i === selectedAnswer && i !== data.quiz.correctIndex
                    ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                    : selectedAnswer === i && !evaluation
                    ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary'
                    : 'border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A]'
                }`}
              >
                <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            ))}
          </div>

          {selectedAnswer !== null && !evaluation && (
            <button
              onClick={handleSubmitAnswer}
              disabled={evaluating}
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition-all"
            >
              {evaluating ? '评估中...' : '提交答案'}
            </button>
          )}

          {evaluation && (
            <div className="px-4 py-3 rounded-xl bg-[#F1F5F9] dark:bg-[#1E293B] text-sm text-[#334155] dark:text-[#CBD5E1] leading-relaxed">
              {evaluation}
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
          )}
        </div>
      )}

      {data.fallback && isConfigured && !isLoading && (
        <button
          onClick={generateInspiration}
          className="mt-3 text-xs text-primary dark:text-accent underline hover:no-underline"
        >
          🔄 重新生成
        </button>
      )}
    </div>
  );
}
