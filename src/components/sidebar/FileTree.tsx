import { useAppStore } from '../../stores/useAppStore';
import { readFile, listDirectory } from '../../lib/tauri';
import { getFileName } from '../../lib/fileTree';
import { t } from '../../lib/i18n';
import FileTreeItem from './FileTreeItem';

export default function FileTree() {
  const rootFolderPath = useAppStore((s) => s.rootFolderPath);
  const fileTree = useAppStore((s) => s.fileTree);
  const expandedFolders = useAppStore((s) => s.expandedFolders);
  const toggleFolder = useAppStore((s) => s.toggleFolder);
  const setFolderChildren = useAppStore((s) => s.setFolderChildren);
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

  if (!rootFolderPath) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          {t(locale, 'noFolderOpened')}
          <br />
          {t(locale, 'openFolderHint')}
        </p>
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
