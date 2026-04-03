import { open } from '@tauri-apps/plugin-dialog';
import { useAppStore } from '../../stores/useAppStore';
import { readFile, listDirectory } from '../../lib/tauri';
import { getFileName } from '../../lib/fileTree';
import { t } from '../../lib/i18n';
import FileTreeItem from './FileTreeItem';
import { saveSetting } from '../../hooks/useSettings';

export default function FileTree() {
  const rootFolderPath = useAppStore((s) => s.rootFolderPath);
  const fileTree = useAppStore((s) => s.fileTree);
  const expandedFolders = useAppStore((s) => s.expandedFolders);
  const toggleFolder = useAppStore((s) => s.toggleFolder);
  const setFolderChildren = useAppStore((s) => s.setFolderChildren);
  const setRootFolder = useAppStore((s) => s.setRootFolder);
  const openFile = useAppStore((s) => s.openFile);
  const addRecentFile = useAppStore((s) => s.addRecentFile);
  const locale = useAppStore((s) => s.locale);

  const handleToggleFolder = async (path: string) => {
    const isExpanded = expandedFolders.has(path);
    if (!isExpanded) {
      try {
        const children = await listDirectory(path);
        setFolderChildren(path, children);
      } catch (err) {
        console.error('Failed to list directory:', err);
      }
    }
    toggleFolder(path);
  };

  const handleOpenFile = async (path: string) => {
    try {
      const content = await readFile(path);
      const name = getFileName(path);
      openFile(path, name, content);
      addRecentFile(path, name);
    } catch (err) {
      console.error('Failed to open file:', err);
    }
  };

  const handleOpenFolder = async () => {
    const selected = await open({ directory: true });
    if (!selected) return;

    const path = selected as string;
    try {
      const entries = await listDirectory(path);
      setRootFolder(path, entries);
      await saveSetting('lastRootFolderPath', path);
    } catch (err) {
      console.error('Failed to open folder:', err);
    }
  };

  if (!rootFolderPath) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          {t(locale, 'noFolderOpened')}
          <br />
          {t(locale, 'openFolderHint')}
        </p>
        <button
          onClick={handleOpenFolder}
          className="px-4 py-1.5 text-xs rounded-md transition-colors duration-150 cursor-pointer"
          style={{
            color: 'var(--text-secondary)',
            backgroundColor: 'transparent',
            border: '1px solid var(--border-subtle)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent-surface)';
            e.currentTarget.style.borderColor = 'var(--accent-border)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          {t(locale, 'openFolderButton')}
        </button>
      </div>
    );
  }

  if (fileTree.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>{t(locale, 'emptyFolder')}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto py-1">
      {fileTree.map((entry) => (
        <FileTreeItem
          key={entry.path}
          entry={entry}
          depth={0}
          onToggleFolder={handleToggleFolder}
          onOpenFile={handleOpenFile}
        />
      ))}
    </div>
  );
}
