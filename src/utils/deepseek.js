const BASE_URL = 'https://api.deepseek.com/v1/chat/completions';

export class DeepSeekError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'DeepSeekError';
    this.status = status;
  }
}

function buildHeaders(apiKey) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };
}

function buildBody({ messages, model, temperature, max_tokens, stream }) {
  return {
    model,
    messages,
    temperature,
    max_tokens,
    stream,
  };
}

function mapError(status) {
  if (status === 401) return new DeepSeekError('API Key 无效，请检查设置', 401);
  if (status === 429) return new DeepSeekError('请求过于频繁，请稍后再试', 429);
  if (status >= 500) return new DeepSeekError('AI 服务暂时不可用，请稍后再试', status);
  return new DeepSeekError(`请求失败 (${status})`, status);
}

/**
 * 非流式对话请求（用于学习建议、每日激励等不需要流式输出的场景）
 */
export async function chat({
  messages,
  apiKey,
  model = 'deepseek-chat',
  temperature = 0.7,
  max_tokens = 2048,
  signal,
}) {
  let response;
  try {
    response = await fetch(BASE_URL, {
      method: 'POST',
      headers: buildHeaders(apiKey),
      body: JSON.stringify(buildBody({ messages, model, temperature, max_tokens, stream: false })),
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new DeepSeekError('网络连接失败，请检查网络后重试', 'network');
  }

  if (!response.ok) throw mapError(response.status);

  const data = await response.json();
  return { content: data.choices?.[0]?.message?.content || '' };
}

/**
 * 流式对话请求（用于 AI 知识点助手、代码调试助手等需要展示思考过程的场景）
 * 通过 ReadableStream 解析 SSE 数据，区分 reasoning_content 和 content
 */
export async function chatStream({
  messages,
  apiKey,
  model = 'deepseek-reasoner',
  temperature = 0.7,
  max_tokens = 4096,
  signal,
  onReasoning,
  onContent,
}) {
  let response;
  try {
    response = await fetch(BASE_URL, {
      method: 'POST',
      headers: buildHeaders(apiKey),
      body: JSON.stringify(buildBody({ messages, model, temperature, max_tokens, stream: true })),
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new DeepSeekError('网络连接失败，请检查网络后重试', 'network');
  }

  if (!response.ok) throw mapError(response.status);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;

        const dataStr = trimmed.slice(5).trim();
        if (dataStr === '[DONE]') return;

        try {
          const parsed = JSON.parse(dataStr);
          const delta = parsed.choices?.[0]?.delta;
          if (!delta) continue;

          if (delta.reasoning_content && onReasoning) {
            onReasoning(delta.reasoning_content);
          }
          if (delta.content && onContent) {
            onContent(delta.content);
          }
        } catch {
          // 忽略无法解析的行
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
