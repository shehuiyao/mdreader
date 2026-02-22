# Preview Font Size and File Controls Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add preview font size adjustment (12-24px, step 2px) with Tauri Store persistence, file refresh button in Header, and open file button in EmptyState.

**Architecture:** Extend editorSlice with previewFontSize state, create useSettings hook for Tauri Store persistence, update Header with toolbar button group (refresh + font size controls), update EmptyState with prominent open file button, apply dynamic font size to MarkdownPreview.

**Tech Stack:** React 19, TypeScript, Zustand, Tauri Store (@tauri-apps/plugin-store), Tailwind CSS

---

## Task 1: Create useSettings Hook for Tauri Store

**Files:**
- Create: `src/hooks/useSettings.ts`

**Step 1: Create the hook file**

```typescript
import { Store } from '@tauri-apps/plugin-store';

// Settings structure
export interface Settings {
  previewFontSize?: number;
}

// Create store instance (settings.json in app data dir)
const store = new Store('settings.json');

/**
 * Load settings from Tauri Store
 * @returns Settings object with defaults for missing values
 */
export async function loadSettings(): Promise<Settings> {
  try {
    const previewFontSize = await store.get<number>('previewFontSize');
    return {
      previewFontSize: previewFontSize ?? 16, // default 16px
    };
  } catch (error) {
    console.warn('Failed to load settings, using defaults:', error);
    return {
      previewFontSize: 16,
    };
  }
}

/**
 * Save a setting to Tauri Store
 * @param key - Setting key
 * @param value - Setting value
 */
export async function saveSetting(key: keyof Settings, value: unknown): Promise<void> {
  try {
    await store.set(key, value);
    await store.save();
  } catch (error) {
    console.error(`Failed to save setting ${key}:`, error);
  }
}
```

**Step 2: Verify types compile**

Run: `npm run build`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add src/hooks/useSettings.ts
git commit -m "feat: add useSettings hook for Tauri Store persistence"
```

---

## Task 2: Extend editorSlice with Preview Font Size State

**Files:**
- Modify: `src/stores/editorSlice.ts`

**Step 1: Add previewFontSize state and actions**

Update the `EditorSlice` interface:

```typescript
export interface EditorSlice {
  viewMode: 'edit' | 'preview' | 'split';
  tocVisible: boolean;
  fontSize: number;
  previewFontSize: number; // NEW
  theme: 'light' | 'dark' | 'system';
  locale: Locale;
  setViewMode: (mode: 'edit' | 'preview' | 'split') => void;
  toggleTOC: () => void;
  setFontSize: (size: number) => void;
  setPreviewFontSize: (size: number) => void; // NEW
  increasePreviewFontSize: () => void; // NEW
  decreasePreviewFontSize: () => void; // NEW
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  toggleLocale: () => void;
}
```

**Step 2: Add implementation in createEditorSlice**

Update the return object:

```typescript
export const createEditorSlice: StateCreator<EditorSlice, [], [], EditorSlice> = (set) => ({
  viewMode: 'split',
  tocVisible: true,
  fontSize: 14,
  previewFontSize: 16, // NEW - default value
  theme: 'system',
  locale: 'zh',
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleTOC: () => set((state) => ({ tocVisible: !state.tocVisible })),
  setFontSize: (size) => set({ fontSize: size }),
  // NEW - Preview font size actions
  setPreviewFontSize: (size) => set({ previewFontSize: size }),
  increasePreviewFontSize: () => set((state) => ({
    previewFontSize: Math.min(24, state.previewFontSize + 2)
  })),
  decreasePreviewFontSize: () => set((state) => ({
    previewFontSize: Math.max(12, state.previewFontSize - 2)
  })),
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => {
    const order: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const idx = order.indexOf(state.theme);
    return { theme: order[(idx + 1) % order.length] };
  }),
  toggleLocale: () => set((state) => ({ locale: state.locale === 'zh' ? 'en' : 'zh' })),
});
```

**Step 3: Verify types compile**

Run: `npm run build`
Expected: No TypeScript errors

**Step 4: Commit**

```bash
git add src/stores/editorSlice.ts
git commit -m "feat: add previewFontSize state to editorSlice"
```

---

## Task 3: Add i18n Translations for New UI Elements

**Files:**
- Modify: `src/lib/i18n.ts`

**Step 1: Add translation keys**

Add to both `zh` and `en` objects:

```typescript
const translations = {
  zh: {
    // ... existing translations ...

    // Font size controls (ADD AFTER line 44)
    refresh: '刷新',
    decreaseFontSize: '减小字体',
    increaseFontSize: '增大字体',
    openFileButton: '打开文件',
  },
  en: {
    // ... existing translations ...

    // Font size controls (ADD AFTER line 86)
    refresh: 'Refresh',
    decreaseFontSize: 'Decrease Font Size',
    increaseFontSize: 'Increase Font Size',
    openFileButton: 'Open File',
  },
} as const;
```

**Step 2: Verify types compile**

Run: `npm run build`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add src/lib/i18n.ts
git commit -m "feat: add i18n translations for font controls and refresh"
```

---

## Task 4: Update Header Component with Toolbar Button Group

