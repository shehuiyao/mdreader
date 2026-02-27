# AI Summary Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add AI-powered document summarization with OpenAI-compatible API, settings modal, and streaming summary card in the preview area.

**Architecture:** Frontend-only AI integration. Tauri HTTP plugin enables direct API calls from the webview. Settings stored in Tauri Store. New Zustand slice manages AI state. Summary card rendered inside MarkdownPreview component.

**Tech Stack:** React, TypeScript, Zustand, Tauri plugin-http, Tauri plugin-store, OpenAI-compatible streaming API (SSE)

---

### Task 1: Add Tauri HTTP plugin

**Files:**
- Modify: `src-tauri/Cargo.toml:20-29`
- Modify: `src-tauri/capabilities/default.json:6-21`

**Step 1: Add the http plugin dependency**

In `src-tauri/Cargo.toml`, add after `tauri-plugin-process`:
```toml
tauri-plugin-http = "2"
```

**Step 2: Register the plugin in lib.rs**

In `src-tauri/src/lib.rs`, add `.plugin(tauri_plugin_http::init())` to the builder chain (after the other `.plugin()` calls).

**Step 3: Add HTTP permissions**

In `src-tauri/capabilities/default.json`, add to the permissions array:
```json
{
  "identifier": "http:default",
  "allow": [{ "url": "https://**" }]
}
```

**Step 4: Install the frontend package**

Run: `npm install @tauri-apps/plugin-http`

**Step 5: Commit**

```bash
git add src-tauri/Cargo.toml src-tauri/src/lib.rs src-tauri/capabilities/default.json package.json package-lock.json
git commit -m "feat: add tauri-plugin-http for AI API calls"
```

---

### Task 2: Create AI Zustand slice + extend settings

**Files:**
- Create: `src/stores/aiSlice.ts`
- Modify: `src/stores/useAppStore.ts:1-14`
- Modify: `src/hooks/useSettings.ts:1-53`
- Modify: `src/lib/i18n.ts` (add AI-related translations)

**Step 1: Create aiSlice.ts**

```typescript
// src/stores/aiSlice.ts
import { StateCreator } from 'zustand';

export interface AIConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface AISlice {
  aiConfig: AIConfig;
  aiSummary: string;
  aiLoading: boolean;
  aiError: string;
  aiVisible: boolean;
  settingsOpen: boolean;
  setAIConfig: (config: AIConfig) => void;
  setAISummary: (summary: string) => void;
  appendAISummary: (chunk: string) => void;
  setAILoading: (loading: boolean) => void;
  setAIError: (error: string) => void;
  setAIVisible: (visible: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  clearAISummary: () => void;
}

export const createAISlice: StateCreator<AISlice, [], [], AISlice> = (set) => ({
  aiConfig: { baseUrl: '', apiKey: '', model: '' },
  aiSummary: '',
  aiLoading: false,
  aiError: '',
  aiVisible: false,
  settingsOpen: false,
  setAIConfig: (config) => set({ aiConfig: config }),
  setAISummary: (summary) => set({ aiSummary: summary }),
  appendAISummary: (chunk) => set((state) => ({ aiSummary: state.aiSummary + chunk })),
  setAILoading: (loading) => set({ aiLoading: loading }),
  setAIError: (error) => set({ aiError: error }),
  setAIVisible: (visible) => set({ aiVisible: visible }),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  clearAISummary: () => set({ aiSummary: '', aiError: '' }),
});
```

**Step 2: Register in useAppStore.ts**

Add import and include in the combined store:
```typescript
import { createAISlice, type AISlice } from './aiSlice';

export type AppState = FileSlice & SidebarSlice & EditorSlice & RecentFilesSlice & AISlice;

// Add ...createAISlice(...a) to the create() call
```

**Step 3: Extend useSettings.ts**

Add AI config to `Settings` interface:
```typescript
export interface Settings {
  previewFontSize?: number;
  aiBaseUrl?: string;
  aiApiKey?: string;
  aiModel?: string;
}
```

Add to `loadSettings()`:
```typescript
const aiBaseUrl = await storeInstance.get<string>('aiBaseUrl');
const aiApiKey = await storeInstance.get<string>('aiApiKey');
const aiModel = await storeInstance.get<string>('aiModel');
return {
  previewFontSize: previewFontSize ?? 16,
  aiBaseUrl: aiBaseUrl ?? '',
  aiApiKey: aiApiKey ?? '',
  aiModel: aiModel ?? '',
};
```

**Step 4: Add i18n translations**

