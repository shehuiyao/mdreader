import { useEffect } from 'react';
import { useFileOperations } from './useFileOperations';
import { useAppStore } from '../stores/useAppStore';

export function useKeyboardShortcuts() {
  const { openFile, saveFile, saveAs, newFile } = useFileOperations();
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const toggleTOC = useAppStore((s) => s.toggleTOC);

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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openFile, saveFile, saveAs, newFile, toggleSidebar, toggleTOC]);
}
