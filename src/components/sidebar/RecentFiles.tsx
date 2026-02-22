import { useEffect } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { readFile } from '../../lib/tauri';
import { loadRecentFiles, persistRecentFiles } from '../../hooks/useRecentFiles';
import { t } from '../../lib/i18n';

export default function RecentFiles() {
  const recentFiles = useAppStore((s) => s.recentFiles);
  const setRecentFiles = useAppStore((s) => s.setRecentFiles);
  const openFileAction = useAppStore((s) => s.openFile);
  const addRecentFile = useAppStore((s) => s.addRecentFile);
  const togglePinRecentFile = useAppStore((s) => s.togglePinRecentFile);
  const clearRecentFiles = useAppStore((s) => s.clearRecentFiles);
  const locale = useAppStore((s) => s.locale);

  useEffect(() => {
    loadRecentFiles().then(setRecentFiles);
  }, []);

  useEffect(() => {
    if (recentFiles.length > 0) {
      persistRecentFiles(recentFiles);
    }
  }, [recentFiles]);

  const handleOpen = async (path: string, name: string) => {
    try {
      const content = await readFile(path);
      openFileAction(path, name, content);
      addRecentFile(path, name);
    } catch (err) {
      console.error('Failed to open file:', err);
    }
  };

  const handlePin = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    togglePinRecentFile(path);
    // persist after toggling
    setTimeout(() => {
      const store = useAppStore.getState();
      persistRecentFiles(store.recentFiles);
    }, 0);
  };

  const handleClear = () => {
    clearRecentFiles();
    persistRecentFiles([]);
  };

  if (recentFiles.length === 0) {
    return (
      <div className="px-3 py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
        {t(locale, 'noRecentFiles')}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ul className="flex-1 overflow-y-auto">
        {recentFiles.map((file, index) => {
          const isPinned = !!file.pinned;
          const showPinDivider =
            isPinned &&
            index < recentFiles.length - 1 &&
            !recentFiles[index + 1]?.pinned &&
            recentFiles.some((f) => !f.pinned);

          return (
            <li key={file.path}>
              <button
                onClick={() => handleOpen(file.path, file.name)}
                className="w-full text-left px-3 py-2 transition-colors duration-150 cursor-pointer group relative"
                style={{ backgroundColor: 'transparent' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--accent-surface)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div className="flex items-center gap-1.5">
                  {isPinned && (
                    <span className="text-[10px] shrink-0" style={{ color: 'var(--accent)' }} title={t(locale, 'pinned')}>
                      &#x1F4CC;
                    </span>
                  )}
                  <div className="text-sm font-medium truncate flex-1" style={{ color: 'var(--text-primary)' }}>
                    {file.name}
                  </div>
                  <span
                    onClick={(e) => handlePin(e, file.path)}
                    className="opacity-0 group-hover:opacity-100 shrink-0 text-[10px] px-1 py-0.5 rounded transition-opacity duration-150 cursor-pointer"
                    style={{ color: isPinned ? 'var(--accent)' : 'var(--text-muted)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '';
                    }}
                    title={isPinned ? t(locale, 'unpin') : t(locale, 'pin')}
                  >
                    {isPinned ? t(locale, 'unpin') : t(locale, 'pin')}
                  </span>
                </div>
                <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                  {file.path}
                </div>
              </button>
              {showPinDivider && (
                <div className="mx-3 my-0.5" style={{ borderBottom: '1px dashed var(--border-subtle)' }} />
              )}
            </li>
          );
        })}
      </ul>
      <div className="px-3 py-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <button
          onClick={handleClear}
          className="w-full text-sm transition-colors duration-150 cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--error)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          {t(locale, 'clearHistory')}
        </button>
      </div>
    </div>
  );
}