Add to both `zh` and `en` objects in `src/lib/i18n.ts`:

```typescript
// zh:
aiSummary: 'AI 总结',
aiSettings: 'AI 设置',
aiBaseUrl: '接口地址',
aiApiKey: 'API 密钥',
aiModel: '模型',
aiTestConnection: '测试连接',
aiTestSuccess: '连接成功',
aiTestFailed: '连接失败',
aiSave: '保存',
aiCancel: '取消',
aiSummarizing: '正在总结...',
aiNoContent: '请先打开一个文档',
aiNotConfigured: '请先配置 AI 设置',
aiCollapse: '收起',
aiExpand: '展开',
aiClose: '关闭',
aiRetry: '重试',

// en:
aiSummary: 'AI Summary',
aiSettings: 'AI Settings',
aiBaseUrl: 'Base URL',
aiApiKey: 'API Key',
aiModel: 'Model',
aiTestConnection: 'Test Connection',
aiTestSuccess: 'Connection Successful',
aiTestFailed: 'Connection Failed',
aiSave: 'Save',
aiCancel: 'Cancel',
aiSummarizing: 'Summarizing...',
aiNoContent: 'Please open a document first',
aiNotConfigured: 'Please configure AI settings first',
aiCollapse: 'Collapse',
aiExpand: 'Expand',
aiClose: 'Close',
aiRetry: 'Retry',
```

**Step 5: Load AI config on app start**

In `src/App.tsx`, extend the `initSettings` function to also load AI config into the store.

**Step 6: Commit**

```bash
git add src/stores/aiSlice.ts src/stores/useAppStore.ts src/hooks/useSettings.ts src/lib/i18n.ts src/App.tsx
git commit -m "feat: add AI state slice, settings storage, and i18n"
```

---

### Task 3: Create Settings Modal

**Files:**
- Create: `src/components/ai/SettingsModal.tsx`
- Modify: `src/components/layout/Header.tsx` (add gear icon button)

**Step 1: Create SettingsModal.tsx**

A modal overlay with form fields:
- Base URL input with a datalist of presets (OpenAI: `https://api.openai.com/v1`, DeepSeek: `https://api.deepseek.com/v1`, Moonshot: `https://api.moonshot.cn/v1`)
- API Key input (type=password, with a show/hide toggle button)
- Model input
- Test Connection button (sends a minimal `models` list request to validate)
- Save / Cancel buttons

**Styling:**
- Dark overlay backdrop with centered card
- Uses `var(--bg-mantle)`, `var(--bg-surface0)`, `var(--text-primary)` etc.
- Input fields: `var(--bg-base)` background, `var(--border-subtle)` border
- Close on Escape key and backdrop click

**Test connection logic:** `fetch(baseUrl + '/models', { headers: { Authorization: 'Bearer ' + apiKey } })` — if 200, show success toast; otherwise show error.

**Step 2: Add gear button to Header.tsx**

In the right section of Header, before the theme toggle button (~line 188), add:
```tsx
<button
  onClick={() => useAppStore.getState().setSettingsOpen(true)}
  className="px-1.5 py-0.5 text-sm rounded hover:opacity-80"
  style={{ color: 'var(--text-secondary)' }}
  title={t(locale, 'aiSettings')}
>
  &#9881;
</button>
```

**Step 3: Render SettingsModal in App.tsx**

Add `<SettingsModal />` inside the root div (it manages its own visibility via `settingsOpen` state).

**Step 4: Commit**

```bash
git add src/components/ai/SettingsModal.tsx src/components/layout/Header.tsx src/App.tsx
git commit -m "feat: add AI settings modal with API configuration"
```

---

### Task 4: Create AI Summary Card

**Files:**
- Create: `src/components/ai/AISummaryCard.tsx`
- Modify: `src/components/preview/MarkdownPreview.tsx:30-77`

**Step 1: Create AISummaryCard.tsx**

A collapsible card that appears at the top of the preview area:
- Shows streaming summary text (rendered as markdown via ReactMarkdown)
- Has collapse/expand toggle and close (X) button
- Shows loading spinner during streaming
- Shows error message with retry button on failure
- Themed: dark mode uses `rgba(88, 166, 255, 0.08)` bg, light mode uses `rgba(9, 105, 218, 0.06)` bg
- Border: `var(--accent)` at 20% opacity

