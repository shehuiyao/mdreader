import { useCallback } from 'react';
import { open, save } from '@tauri-apps/plugin-dialog';
import { useAppStore } from '../stores/useAppStore';
import { readFile, writeFile } from '../lib/tauri';

export function useFileOperations() {
  const currentFilePath = useAppStore((s) => s.currentFilePath);
  const content = useAppStore((s) => s.content);
  const isDirty = useAppStore((s) => s.isDirty);
  const openFileAction = useAppStore((s) => s.openFile);
  const markSavedAction = useAppStore((s) => s.markSaved);
  const closeFileAction = useAppStore((s) => s.closeFile);
  const addRecentFile = useAppStore((s) => s.addRecentFile);

  const handleOpenFile = useCallback(async () => {
    const selected = await open({
      filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }],
    });
    if (selected) {
      const path = selected as string;
      const name = path.split('/').pop() ?? path;
      const fileContent = await readFile(path);
      openFileAction(path, name, fileContent);
      addRecentFile(path, name);
    }
  }, [openFileAction, addRecentFile]);

  const handleSaveFile = useCallback(async () => {
    if (!currentFilePath) return;
    await writeFile(currentFilePath, content);
    markSavedAction();
  }, [currentFilePath, content, markSavedAction]);

  const handleSaveAs = useCallback(async () => {
    const selected = await save({
      filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }],
    });
    if (selected) {
      const path = selected as string;
      const name = path.split('/').pop() ?? path;
      await writeFile(path, content);
      openFileAction(path, name, content);
      markSavedAction();
      addRecentFile(path, name);
    }
  }, [content, openFileAction, markSavedAction, addRecentFile]);

  const handleNewFile = useCallback(() => {
    closeFileAction();
  }, [closeFileAction]);

  return {
    openFile: handleOpenFile,
    saveFile: handleSaveFile,
    saveAs: handleSaveAs,
    newFile: handleNewFile,
    isDirty,
    currentFilePath,
  };
}
