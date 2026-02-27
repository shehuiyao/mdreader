import { open } from '@tauri-apps/plugin-dialog';
import { useAppStore } from '../../stores/useAppStore';
import { readFile, writeFile, listDirectory } from '../../lib/tauri';
import { t } from '../../lib/i18n';
import { streamSummary } from '../../lib/ai';

const noDrag = { WebkitAppRegion: 'no-drag' } as React.CSSProperties;

export default function Header() {
  const currentFileName = useAppStore((s) => s.currentFileName);
  const currentFilePath = useAppStore((s) => s.currentFilePath);
  const content = useAppStore((s) => s.content);
  const isDirty = useAppStore((s) => s.isDirty);
  const viewMode = useAppStore((s) => s.viewMode);
  const sidebarVisible = useAppStore((s) => s.sidebarVisible);
  const tocVisible = useAppStore((s) => s.tocVisible);
  const openFile = useAppStore((s) => s.openFile);
  const markSaved = useAppStore((s) => s.markSaved);
  const setRootFolder = useAppStore((s) => s.setRootFolder);
  const setSidebarTab = useAppStore((s) => s.setSidebarTab);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const toggleTOC = useAppStore((s) => s.toggleTOC);
  const addRecentFile = useAppStore((s) => s.addRecentFile);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const locale = useAppStore((s) => s.locale);
  const toggleLocale = useAppStore((s) => s.toggleLocale);
  const previewFontSize = useAppStore((s) => s.previewFontSize);
  const increasePreviewFontSize = useAppStore((s) => s.increasePreviewFontSize);
  const decreasePreviewFontSize = useAppStore((s) => s.decreasePreviewFontSize);
  const aiLoading = useAppStore((s) => s.aiLoading);

  const handleOpenFile = async () => {
    const selected = await open({
      filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }],
    });
    if (selected) {
      const path = selected as string;
      const name = path.split('/').pop() ?? path;
      const fileContent = await readFile(path);
      openFile(path, name, fileContent);
      addRecentFile(path, name);
    }
  };

  const handleOpenFolder = async () => {
    const selected = await open({ directory: true });
    if (selected) {
      const path = selected as string;
      const entries = await listDirectory(path);
      setRootFolder(path, entries);
      setSidebarTab('files');
      if (!sidebarVisible) toggleSidebar();
    }
  };

  const handleSave = async () => {
    if (!currentFilePath) return;
    await writeFile(currentFilePath, content);
    markSaved();
  };

  const handleRefreshFile = async () => {
    if (!currentFilePath) return;
    const fileContent = await readFile(currentFilePath);
    openFile(currentFilePath, currentFileName ?? currentFilePath.split('/').pop() ?? currentFilePath, fileContent);
  };

  const modes: Array<{ value: 'edit' | 'split' | 'preview'; labelKey: 'edit' | 'split' | 'preview' }> = [
    { value: 'edit', labelKey: 'edit' },
    { value: 'split', labelKey: 'split' },
    { value: 'preview', labelKey: 'preview' },
  ];

  const handleAISummary = async () => {
    const state = useAppStore.getState();
    if (!state.aiConfig.baseUrl || !state.aiConfig.apiKey || !state.aiConfig.model) {
      state.setSettingsOpen(true);
      return;
    }
    if (!content) return;
    state.clearAISummary();
    state.setAIVisible(true);
    state.setAILoading(true);
    await streamSummary(
      state.aiConfig,
      content,
      (chunk) => useAppStore.getState().appendAISummary(chunk),
      () => useAppStore.getState().setAILoading(false),
      (error) => {
        useAppStore.getState().setAIError(error);
        useAppStore.getState().setAILoading(false);
      },
    );
  };

  return (
    <div
      className="h-[38px] flex items-center px-3 select-none flex-shrink-0"
      style={{ backgroundColor: 'var(--bg-mantle)', borderBottom: '1px solid var(--border-subtle)', WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Left section */}
      <div className="flex items-center gap-1" style={noDrag}>
        <button
          onClick={handleOpenFile}
          className="px-2 py-0.5 text-xs rounded hover:opacity-80"
          style={{ color: 'var(--text-secondary)' }}
          title={t(locale, 'open')}
        >
          {t(locale, 'open')}
        </button>
        <button
          onClick={handleOpenFolder}
          className="px-2 py-0.5 text-xs rounded hover:opacity-80"
          style={{ color: 'var(--text-secondary)' }}
          title={t(locale, 'folder')}
        >
          {t(locale, 'folder')}
        </button>
        <button
          onClick={handleSave}
          disabled={!currentFilePath || !isDirty}
          className="px-2 py-0.5 text-xs rounded hover:opacity-80 disabled:opacity-30 disabled:cursor-default"
          style={{ color: 'var(--text-secondary)' }}
          title={`${t(locale, 'save')} (⌘S)`}
        >
          {t(locale, 'save')}
        </button>
      </div>

      {/* Center section - file name */}
      <div className="flex-1 text-center text-xs truncate px-4" style={{ color: 'var(--text-muted)' }}>
        {currentFileName && (
          <span>
            {currentFileName}
            {isDirty && <span className="ml-1 text-orange-400">&#x2022;</span>}
          </span>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1" style={noDrag}>
        {/* AI button */}
        <button
          onClick={handleAISummary}
          disabled={!currentFilePath || aiLoading}
          className="px-2 py-0.5 text-xs rounded hover:opacity-80 disabled:opacity-30 disabled:cursor-default mr-2 font-semibold"
          style={{ color: 'var(--accent)' }}
          title={t(locale, 'aiSummary')}
        >
          AI
        </button>
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
        {currentFilePath && (
          <>
            <button
              onClick={handleRefreshFile}
              className="px-1.5 py-0.5 text-sm rounded hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
              title={t(locale, 'refresh')}
            >
              &#8635;
            </button>
            <div className="flex items-center rounded-lg overflow-hidden mr-1" style={{ backgroundColor: 'var(--bg-surface0)' }}>
              <button
                onClick={decreasePreviewFontSize}
                disabled={previewFontSize <= 12}
                className="px-2 py-0.5 text-xs hover:opacity-80 disabled:opacity-30 disabled:cursor-default"
                style={{ color: 'var(--text-secondary)' }}
                title={t(locale, 'decreaseFontSize')}
              >
                A-
              </button>
              <span className="px-1.5 py-0.5 text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
                {previewFontSize}px
              </span>
              <button
                onClick={increasePreviewFontSize}
                disabled={previewFontSize >= 24}
                className="px-2 py-0.5 text-xs hover:opacity-80 disabled:opacity-30 disabled:cursor-default"
                style={{ color: 'var(--text-secondary)' }}
                title={t(locale, 'increaseFontSize')}
              >
                A+
              </button>
            </div>
          </>
        )}
        <button
          onClick={() => useAppStore.getState().setSettingsOpen(true)}
          className="px-1.5 py-0.5 text-sm rounded hover:opacity-80"
          style={{ color: 'var(--text-secondary)' }}
          title={t(locale, 'aiSettings')}
        >
          &#9881;
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
    </div>
  );
}