**Files:**
- Modify: `src/components/layout/Header.tsx`

**Step 1: Add imports**

Add at top of file after existing imports:

```typescript
import { saveSetting } from '../../hooks/useSettings';
```

**Step 2: Add state selectors**

Add after line 27 (after `toggleLocale`):

```typescript
  const previewFontSize = useAppStore((s) => s.previewFontSize);
  const setPreviewFontSize = useAppStore((s) => s.setPreviewFontSize);
  const increasePreviewFontSize = useAppStore((s) => s.increasePreviewFontSize);
  const decreasePreviewFontSize = useAppStore((s) => s.decreasePreviewFontSize);
```

**Step 3: Add refresh handler**

Add after `handleSave` function (around line 57):

```typescript
  const handleRefresh = async () => {
    if (!currentFilePath) return;
    try {
      const fileContent = await readFile(currentFilePath);
      openFile(currentFilePath, currentFileName || '', fileContent);
      markSaved(); // Mark as saved since we're loading from disk
    } catch (error) {
      console.error('Failed to refresh file:', error);
      // TODO: Show error notification to user
    }
  };

  const handleDecreaseFontSize = () => {
    decreasePreviewFontSize();
    const newSize = Math.max(12, previewFontSize - 2);
    saveSetting('previewFontSize', newSize);
  };

  const handleIncreaseFontSize = () => {
    increasePreviewFontSize();
    const newSize = Math.min(24, previewFontSize + 2);
    saveSetting('previewFontSize', newSize);
  };
```

**Step 4: Add toolbar button group to JSX**

Replace the "Right section" comment and everything after it (from line 109) with:

```tsx
      {/* Right section */}
      <div className="flex items-center gap-3" style={noDrag}>
        {/* Toolbar button group - only show when file is open */}
        {currentFilePath && (
          <div className="flex items-center gap-1 mr-2">
            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              className="px-1.5 py-0.5 text-sm rounded hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
              title={t(locale, 'refresh')}
            >
              🔄
            </button>

            {/* Font size divider */}
            <div className="w-px h-4 mx-1" style={{ backgroundColor: 'var(--border-subtle)' }} />

            {/* Font size controls */}
            <button
              onClick={handleDecreaseFontSize}
              disabled={previewFontSize <= 12}
              className="px-1.5 py-0.5 text-xs rounded hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ color: 'var(--text-secondary)' }}
              title={t(locale, 'decreaseFontSize')}
            >
              A-
            </button>
            <span className="text-xs px-1" style={{ color: 'var(--text-muted)' }}>
              {previewFontSize}px
            </span>
            <button
              onClick={handleIncreaseFontSize}
              disabled={previewFontSize >= 24}
              className="px-1.5 py-0.5 text-xs rounded hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ color: 'var(--text-secondary)' }}
              title={t(locale, 'increaseFontSize')}
            >
              A+
            </button>
          </div>
        )}

        {/* View mode toggle */}
        <div className="flex items-center rounded-lg overflow-hidden mr-2" style={{ backgroundColor: 'var(--bg-surface0)' }}>
          {modes.map((m) => (
            <button
              key={m.value}
              onClick={() => setViewMode(m.value)}
              className="px-2 py-0.5 text-xs transition-colors"
              style={
                viewMode === m.value
                  ? { backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }
                  : { color: 'var(--text-muted)' }
              }
            >
              {t(locale, m.labelKey)}
            </button>
          ))}
        </div>
        <button
          onClick={toggleSidebar}
          className="px-1.5 py-0.5 text-sm rounded hover:opacity-80"
          style={{ color: sidebarVisible ? 'var(--text-secondary)' : 'var(--text-muted)' }}
          title={t(locale, 'toggleSidebar')}
        >
          &#9776;
        </button>
        <button
          onClick={toggleTOC}
          className="px-1.5 py-0.5 text-sm rounded hover:opacity-80"
          style={{ color: tocVisible ? 'var(--text-secondary)' : 'var(--text-muted)' }}
          title={t(locale, 'toggleTOC')}
        >
          &#9776;
        </button>
        <button
          onClick={toggleTheme}
          className="px-1.5 py-0.5 text-sm rounded hover:opacity-80"
          style={{ color: 'var(--text-secondary)' }}
          title={`${t(locale, 'theme')}: ${theme}`}
        >
          {theme === 'dark' ? '\u2600\uFE0F' : theme === 'light' ? '\uD83C\uDF19' : '\uD83D\uDCBB'}
        </button>
        <button
          onClick={toggleLocale}
          className="px-1.5 py-0.5 text-xs rounded hover:opacity-80 font-medium"
          style={{ color: 'var(--text-secondary)' }}
          title={t(locale, 'language')}
        >
          {locale === 'zh' ? 'EN' : '中'}
        </button>
      </div>
```

**Step 5: Test in dev mode**

Run: `npm run dev`
Expected: Header shows refresh and font size buttons when file is open

**Step 6: Commit**

```bash
git add src/components/layout/Header.tsx
git commit -m "feat: add toolbar button group to Header (refresh + font controls)"
```

---

