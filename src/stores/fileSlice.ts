import { StateCreator } from 'zustand';

export interface OpenFileTab {
  path: string;
  name: string;
  content: string;
  savedContent: string;
  isDirty: boolean;
}

export interface FileSlice {
  openFiles: OpenFileTab[];
  currentFilePath: string | null;
  currentFileName: string | null;
  content: string;
  savedContent: string;
  isDirty: boolean;
  setContent: (content: string) => void;
  openFile: (path: string, name: string, content: string) => void;
  switchToFile: (path: string) => void;
  switchToPrevFile: () => void;
  switchToNextFile: () => void;
  markSaved: () => void;
  closeFile: (path?: string) => void;
}

export const createFileSlice: StateCreator<FileSlice, [], [], FileSlice> = (set) => ({
  openFiles: [],
  currentFilePath: null,
  currentFileName: null,
  content: '',
  savedContent: '',
  isDirty: false,
  setContent: (content) =>
    set((state) => {
      const isDirty = content !== state.savedContent;
      if (!state.currentFilePath) {
        return { content, isDirty };
      }

      return {
        content,
        isDirty,
        openFiles: state.openFiles.map((tab) => (
          tab.path === state.currentFilePath
            ? { ...tab, content, isDirty }
            : tab
        )),
      };
    }),
  openFile: (path, name, content) =>
    set((state) => {
      const existingIndex = state.openFiles.findIndex((tab) => tab.path === path);
      const nextTab: OpenFileTab = { path, name, content, savedContent: content, isDirty: false };

      const openFiles = existingIndex === -1
        ? [...state.openFiles, nextTab]
        : state.openFiles.map((tab, index) => (index === existingIndex ? nextTab : tab));

      return {
        openFiles,
        currentFilePath: path,
        currentFileName: name,
        content,
        savedContent: content,
        isDirty: false,
      };
    }),
  switchToFile: (path) =>
    set((state) => {
      const tab = state.openFiles.find((item) => item.path === path);
      if (!tab) return state;
      return {
        currentFilePath: tab.path,
        currentFileName: tab.name,
        content: tab.content,
        savedContent: tab.savedContent,
        isDirty: tab.isDirty,
      };
    }),
  switchToPrevFile: () =>
    set((state) => {
      if (!state.currentFilePath || state.openFiles.length < 2) return state;
      const currentIndex = state.openFiles.findIndex((tab) => tab.path === state.currentFilePath);
      if (currentIndex === -1) return state;
      const prevIndex = (currentIndex - 1 + state.openFiles.length) % state.openFiles.length;
      const tab = state.openFiles[prevIndex];
      return {
        currentFilePath: tab.path,
        currentFileName: tab.name,
        content: tab.content,
        savedContent: tab.savedContent,
        isDirty: tab.isDirty,
      };
    }),
  switchToNextFile: () =>
    set((state) => {
      if (!state.currentFilePath || state.openFiles.length < 2) return state;
      const currentIndex = state.openFiles.findIndex((tab) => tab.path === state.currentFilePath);
      if (currentIndex === -1) return state;
      const nextIndex = (currentIndex + 1) % state.openFiles.length;
      const tab = state.openFiles[nextIndex];
      return {
        currentFilePath: tab.path,
        currentFileName: tab.name,
        content: tab.content,
        savedContent: tab.savedContent,
        isDirty: tab.isDirty,
      };
    }),
  markSaved: () =>
    set((state) => {
      if (!state.currentFilePath) return state;
      return {
        savedContent: state.content,
        isDirty: false,
        openFiles: state.openFiles.map((tab) => (
          tab.path === state.currentFilePath
            ? { ...tab, content: state.content, savedContent: state.content, isDirty: false }
            : tab
        )),
      };
    }),
  closeFile: (path) =>
    set((state) => {
      const targetPath = path ?? state.currentFilePath;
      if (!targetPath) return state;

      const currentIndex = state.openFiles.findIndex((tab) => tab.path === targetPath);
      if (currentIndex === -1) return state;

      const openFiles = state.openFiles.filter((tab) => tab.path !== targetPath);

      if (openFiles.length === 0) {
        return {
          openFiles,
          currentFilePath: null,
          currentFileName: null,
          content: '',
          savedContent: '',
          isDirty: false,
        };
      }

      if (targetPath !== state.currentFilePath) {
        return { openFiles };
      }

      const nextIndex = Math.max(0, currentIndex - 1);
      const nextTab = openFiles[nextIndex];
      return {
        openFiles,
        currentFilePath: nextTab.path,
        currentFileName: nextTab.name,
        content: nextTab.content,
        savedContent: nextTab.savedContent,
        isDirty: nextTab.isDirty,
      };
    }),
});
