import { useEffect, useRef } from 'react';
import { watch, type UnwatchFn } from '@tauri-apps/plugin-fs';
import { useAppStore } from '../stores/useAppStore';
import { readFile } from '../lib/tauri';

export function useFileWatcher() {
  const currentFilePath = useAppStore((s) => s.currentFilePath);
  const unwatchRef = useRef<UnwatchFn | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Clean up previous watcher
    if (unwatchRef.current) {
      unwatchRef.current();
      unwatchRef.current = null;
    }

    if (!currentFilePath) return;

    const setupWatcher = async () => {
      try {
        unwatchRef.current = await watch(currentFilePath, (event) => {
          const eventType = event.type;
          // Check if the event indicates a file modification
          const isModify =
            typeof eventType === 'object'
              ? 'modify' in eventType || 'create' in eventType
              : false;

          if (!isModify) return;

          const state = useAppStore.getState();
          if (state.isDirty || !state.currentFilePath) return;

          readFile(state.currentFilePath)
            .then((newContent) => {
              if (cancelled) return;
              const current = useAppStore.getState();
              if (!current.isDirty && newContent !== current.content) {
                current.openFile(current.currentFilePath!, current.currentFileName!, newContent);
              }
            })
            .catch((err) => {
              console.error('File watcher: failed to reload file:', err);
            });
        }, { recursive: false });
      } catch (err) {
        console.error('Failed to set up file watcher:', err);
      }
    };

    setupWatcher();

    return () => {
      cancelled = true;
      if (unwatchRef.current) {
        unwatchRef.current();
        unwatchRef.current = null;
      }
    };
  }, [currentFilePath]);
}
