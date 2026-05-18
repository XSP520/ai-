import { useState, useRef, useCallback, useEffect } from 'react';
import { useAI } from '../context/AIContext';
import { chatStream } from '../utils/deepseek';
import ThinkingProcess from './ThinkingProcess';
import TypewriterText from './TypewriterText';

const MAX_ROUNDS = 5;

function buildSystemPrompt(stage, currentTopic) {
  const stageName = stage?.title || '未知阶段';
  const topicName = currentTopic?.name || '未选择';
  return `你是一位专业的 AI 学习导师，正在帮助一名初学者学习「${stageName}」中的「${topicName}」。请用通俗易懂的中文回答，语言友好、鼓励。如果涉及代码，请给出带注释的 Python 示例。尽可能将回答与当前学习主题关联起来。`;
}

export default function ChatPanel({ stageId, stage, currentTopic, isOpen, onClose }) {
  const { apiKey, isConfigured } = useAI();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reasoning, setReasoning] = useState('');
  const [streamContent, setStreamContent] = useState('');
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const reasoningRef = useRef('');
  const streamRef = useRef('');

  // 当阶段或主题变化时，重置上下文提示
  const systemPrompt = buildSystemPrompt(stage, currentTopic);
  const systemMsgRef = useRef(systemPrompt);
  systemMsgRef.current = systemPrompt;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;

    setInputText('');
    setError(null);
    setReasoning('');
    setStreamContent('');
    setDone(false);
    setIsLoading(true);
    reasoningRef.current = '';
    streamRef.current = '';

    const userMsg = { role: 'user', content: text };
    let newMessages = [...messages, userMsg];

    if (newMessages.length > MAX_ROUNDS * 2) {
      newMessages = newMessages.slice(-MAX_ROUNDS * 2);
    }
    setMessages(newMessages);

    const apiMessages = [
      { role: 'system', content: systemMsgRef.current },
      ...newMessages,
    ];

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await chatStream({
        messages: apiMessages,
        apiKey,
        model: 'deepseek-reasoner',
        signal: controller.signal,
        onReasoning: (chunk) => {
          reasoningRef.current += chunk;
          setReasoning((prev) => prev + chunk);
        },
        onContent: (chunk) => {
          streamRef.current += chunk;
          setStreamContent((prev) => prev + chunk);
        },
      });

      const finalContent = streamRef.current;
      const finalReasoning = reasoningRef.current;
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: finalContent,
          reasoning: finalReasoning,
        },
      ]);
      setStreamContent('');
      setReasoning('');
      setDone(true);
    } catch (err) {
      if (err.name === 'AbortError') {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: streamRef.current || '[响应已取消]',
            reasoning: reasoningRef.current || '',
          },
        ]);
      } else {
        setError(err.message || '请求失败');
      }
      setStreamContent('');
      setReasoning('');
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [inputText, isLoading, messages, apiKey]);

  const handleCancel = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
  }, []);

  const handleClear = useCallback(() => {
    setMessages([]);
    setReasoning('');
    setStreamContent('');
    setError(null);
    setDone(false);
  }, []);

  const handleRetry = useCallback(() => {
    if (messages.length === 0) return;
    // 移除最后一条 assistant 消息（如果有）
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === 'assistant') return prev.slice(0, -1);
      return prev;
    });
    setError(null);
    setReasoning('');
    setStreamContent('');
    setDone(false);
    // 重新发送上一条用户消息
    const lastUser = messages.filter((m) => m.role === 'user').pop();
    if (lastUser) {
      setInputText(lastUser.content);
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamContent, reasoning, scrollToBottom]);

  // 自动聚焦输入框
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[440px] z-50 bg-white dark:bg-[#1E293B] shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0] dark:border-[#334155] shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <span className="font-bold text-[#0F172A] dark:text-white">AI 学习助手</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
              深度思考
            </span>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={handleClear}
                className="p-1.5 text-xs text-[#94A3B8] hover:text-red-500 transition-colors"
                title="清空对话"
              >
                🗑️
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-lg text-[#94A3B8] hover:text-[#64748B] dark:hover:text-[#CBD5E1] transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {!isConfigured ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <span className="text-5xl">🔒</span>
              <p className="text-[#94A3B8] dark:text-[#64748B]">
                请先在设置中配置 DeepSeek API Key
              </p>
              <a
                href="/settings"
                className="text-sm text-primary dark:text-accent underline"
              >
                前往设置 →
              </a>
            </div>
          ) : messages.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-2">
              <span className="text-5xl">💬</span>
              <p className="text-lg text-[#334155] dark:text-[#CBD5E1] font-medium">
                有什么想问的？
              </p>
              <p className="text-sm text-[#94A3B8] dark:text-[#64748B]">
                我会结合当前知识点为你解答
              </p>
              {currentTopic && (
                <span className="text-xs mt-2 px-2 py-1 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary dark:text-accent">
                  当前学习：{stage?.title} · {currentTopic.name}
                </span>
              )}
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-[#F1F5F9] dark:bg-[#0F172A] text-[#334155] dark:text-[#CBD5E1]'
                    }`}
                  >
                    {msg.reasoning && (
                      <ThinkingProcess
                        reasoningText={msg.reasoning}
                        isThinking={false}
                        defaultExpanded={false}
                      />
                    )}
                    <div className="text-sm prose dark:prose-invert max-w-none break-words">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}

              {/* 流式输出中的新回复 */}
              {(reasoning || streamContent || isLoading) && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-[#F1F5F9] dark:bg-[#0F172A]">
                    <ThinkingProcess
                      reasoningText={reasoning}
                      isThinking={isLoading && !streamContent}
                    />
                    {streamContent && (
                      <TypewriterText
                        text={streamContent}
                        speed={20}
                        onComplete={() => setDone(true)}
                      />
                    )}
                    {isLoading && !reasoning && !streamContent && (
                      <div className="flex items-center gap-1 text-sm text-[#94A3B8]">
                        <span className="thinking-dot w-2 h-2 rounded-full bg-[#94A3B8] inline-block" />
                        <span className="thinking-dot w-2 h-2 rounded-full bg-[#94A3B8] inline-block" />
                        <span className="thinking-dot w-2 h-2 rounded-full bg-[#94A3B8] inline-block" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {error && (
                <div className="flex justify-center">
                  <div className="text-sm text-red-500 dark:text-red-400 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20">
                    {error}
                    <button
                      onClick={handleRetry}
                      className="ml-2 underline hover:no-underline"
                    >
                      重试
                    </button>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        {isConfigured && (
          <div className="border-t border-[#E2E8F0] dark:border-[#334155] px-4 py-3 shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="针对当前知识点提问..."
                rows={2}
                maxLength={2000}
                disabled={isLoading}
                className="flex-1 resize-none rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] px-3 py-2 text-sm text-[#1E293B] dark:text-[#E2E8F0] placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-accent/50 disabled:opacity-50 transition-all"
              />
              {isLoading ? (
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  取消
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  发送
                </button>
              )}
            </div>
            <p className="text-xs text-[#94A3B8] dark:text-[#64748B] mt-1.5 text-center">
              深度思考模式，回答更精准，但可能需要 10～30 秒 · Enter 发送
            </p>
          </div>
        )}
      </div>
    </>
  );
}
