import { StateCreator } from 'zustand';
import type { RecentFile } from '../types/file';

export interface RecentFilesSlice {
  recentFiles: RecentFile[];
  setRecentFiles: (files: RecentFile[]) => void;
  addRecentFile: (path: string, name: string) => void;
  removeRecentFile: (path: string) => void;
  togglePinRecentFile: (path: string) => void;
  clearRecentFiles: () => void;
}

const MAX_RECENT = 20;

function sortRecentFiles(files: RecentFile[]): RecentFile[] {
  const pinned = files.filter((f) => f.pinned);
  const unpinned = files.filter((f) => !f.pinned);
  return [...pinned, ...unpinned];
}

export const createRecentFilesSlice: StateCreator<RecentFilesSlice, [], [], RecentFilesSlice> = (set) => ({
  recentFiles: [],
  setRecentFiles: (files) => set({ recentFiles: sortRecentFiles(files) }),
  addRecentFile: (path, name) =>
    set((state) => {
      const existing = state.recentFiles.find((f) => f.path === path);
      const filtered = state.recentFiles.filter((f) => f.path !== path);
      const entry: RecentFile = { path, name, lastOpened: Date.now(), pinned: existing?.pinned };
      return { recentFiles: sortRecentFiles([entry, ...filtered]).slice(0, MAX_RECENT) };
    }),
  removeRecentFile: (path) =>
    set((state) => ({ recentFiles: state.recentFiles.filter((f) => f.path !== path) })),
  togglePinRecentFile: (path) =>
    set((state) => {
      const updated = state.recentFiles.map((f) =>
        f.path === path ? { ...f, pinned: !f.pinned } : f
      );
      return { recentFiles: sortRecentFiles(updated) };
    }),
  clearRecentFiles: () => set({ recentFiles: [] }),
});
