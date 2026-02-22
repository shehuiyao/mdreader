import type { FileEntry } from '../types/file';

// Recursively update children of a folder at the given path
export function updateFolderChildren(
  tree: FileEntry[],
  folderPath: string,
  children: FileEntry[]
): FileEntry[] {
  return tree.map((entry) => {
    if (entry.path === folderPath && entry.is_directory) {
      return { ...entry, children };
    }
    if (entry.is_directory && entry.children) {
      return {
        ...entry,
        children: updateFolderChildren(entry.children, folderPath, children),
      };
    }
    return entry;
  });
}

// Get file name from a full path
export function getFileName(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1] || path;
}
