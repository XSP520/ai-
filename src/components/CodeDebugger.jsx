import { useState, useRef, useCallback } from 'react';
import { useAI } from '../context/AIContext';
import { chatStream } from '../utils/deepseek';
import { toast } from './Toast';
import ThinkingProcess from './ThinkingProcess';
import TypewriterText from './TypewriterText';

const SYSTEM_PROMPT = `你是一位严谨的 AI 编程导师。用户会提供他们的代码和报错信息，请分析问题所在并给出修正后的代码。请用中文回复，遵循以下格式：

1. **问题诊断**：简要指出代码中的错误及原因
2. **修正方案**：给出修正后的完整代码（带注释，使用 \`\`\`python 包裹）
3. **优化建议**：如果代码可正常运行，提出1-2条优化建议

请用鼓励的语气回复。`;

export default function CodeDebugger({ stageId, currentTopic }) {
  const { apiKey, isConfigured } = useAI();
  const [codeInput, setCodeInput] = useState('');
  const [errorInput, setErrorInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reasoning, setReasoning] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [done, setDone] = useState(false);
  const abortRef = useRef(null);

  const handleAnalyze = useCallback(async () => {
    if (!codeInput.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setReasoning('');
    setResult('');
    setDone(false);

    const userMsg = `以下是我的代码：
\`\`\`
${codeInput}
\`\`\`

${errorInput.trim() ? `报错信息：\n\`\`\`\n${errorInput}\n\`\`\`` : '代码运行有问题，请帮我分析。'}`;

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMsg },
    ];

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await chatStream({
        messages,
        apiKey,
        model: 'deepseek-reasoner',
        signal: controller.signal,
        onReasoning: (chunk) => setReasoning((prev) => prev + chunk),
        onContent: (chunk) => setResult((prev) => prev + chunk),
      });
      setDone(true);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message || '请求失败');
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [codeInput, errorInput, isLoading, apiKey]);

  const handleCopyCode = useCallback(() => {
    const match = result.match(/```(?:python)?\s*([\s\S]*?)```/);
    const code = match ? match[1].trim() : result;
    navigator.clipboard.writeText(code).then(() => {
      toast('📋 代码已复制');
    }).catch(() => {
      toast('复制失败，请手动复制');
    });
  }, [result]);

  const handleCancel = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setIsLoading(false);
  }, []);

  return (
    <div className="stage-card-shadow rounded-2xl bg-white dark:bg-[#1E293B] gradient-border overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-5 py-4 text-left hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A] transition-colors"
      >
        <span className="text-xl">🐛</span>
        <span className="font-bold text-lg text-[#0F172A] dark:text-white">代码调试助手</span>
        <span className="ml-auto text-xs text-[#94A3B8] transition-transform duration-200" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </span>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-[#E2E8F0] dark:border-[#334155] pt-4">
          {!isConfigured ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <span className="text-4xl">🔒</span>
              <p className="text-sm text-[#94A3B8] dark:text-[#64748B]">
                请先在设置中配置 DeepSeek API Key
              </p>
              <a href="/settings" className="text-sm text-primary dark:text-accent underline">
                前往设置 →
              </a>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-1.5">
                  📝 代码
                </label>
                <textarea
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="粘贴你的 Python / 机器学习代码..."
                  rows={6}
                  maxLength={4000}
                  disabled={isLoading}
                  className="w-full rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] px-3 py-2 text-sm font-mono text-[#1E293B] dark:text-[#E2E8F0] placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-accent/50 resize-y disabled:opacity-50 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-1.5">
                  ❌ 报错信息（可选）
                </label>
                <textarea
                  value={errorInput}
                  onChange={(e) => setErrorInput(e.target.value)}
                  placeholder="粘贴报错信息..."
                  rows={3}
                  maxLength={2000}
                  disabled={isLoading}
                  className="w-full rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] px-3 py-2 text-sm font-mono text-red-600 dark:text-red-400 placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-accent/50 resize-y disabled:opacity-50 transition-all"
                />
              </div>

              <div className="flex gap-2">
                {isLoading ? (
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
                  >
                    取消
                  </button>
                ) : (
                  <button
                    onClick={handleAnalyze}
                    disabled={!codeInput.trim()}
                    className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    🔍 分析代码
                  </button>
                )}
                {result && !isLoading && (
                  <button
                    onClick={handleCopyCode}
                    className="px-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-sm font-medium text-[#334155] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A] transition-all"
                  >
                    📋 复制修复代码
                  </button>
                )}
              </div>

              {(reasoning || result) && (
                <div className="mt-4">
                  <ThinkingProcess
                    reasoningText={reasoning}
                    isThinking={isLoading && !result}
                  />
                  {result && (
                    <TypewriterText text={result} speed={20} onComplete={() => setDone(true)} />
                  )}
                </div>
              )}

              {error && (
                <div className="text-sm text-red-500 dark:text-red-400 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20">
                  {error}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
