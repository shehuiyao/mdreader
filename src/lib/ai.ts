import { fetch } from '@tauri-apps/plugin-http';
import type { AIConfig } from '../stores/aiSlice';
import type { Locale } from './i18n';

const MAX_CONTENT_LENGTH = 30000;

const prompts = {
  zh: (content: string, truncated: boolean) =>
    `请用中文总结以下 Markdown 文档的要点，包括：
1. 文档主题
2. 核心要点（3-5 条）
3. 关键结论
${truncated ? '\n注意：文档内容过长，已截取前部分。\n' : ''}
文档内容：
${content}`,
  en: (content: string, truncated: boolean) =>
    `Please summarize the key points of the following Markdown document, including:
1. Document theme
2. Key points (3-5 items)
3. Key conclusions
${truncated ? '\nNote: The document was too long and has been truncated.\n' : ''}
Document content:
${content}`,
};

export async function streamSummary(
  config: AIConfig,
  content: string,
  locale: Locale,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const truncated = content.length > MAX_CONTENT_LENGTH;
  const trimmedContent = truncated ? content.slice(0, MAX_CONTENT_LENGTH) : content;
  const prompt = prompts[locale](trimmedContent, truncated);

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
      }),
      signal,
    });

    if (!response.ok) {
      onError(`API error: ${response.status} ${response.statusText}`);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) { onError('No response body'); return; }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') { onDone(); return; }
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) onChunk(delta);
        } catch { /* skip malformed lines */ }
      }
    }
    onDone();
  } catch (e) {
    if (signal?.aborted) return;
    onError(e instanceof Error ? e.message : String(e));
  }
}
