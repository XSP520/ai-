import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAI } from '../context/AIContext';
import { toast } from '../components/Toast';

export default function Settings() {
  const { apiKey, isConfigured, setApiKey, clearApiKey, testConnection, testing } = useAI();
  const [inputValue, setInputValue] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleSave = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setApiKey(trimmed);
    setInputValue('');
    setTestResult(null);
    toast('API Key 已保存');
  }, [inputValue, setApiKey]);

  const handleTest = useCallback(async () => {
    if (!apiKey && !inputValue.trim()) {
      setTestResult({ ok: false, message: '请先输入 API Key' });
      return;
    }
    // If there's input that hasn't been saved yet, use it for testing
    const keyToTest = inputValue.trim() || apiKey;
    if (inputValue.trim()) {
      setApiKey(inputValue.trim());
      setInputValue('');
    }
    const result = await testConnection(keyToTest);
    setTestResult(result);
    if (result.ok) {
      toast('✅ API 连接成功');
    } else {
      toast('❌ ' + result.message);
    }
  }, [apiKey, inputValue, setApiKey, testConnection]);

  const handleClear = useCallback(() => {
    clearApiKey();
    setInputValue('');
    setTestResult(null);
    toast('API Key 已清除');
  }, [clearApiKey]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-[#64748B] dark:text-[#94A3B8] hover:text-primary transition-colors mb-6"
      >
        ← 返回首页
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-white mb-2">
        ⚙️ AI 设置
      </h1>
      <p className="text-[#64748B] dark:text-[#94A3B8] mb-8">
        配置 DeepSeek API Key 以启用 AI 学习助手功能
      </p>

      {/* API Key Card */}
      <div className="stage-card-shadow rounded-2xl p-6 bg-white dark:bg-[#1E293B] gradient-border mb-6 max-w-2xl">
        <h2 className="font-bold text-lg text-[#0F172A] dark:text-white mb-4">
          🔑 DeepSeek API Key
        </h2>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <input
              type={showKey ? 'text' : 'password'}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setTestResult(null);
              }}
              placeholder={isConfigured ? '••••••••（已配置，输入新 Key 将覆盖）' : '请输入你的 DeepSeek API Key'}
              className="w-full rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] px-4 py-2.5 text-sm text-[#1E293B] dark:text-[#E2E8F0] placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-accent/50 transition-all pr-10"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-[#94A3B8] hover:text-[#64748B] dark:hover:text-[#CBD5E1] transition-colors"
              title={showKey ? '隐藏 Key' : '显示 Key'}
            >
              {showKey ? '🙈' : '👁️'}
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={!inputValue.trim()}
            className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            保存
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleTest}
            disabled={testing || (!apiKey && !inputValue.trim())}
            className="px-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-sm font-medium text-[#334155] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {testing ? '测试中...' : '🔍 测试连接'}
          </button>

          {isConfigured && (
            <button
              onClick={handleClear}
              className="px-4 py-2 rounded-xl border border-red-200 dark:border-red-800 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            >
              🗑️ 清除 Key
            </button>
          )}

          {testResult && (
            <span
              className={`text-sm font-medium ${
                testResult.ok
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {testResult.ok ? '✅' : '❌'} {testResult.message}
            </span>
          )}
        </div>
      </div>

      {/* Status Card */}
      <div className="stage-card-shadow rounded-2xl p-6 bg-white dark:bg-[#1E293B] gradient-border mb-6 max-w-2xl">
        <h2 className="font-bold text-lg text-[#0F172A] dark:text-white mb-4">
          📊 功能状态
        </h2>
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              isConfigured ? 'bg-green-500' : 'bg-[#CBD5E1] dark:bg-[#475569]'
            }`}
          />
          <span className="text-sm text-[#334155] dark:text-[#CBD5E1]">
            {isConfigured
              ? 'AI 功能已启用 — 你可以在学习过程中使用 AI 助手、代码调试等功能'
              : 'AI 功能未启用 — 请配置 API Key 以解锁 AI 学习助手'}
          </span>
        </div>

        {!isConfigured && (
          <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              💡 前往{' '}
              <a
                href="https://platform.deepseek.com/api_keys"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                DeepSeek 开放平台
              </a>{' '}
              注册账号并创建 API Key，即可获得免费额度。
            </p>
          </div>
        )}
      </div>

      {/* Security Note */}
      <div className="max-w-2xl p-4 rounded-xl bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]">
        <p className="text-xs text-[#94A3B8] dark:text-[#64748B] leading-relaxed">
          🔒 Key 将使用 Base64 编码后存储在你的浏览器本地存储中。此为个人学习项目，Base64
          仅提供基础的防窥保护，非生产级加密。请勿在公共电脑上保存 Key。
        </p>
      </div>
    </div>
  );
}
