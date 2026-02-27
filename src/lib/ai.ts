import { fetch } from '@tauri-apps/plugin-http';

interface AIConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export async function streamSummary(
  config: AIConfig,
  content: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: string) => void,
): Promise<void> {
  const prompt = `请用中文总结以下 Markdown 文档的要点，包括：
1. 文档主题
2. 核心要点（3-5 条）
3. 关键结论

文档内容：
${content}`;

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
    onError(e instanceof Error ? e.message : String(e));
  }
}
