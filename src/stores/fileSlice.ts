import { StateCreator } from 'zustand';

export interface FileSlice {
  currentFilePath: string | null;
  currentFileName: string | null;
  content: string;
  savedContent: string;
  isDirty: boolean;
  setContent: (content: string) => void;
  openFile: (path: string, name: string, content: string) => void;
  markSaved: () => void;
  closeFile: () => void;
}

export const createFileSlice: StateCreator<FileSlice, [], [], FileSlice> = (set) => ({
  currentFilePath: null,
  currentFileName: null,
  content: '',
  savedContent: '',
  isDirty: false,
  setContent: (content) => set((state) => ({ content, isDirty: content !== state.savedContent })),
  openFile: (path, name, content) => set({ currentFilePath: path, currentFileName: name, content, savedContent: content, isDirty: false }),
  markSaved: () => set((state) => ({ savedContent: state.content, isDirty: false })),
  closeFile: () => set({ currentFilePath: null, currentFileName: null, content: '', savedContent: '', isDirty: false }),
});
