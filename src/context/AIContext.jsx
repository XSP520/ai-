import { createContext, useContext, useState, useCallback } from 'react';
import { chat, DeepSeekError } from '../utils/deepseek';

const AIContext = createContext(null);

const STORAGE_KEY = 'ai-roadmap-api-key';

function loadKey() {
  try {
    const encoded = localStorage.getItem(STORAGE_KEY);
    if (encoded) return atob(encoded);
  } catch {
    // 解码失败则清除
    localStorage.removeItem(STORAGE_KEY);
  }
  return null;
}

function saveKey(key) {
  try {
    localStorage.setItem(STORAGE_KEY, btoa(key));
  } catch {
    // localStorage 写入失败
  }
}

function clearKey() {
  localStorage.removeItem(STORAGE_KEY);
}

export function AIProvider({ children }) {
  const [apiKey, setApiKeyState] = useState(loadKey);
  const [testing, setTesting] = useState(false);

  const setApiKey = useCallback((key) => {
    if (key) {
      saveKey(key);
      setApiKeyState(key);
    } else {
      clearKey();
      setApiKeyState(null);
    }
  }, []);

  const clearApiKeyFn = useCallback(() => {
    clearKey();
    setApiKeyState(null);
  }, []);

  const testConnection = useCallback(async (keyToTest) => {
    const key = keyToTest || apiKey;
    if (!key) return { ok: false, message: '请先输入 API Key' };
    setTesting(true);
    try {
      await chat({
        messages: [{ role: 'user', content: 'hi' }],
        apiKey: key,
        max_tokens: 16,
      });
      return { ok: true, message: '连接成功！API Key 有效' };
    } catch (err) {
      if (err instanceof DeepSeekError) {
        return { ok: false, message: err.message };
      }
      return { ok: false, message: '未知错误，请稍后重试' };
    } finally {
      setTesting(false);
    }
  }, [apiKey]);

  const isConfigured = !!apiKey;

  return (
    <AIContext.Provider
      value={{ apiKey, isConfigured, setApiKey, clearApiKey: clearApiKeyFn, testConnection, testing }}
    >
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error('useAI must be used within AIProvider');
  return ctx;
}
