import { StateCreator } from 'zustand';
import type { Locale } from '../lib/i18n';

export interface EditorSlice {
  viewMode: 'edit' | 'preview' | 'split';
  tocVisible: boolean;
  fontSize: number;
  previewFontSize: number;
  theme: 'light' | 'dark' | 'system';
  locale: Locale;
  setViewMode: (mode: 'edit' | 'preview' | 'split') => void;
  toggleTOC: () => void;
  setFontSize: (size: number) => void;
  setPreviewFontSize: (size: number) => void;
  increasePreviewFontSize: () => void;
  decreasePreviewFontSize: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  toggleLocale: () => void;
}

export const createEditorSlice: StateCreator<EditorSlice, [], [], EditorSlice> = (set) => ({
  viewMode: 'split',
  tocVisible: true,
  fontSize: 14,
  previewFontSize: 16,
  theme: 'system',
  locale: 'zh',
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleTOC: () => set((state) => ({ tocVisible: !state.tocVisible })),
  setFontSize: (size) => set({ fontSize: size }),
  setPreviewFontSize: (size) => set({ previewFontSize: Math.max(12, Math.min(24, size)) }),
  increasePreviewFontSize: () => set((state) => ({
    previewFontSize: Math.min(24, state.previewFontSize + 2),
  })),
  decreasePreviewFontSize: () => set((state) => ({
    previewFontSize: Math.max(12, state.previewFontSize - 2),
  })),
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => {
    const order: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const idx = order.indexOf(state.theme);
    return { theme: order[(idx + 1) % order.length] };
  }),
  toggleLocale: () => set((state) => ({ locale: state.locale === 'zh' ? 'en' : 'zh' })),
});
