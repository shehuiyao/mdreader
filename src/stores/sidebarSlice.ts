import { StateCreator } from 'zustand';
import type { FileEntry } from '../types/file';

export interface SidebarSlice {
  sidebarVisible: boolean;
  sidebarTab: 'files' | 'recent';
  rootFolderPath: string | null;
  fileTree: FileEntry[];
  expandedFolders: Set<string>;
  toggleSidebar: () => void;
  setSidebarTab: (tab: 'files' | 'recent') => void;
  setRootFolder: (path: string, entries: FileEntry[]) => void;
  toggleFolder: (path: string) => void;
  setFolderChildren: (folderPath: string, children: FileEntry[]) => void;
}

function updateChildren(entries: FileEntry[], folderPath: string, children: FileEntry[]): FileEntry[] {
  return entries.map((entry) => {
    if (entry.path === folderPath) {
      return { ...entry, children };
    }
    if (entry.is_directory && entry.children) {
      return { ...entry, children: updateChildren(entry.children, folderPath, children) };
    }
    return entry;
  });
}

export const createSidebarSlice: StateCreator<SidebarSlice, [], [], SidebarSlice> = (set) => ({
  sidebarVisible: true,
  sidebarTab: 'files',
  rootFolderPath: null,
  fileTree: [],
  expandedFolders: new Set(),
  toggleSidebar: () => set((state) => ({ sidebarVisible: !state.sidebarVisible })),
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
  setRootFolder: (path, entries) => set({ rootFolderPath: path, fileTree: entries, expandedFolders: new Set() }),
  toggleFolder: (path) =>
    set((state) => {
      const next = new Set(state.expandedFolders);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return { expandedFolders: next };
    }),
  setFolderChildren: (folderPath, children) =>
    set((state) => ({ fileTree: updateChildren(state.fileTree, folderPath, children) })),
});
