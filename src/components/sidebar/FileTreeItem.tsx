import type { FileEntry } from '../../types/file';
import { useAppStore } from '../../stores/useAppStore';

interface FileTreeItemProps {
  entry: FileEntry;
  depth: number;
  onToggleFolder: (path: string) => void;
  onOpenFile: (path: string) => void;
}

export default function FileTreeItem({ entry, depth, onToggleFolder, onOpenFile }: FileTreeItemProps) {
  const currentFilePath = useAppStore((s) => s.currentFilePath);
  const expandedFolders = useAppStore((s) => s.expandedFolders);

  const isExpanded = expandedFolders.has(entry.path);
  const isActive = entry.path === currentFilePath;

  const handleClick = () => {
    if (entry.is_directory) {
      onToggleFolder(entry.path);
    } else {
      onOpenFile(entry.path);
    }
  };

  const icon = entry.is_directory ? (isExpanded ? '▾' : '▸') : '·';

  return (
    <>
      <button
        onClick={handleClick}
        className="w-full flex items-center h-7 text-xs transition-colors duration-150 cursor-pointer"
        style={{
          paddingLeft: `${8 + depth * 16}px`,
          color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
          backgroundColor: isActive ? 'var(--accent-surface)' : 'transparent',
          borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
        }}
        onMouseEnter={(e) => {
          if (!isActive) e.currentTarget.style.backgroundColor = 'var(--accent-surface)';
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
        }}
        title={entry.path}
      >
        <span className="mr-1.5 text-sm leading-none">{icon}</span>
        <span className="truncate">{entry.name}</span>
      </button>
      {entry.is_directory && isExpanded && entry.children && (
        <>
          {entry.children.map((child) => (
            <FileTreeItem
              key={child.path}
              entry={child}
              depth={depth + 1}
              onToggleFolder={onToggleFolder}
              onOpenFile={onOpenFile}
            />
          ))}
        </>
      )}
    </>
  );
}
