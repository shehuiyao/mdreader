# Preview Font Size and File Controls Design

**Date:** 2026-02-13
**Status:** Approved

## Overview

Add preview font size adjustment controls and improve file opening UX in the MD reader application.

## Requirements

1. **Preview font size adjustment**
   - Range: 12px - 24px
   - Step: 2px increments
   - Persist settings across sessions
   - Controls in Header toolbar

2. **File refresh button**
   - Reload current file from disk
   - Located in Header with font controls
   - Only visible when file is open

3. **Empty state file open button**
   - Large, prominent button in EmptyState
   - Positioned near keyboard shortcut hint
   - Calls existing file open dialog

## Architecture

### State Management
- **Zustand store** - Add to existing store or create new slice:
  - `previewFontSize: number` (default: 16)
  - `setPreviewFontSize: (size: number) => void`
  - `increasePreviewFontSize: () => void` (max: 24)
  - `decreasePreviewFontSize: () => void` (min: 12)

### Persistence
- **Tauri Store** (`@tauri-apps/plugin-store`)
  - Store file: `settings.json`
  - Key: `previewFontSize`
  - Load on app startup (App.tsx useEffect)
  - Save on every font size change

### UI Components

#### 1. Header Component
Add toolbar button group (right side):
- **Refresh button** (🔄)
  - Visible only when `currentFilePath` exists
  - Reloads file from disk
  - Styled with theme colors

- **Font size controls**
  - A- button (decrease, disabled at 12px)
  - Current size display ("16px")
  - A+ button (increase, disabled at 24px)

#### 2. EmptyState Component
Add centered call-to-action:
- "Open File" button
  - Large size (px-6 py-3)
  - Catppuccin accent color
  - Positioned between title and keyboard hint
  - i18n support ("打开文件" / "Open File")

#### 3. MarkdownPreview Component
Apply dynamic font size:
```jsx
<div
  className="markdown-body"
  style={{ fontSize: `${previewFontSize}px` }}
>
```

#### 4. New Hook: useSettings
Encapsulate Tauri Store logic:
- `loadSettings(): Promise<Settings>`
- `saveSettings(key: string, value: any): Promise<void>`

## Data Flow

### App Startup
1. App.tsx useEffect calls `loadSettings()`
2. Read `previewFontSize` from Tauri Store
3. Call `setPreviewFontSize(loadedSize)` or use default (16)

### Font Size Adjustment
1. User clicks A+ or A-
2. Call `increasePreviewFontSize()` / `decreasePreviewFontSize()`
3. Action checks boundaries (12-24)
4. Update Zustand state
5. Save to Tauri Store
6. MarkdownPreview re-renders with new size

### File Refresh
1. User clicks refresh button
2. Call new `refreshFile()` method
3. Read file using current `currentFilePath`
4. Update `content` state (keep isDirty false)
5. Preview re-renders

### File Open (EmptyState)
1. User clicks "Open File" button
2. Call existing `handleOpenFile()` from useFileOperations
3. Show file picker dialog
4. Load and display file

## Error Handling

### Tauri Store Errors
- **Load failure**: Use default value (16px), log warning
- **Save failure**: Log error, continue (setting active in current session)

### File Refresh Errors
- **File not found**: Show error message, keep current content
- **Read permission denied**: Show error message, keep current content

### Boundary Conditions
- Font size strictly limited to 12-24px range
- Disable buttons when at min/max
- Refresh button only shown when file is open

## Implementation Notes

- Use existing Catppuccin theme tokens for styling
- Maintain i18n support for all new text
- Follow existing code patterns (Zustand slices, hooks)
- No breaking changes to existing features

## Future Enhancements (Out of Scope)

- Font family selection
- Line height adjustment
- Export settings/preferences panel
