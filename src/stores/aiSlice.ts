import { StateCreator } from 'zustand';

export interface AIConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface AISlice {
  aiConfig: AIConfig;
  aiSummary: string;
  aiLoading: boolean;
  aiError: string;
  aiVisible: boolean;
  settingsOpen: boolean;
  setAIConfig: (config: AIConfig) => void;
  setAISummary: (summary: string) => void;
  appendAISummary: (chunk: string) => void;
  setAILoading: (loading: boolean) => void;
  setAIError: (error: string) => void;
  setAIVisible: (visible: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  clearAISummary: () => void;
}

export const createAISlice: StateCreator<AISlice, [], [], AISlice> = (set) => ({
  aiConfig: { baseUrl: '', apiKey: '', model: '' },
  aiSummary: '',
  aiLoading: false,
  aiError: '',
  aiVisible: false,
  settingsOpen: false,
  setAIConfig: (config) => set({ aiConfig: config }),
  setAISummary: (summary) => set({ aiSummary: summary }),
  appendAISummary: (chunk) => set((state) => ({ aiSummary: state.aiSummary + chunk })),
  setAILoading: (loading) => set({ aiLoading: loading }),
  setAIError: (error) => set({ aiError: error }),
  setAIVisible: (visible) => set({ aiVisible: visible }),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  clearAISummary: () => set({ aiSummary: '', aiError: '' }),
});
