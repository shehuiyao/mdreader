import { create } from 'zustand';
import { createFileSlice, type FileSlice } from './fileSlice';
import { createSidebarSlice, type SidebarSlice } from './sidebarSlice';
import { createEditorSlice, type EditorSlice } from './editorSlice';
import { createRecentFilesSlice, type RecentFilesSlice } from './recentFilesSlice';

export type AppState = FileSlice & SidebarSlice & EditorSlice & RecentFilesSlice;

export const useAppStore = create<AppState>()((...a) => ({
  ...createFileSlice(...a),
  ...createSidebarSlice(...a),
  ...createEditorSlice(...a),
  ...createRecentFilesSlice(...a),
}));