**Component structure:**
```tsx
export default function AISummaryCard() {
  const { aiSummary, aiLoading, aiError, aiVisible, ... } = useAppStore();
  const [collapsed, setCollapsed] = useState(false);

  if (!aiVisible) return null;

  return (
    <div className="mx-8 mt-4 mb-2 rounded-lg border" style={...}>
      <div className="flex items-center justify-between px-4 py-2">
        <span>AI Summary {aiLoading && <spinner/>}</span>
        <div>
          <button collapse/expand />
          <button close />
        </div>
      </div>
      {!collapsed && (
        <div className="px-4 pb-3">
          {aiError ? <error display with retry/> : <ReactMarkdown>{aiSummary}</ReactMarkdown>}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Embed in MarkdownPreview.tsx**

Inside the `#preview-container` div, before the `.markdown-body` div, add:
```tsx
<AISummaryCard />
```

**Step 3: Commit**

```bash
git add src/components/ai/AISummaryCard.tsx src/components/preview/MarkdownPreview.tsx
git commit -m "feat: add AI summary card in preview area"
```

---

### Task 5: Implement AI API call with streaming

**Files:**
- Create: `src/lib/ai.ts`
- Modify: `src/components/layout/Header.tsx` (add AI button + trigger logic)

**Step 1: Create ai.ts helper**

```typescript
// src/lib/ai.ts
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
      // Tauri plugin-http supports streaming via body.getReader()
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
        } catch { /* skip malformed */ }
      }
    }
    onDone();
  } catch (e) {
    onError(e instanceof Error ? e.message : String(e));
  }
}
```

**Step 2: Add AI button to Header.tsx**

In the right section, before the view mode toggle group (~line 120), add an AI button:
```tsx
<button
  onClick={handleAISummary}
  disabled={!currentFilePath || aiLoading}
  className="px-2 py-0.5 text-xs rounded hover:opacity-80 disabled:opacity-30 mr-2"
  style={{ color: 'var(--accent)', fontWeight: 600 }}
  title={t(locale, 'aiSummary')}
>
  AI
</button>
```

**Step 3: Implement handleAISummary in Header.tsx**

```typescript
const handleAISummary = async () => {
  const { aiConfig, setAIVisible, setAILoading, clearAISummary, appendAISummary, setAIError, setSettingsOpen } = useAppStore.getState();
  if (!aiConfig.baseUrl || !aiConfig.apiKey || !aiConfig.model) {
    setSettingsOpen(true);
    return;
  }
  if (!content) return;
  clearAISummary();
  setAIVisible(true);
  setAILoading(true);
  await streamSummary(
    aiConfig,
    content,
    (chunk) => useAppStore.getState().appendAISummary(chunk),
    () => useAppStore.getState().setAILoading(false),
    (error) => { useAppStore.getState().setAIError(error); useAppStore.getState().setAILoading(false); },
  );
};
```

**Step 4: Commit**

```bash
git add src/lib/ai.ts src/components/layout/Header.tsx
git commit -m "feat: implement streaming AI summary with OpenAI-compatible API"
```

---

### Task 6: Integration, polish, and build verification

**Files:**
- Modify: `src/App.tsx` (load AI config on start)
- Verify: full build works

**Step 1: Ensure AI config loads on app start**

In `App.tsx`'s `initSettings`, after loading `previewFontSize`, add:
```typescript
const { setAIConfig } = useAppStore.getState();
setAIConfig({
  baseUrl: settings.aiBaseUrl ?? '',
  apiKey: settings.aiApiKey ?? '',
  model: settings.aiModel ?? '',
});
```

**Step 2: Verify build**

Run: `npm run build`
Expected: No TypeScript errors, successful Vite build.

Run: `cargo build --manifest-path src-tauri/Cargo.toml`
Expected: Successful Rust compilation with new http plugin.

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: complete AI summary integration"
```

---

### Summary of all files touched

| Action | File |
|--------|------|
| Modify | `src-tauri/Cargo.toml` |
| Modify | `src-tauri/src/lib.rs` |
| Modify | `src-tauri/capabilities/default.json` |
| Create | `src/stores/aiSlice.ts` |
| Modify | `src/stores/useAppStore.ts` |
| Modify | `src/hooks/useSettings.ts` |
| Modify | `src/lib/i18n.ts` |
| Create | `src/lib/ai.ts` |
| Create | `src/components/ai/SettingsModal.tsx` |
| Create | `src/components/ai/AISummaryCard.tsx` |
| Modify | `src/components/layout/Header.tsx` |
| Modify | `src/components/preview/MarkdownPreview.tsx` |
| Modify | `src/App.tsx` |
| Modify | `package.json` (new dependency) |
