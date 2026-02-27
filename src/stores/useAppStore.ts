import { create } from 'zustand';
import { createFileSlice, type FileSlice } from './fileSlice';
import { createSidebarSlice, type SidebarSlice } from './sidebarSlice';
import { createEditorSlice, type EditorSlice } from './editorSlice';
import { createRecentFilesSlice, type RecentFilesSlice } from './recentFilesSlice';
import { createAISlice, type AISlice } from './aiSlice';

export type AppState = FileSlice & SidebarSlice & EditorSlice & RecentFilesSlice & AISlice;

export const useAppStore = create<AppState>()((...a) => ({
  ...createFileSlice(...a),
  ...createSidebarSlice(...a),
  ...createEditorSlice(...a),
  ...createRecentFilesSlice(...a),
  ...createAISlice(...a),
}));
