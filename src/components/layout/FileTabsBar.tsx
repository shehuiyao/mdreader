import { open } from '@tauri-apps/plugin-dialog';
import { useAppStore } from '../../stores/useAppStore';
import { readFile } from '../../lib/tauri';
import { t } from '../../lib/i18n';

export default function FileTabsBar() {
  const openFiles = useAppStore((s) => s.openFiles);
  const currentFilePath = useAppStore((s) => s.currentFilePath);
  const switchToFile = useAppStore((s) => s.switchToFile);
  const closeFile = useAppStore((s) => s.closeFile);
  const openFileAction = useAppStore((s) => s.openFile);
  const addRecentFile = useAppStore((s) => s.addRecentFile);
  const locale = useAppStore((s) => s.locale);

  if (openFiles.length === 0) return null;

  const handleOpenAnotherFile = async () => {
    const selected = await open({
      filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }],
    });
    if (!selected) return;

    const path = selected as string;
    const name = path.split('/').pop() ?? path;
    try {
      const fileContent = await readFile(path);
      openFileAction(path, name, fileContent);
      addRecentFile(path, name);
    } catch (err) {
      console.error('Failed to open file from tabs:', err);
    }
  };

  return (
    <div
      className="h-10 flex items-center px-2 flex-shrink-0"
      style={{ backgroundColor: 'var(--bg-mantle)', borderBottom: '1px solid var(--border-subtle)' }}
    >
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex min-w-max items-center gap-1 pr-2">
          {openFiles.map((tab) => {
            const isActive = tab.path === currentFilePath;

            return (
              <button
                key={tab.path}
                onClick={() => switchToFile(tab.path)}
                className="group h-8 max-w-[260px] px-3 rounded-t-md text-sm flex items-center gap-2 transition-colors"
                style={
                  isActive
                    ? {
                      backgroundColor: 'var(--bg-base)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-subtle)',
                      borderBottom: '1px solid var(--bg-base)',
                      marginBottom: '-1px',
                    }
                    : {
                      backgroundColor: 'transparent',
                      color: 'var(--text-secondary)',
                      border: '1px solid transparent',
                    }
                }
                title={tab.path}
              >
                <span className="truncate">{tab.name}</span>
                {tab.isDirty && (
                  <span className="text-xs leading-none" style={{ color: 'var(--accent-orange)' }} title="Unsaved changes">
                    &#x2022;
                  </span>
                )}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    if (tab.isDirty) {
                      const shouldClose = window.confirm(t(locale, 'confirmCloseUnsavedTab'));
                      if (!shouldClose) return;
                    }
                    closeFile(tab.path);
                  }}
                  className="w-4 h-4 inline-flex items-center justify-center rounded text-xs opacity-70 group-hover:opacity-100"
                  style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}
                  title={t(locale, 'closeTab')}
                >
                  &#x2715;
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleOpenAnotherFile}
        className="ml-1 w-7 h-7 rounded text-sm transition-colors"
        style={{ color: 'var(--text-secondary)' }}
        title={t(locale, 'open')}
      >
        +
      </button>
    </div>
  );
}
