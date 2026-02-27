# AI Summary Feature Design

## Overview

Add an AI-powered document summarization feature to MD Reader. Users click an AI button, and a summary card appears at the top of the preview area with streaming results from an OpenAI-compatible API.

## API Configuration

**Storage:** Extend existing `useSettings.ts` + Tauri Store (`settings.json`)

```typescript
interface AISettings {
  baseUrl: string;    // e.g. https://api.deepseek.com/v1
  apiKey: string;     // User's API Key
  model: string;      // e.g. deepseek-chat, gpt-4o
}
```

API Key stored locally in Tauri Store only. Never transmitted to our servers.

## Settings Page

**Entry:** Gear icon button in Header right section. Opens a Modal.

Contents:
- Base URL input with preset dropdown (OpenAI / DeepSeek / Moonshot)
- API Key input (password type, toggle visibility)
- Model input
- Test connection button

## AI Summary UI

**Trigger:** New `AI` button in Header (left of view mode toggle).

**Display:** Collapsible card at top of preview content area.

- Click AI button -> card appears at preview top
- Streaming output (typewriter effect)
- Card has collapse/expand and close buttons
- If API not configured, clicking AI button opens Settings Modal

**Styling:** Follows dark/light theme. Light blue/purple tinted background to distinguish from content.

## API Call

**Method:** Frontend `fetch` directly (Tauri handles CORS).

**Prompt template:**
```
请用中文总结以下 Markdown 文档的要点，包括：
1. 文档主题
2. 核心要点（3-5 条）
3. 关键结论

文档内容：
{content}
```

**Streaming:** SSE with `stream: true`, render incrementally into card.

## New Files

| File | Responsibility |
|------|----------------|
| `src/components/ai/AISummaryCard.tsx` | Summary card at preview top |
| `src/components/ai/SettingsModal.tsx` | Settings modal (API config) |
| `src/stores/aiSlice.ts` | AI state (summary content, loading, config) |

## Out of Scope

- No chat/multi-turn conversation (single summary only)
- No selected text summary (whole document only)
- No backend proxy (frontend calls API directly)
