import { StateCreator } from 'zustand';

export interface SearchSlice {
  searchVisible: boolean;
  searchTerm: string;
  searchCurrentIndex: number;
  searchMatchCount: number;
  setSearchVisible: (visible: boolean) => void;
  toggleSearch: () => void;
  setSearchTerm: (term: string) => void;
  setSearchCurrentIndex: (index: number) => void;
  setSearchMatchCount: (count: number) => void;
  searchNext: () => void;
  searchPrev: () => void;
  closeSearch: () => void;
}

export const createSearchSlice: StateCreator<SearchSlice, [], [], SearchSlice> = (set) => ({
  searchVisible: false,
  searchTerm: '',
  searchCurrentIndex: 0,
  searchMatchCount: 0,
  setSearchVisible: (visible) => set({ searchVisible: visible }),
  toggleSearch: () =>
    set((state) => {
      if (state.searchVisible) {
        return { searchVisible: false, searchTerm: '', searchMatchCount: 0, searchCurrentIndex: 0 };
      }
      return { searchVisible: true };
    }),
  setSearchTerm: (term) => set({ searchTerm: term, searchCurrentIndex: 0 }),
  setSearchCurrentIndex: (index) => set({ searchCurrentIndex: index }),
  setSearchMatchCount: (count) => set({ searchMatchCount: count }),
  searchNext: () =>
    set((state) => {
      if (state.searchMatchCount === 0) return state;
      return { searchCurrentIndex: (state.searchCurrentIndex + 1) % state.searchMatchCount };
    }),
  searchPrev: () =>
    set((state) => {
      if (state.searchMatchCount === 0) return state;
      return {
        searchCurrentIndex:
          (state.searchCurrentIndex - 1 + state.searchMatchCount) % state.searchMatchCount,
      };
    }),
  closeSearch: () =>
    set({ searchVisible: false, searchTerm: '', searchMatchCount: 0, searchCurrentIndex: 0 }),
});