## Task 5: Update EmptyState Component with Open File Button

**Files:**
- Modify: `src/components/shared/EmptyState.tsx`

**Step 1: Add imports**

Update imports:

```typescript
import { useAppStore } from '../../stores/useAppStore';
import { useFileOperations } from '../../hooks/useFileOperations';
import { t } from '../../lib/i18n';
```

**Step 2: Add file operations hook**

Add after line 5 (after locale selector):

```typescript
  const { openFile } = useFileOperations();
```

**Step 3: Update JSX with button**

Replace the return statement with:

```tsx
  return (
    <div className="h-full flex flex-col items-center justify-center select-none">
      <div className="text-5xl font-extralight tracking-tight mb-4" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
        {t(locale, 'appTitle')}
      </div>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
        {t(locale, 'openFileToStart')}
      </p>

      {/* Open File Button */}
      <button
        onClick={openFile}
        className="px-6 py-3 rounded-lg font-medium text-sm mb-6 transition-opacity hover:opacity-90"
        style={{
          backgroundColor: 'var(--color-lavender)',
          color: 'var(--bg-base)',
        }}
      >
        {t(locale, 'openFileButton')}
      </button>

      <div className="text-xs space-y-1" style={{ color: 'var(--text-muted)' }}>
        <div>
          <kbd
            className="px-1.5 py-0.5 rounded-md text-xs"
            style={{ backgroundColor: 'var(--bg-surface0)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
          >
            &#8984;O
          </kbd>
          <span className="ml-2">{t(locale, 'openFile')}</span>
        </div>
      </div>
    </div>
  );
```

**Step 4: Test in dev mode**

Run: `npm run dev`
Expected: EmptyState shows button, clicking opens file dialog

**Step 5: Commit**

```bash
git add src/components/shared/EmptyState.tsx
git commit -m "feat: add open file button to EmptyState"
```

---

## Task 6: Update MarkdownPreview with Dynamic Font Size

**Files:**
- Modify: `src/components/preview/MarkdownPreview.tsx`

**Step 1: Add previewFontSize selector**

Add after line 24 (after theme selector):

```typescript
  const previewFontSize = useAppStore((s) => s.previewFontSize);
```

**Step 2: Apply font size to markdown-body**

Update the markdown-body div style (around line 39):

```tsx
      <div
        className="markdown-body max-w-[800px] mx-auto p-8"
        style={{
          backgroundColor: colors.bg,
          color: colors.text,
          fontSize: `${previewFontSize}px`,
        }}
      >
```

**Step 3: Test in dev mode**

Run: `npm run dev`
Expected: Preview font size changes when using A-/A+ buttons

**Step 4: Commit**

```bash
git add src/components/preview/MarkdownPreview.tsx
git commit -m "feat: apply dynamic font size to MarkdownPreview"
```

---

## Task 7: Load Settings on App Startup

**Files:**
- Modify: `src/App.tsx`

**Step 1: Add imports**

Add after existing imports (around line 9):

```typescript
import { loadSettings } from './hooks/useSettings';
```

**Step 2: Add settings loading effect**

Add new useEffect after the theme effect (around line 37):

```typescript
  // Load settings from Tauri Store on startup
  useEffect(() => {
    const initSettings = async () => {
      const settings = await loadSettings();
      if (settings.previewFontSize !== undefined) {
        useAppStore.getState().setPreviewFontSize(settings.previewFontSize);
      }
    };
    initSettings();
  }, []);
```

**Step 3: Test complete flow**

Run: `npm run dev`

Test steps:
1. Open app - should load with default 16px
2. Adjust font size to 20px
3. Close app
4. Reopen app - should load with 20px

Expected: Font size persists across sessions

**Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: load settings from Tauri Store on app startup"
```

---

## Task 8: Verify All Features Work Together

**Files:**
- None (testing only)

**Step 1: Manual testing checklist**

Run: `npm run dev`

Test cases:
- [ ] Empty state shows "打开文件" button
- [ ] Click button opens file dialog
- [ ] Open a file - toolbar buttons appear in Header
- [ ] Click refresh button - file content reloads
- [ ] Click A- - font decreases by 2px (min 12px)
- [ ] Click A+ - font increases by 2px (max 24px)
- [ ] Buttons disable at boundaries (12px and 24px)
- [ ] Close and reopen app - font size persists
- [ ] Switch language - all labels translate correctly

Expected: All features work as specified

**Step 2: Build production version**

Run: `npm run build`
Expected: No errors, successful build

**Step 3: Test production build**

Run: `npm run tauri build` (or test with `tauri dev`)
Expected: All features work in production mode

**Step 4: Final commit**

```bash
git add .
git commit -m "test: verify all features integrate correctly"
```

---

## Completion Checklist

- [ ] useSettings hook created with Tauri Store
- [ ] editorSlice extended with previewFontSize
- [ ] i18n translations added
- [ ] Header shows toolbar button group (refresh + font controls)
- [ ] EmptyState shows open file button
- [ ] MarkdownPreview applies dynamic font size
- [ ] Settings load on app startup
- [ ] All features tested and working
- [ ] No TypeScript errors
- [ ] Production build succeeds
