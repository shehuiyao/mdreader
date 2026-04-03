import { useEffect } from 'react';
import { useFileOperations } from './useFileOperations';
import { useAppStore } from '../stores/useAppStore';

export function useKeyboardShortcuts() {
  const { openFile, saveFile, saveAs, newFile } = useFileOperations();
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const toggleTOC = useAppStore((s) => s.toggleTOC);
  const toggleSearch = useAppStore((s) => s.toggleSearch);
  const switchToPrevFile = useAppStore((s) => s.switchToPrevFile);
  const switchToNextFile = useAppStore((s) => s.switchToNextFile);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.metaKey) return;

      switch (e.key.toLowerCase()) {
        case 'o':
          e.preventDefault();
          openFile();
          break;
        case 's':
          e.preventDefault();
          if (e.shiftKey) {
            saveAs();
          } else {
            saveFile();
          }
          break;
        case 'n':
          e.preventDefault();
          newFile();
          break;
        case 'b':
          e.preventDefault();
          toggleSidebar();
          break;
        case 't':
          if (e.shiftKey) {
            e.preventDefault();
            toggleTOC();
          }
          break;
        case 'f':
          e.preventDefault();
          toggleSearch();
          break;
        case '[':
          e.preventDefault();
          switchToPrevFile();
          break;
        case ']':
          e.preventDefault();
          switchToNextFile();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openFile, saveFile, saveAs, newFile, toggleSidebar, toggleTOC, toggleSearch, switchToPrevFile, switchToNextFile]);
}
