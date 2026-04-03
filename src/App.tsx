import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import './App.css';
import { useAppStore } from './stores/useAppStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useFileWatcher } from './hooks/useFileWatcher';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import MainContent from './components/layout/MainContent';
import TOC from './components/preview/TOC';
import StatusBar from './components/layout/StatusBar';
import SettingsModal from './components/ai/SettingsModal';
import { loadSettings, saveSetting } from './hooks/useSettings';
import { readFile, getPendingFile, listDirectory } from './lib/tauri';

function App() {
  const sidebarVisible = useAppStore((s) => s.sidebarVisible);
  const tocVisible = useAppStore((s) => s.tocVisible);
  const theme = useAppStore((s) => s.theme);
  const previewFontSize = useAppStore((s) => s.previewFontSize);
  const setPreviewFontSize = useAppStore((s) => s.setPreviewFontSize);
  const openFile = useAppStore((s) => s.openFile);
  const addRecentFile = useAppStore((s) => s.addRecentFile);
  useKeyboardShortcuts();
  useFileWatcher();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // system
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent | MediaQueryList) => {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      };
      handler(mq);
      mq.addEventListener('change', handler as (e: MediaQueryListEvent) => void);
      return () => mq.removeEventListener('change', handler as (e: MediaQueryListEvent) => void);
    }
  }, [theme]);

  // Listen for file open events from macOS (double-click / right-click open .md files)
  useEffect(() => {
    const handleFilePath = async (path: string) => {
      const name = path.split('/').pop() ?? path;
      try {
        const content = await readFile(path);
        openFile(path, name, content);
        addRecentFile(path, name);
      } catch (e) {
        console.error('Failed to open file:', e);
      }
    };

    // Check for file path that arrived before frontend was ready
    getPendingFile().then((path) => {
      if (path) void handleFilePath(path);
    });

    // Listen for subsequent open events (app already running)
    const unlisten = listen<string>('open-file', (event) => {
      void handleFilePath(event.payload);
    });
    return () => { void unlisten.then((fn) => fn()); };
  }, [openFile, addRecentFile]);

  useEffect(() => {
    const initSettings = async () => {
      const settings = await loadSettings();
      if (typeof settings.previewFontSize === 'number') {
        setPreviewFontSize(settings.previewFontSize);
      }
      const { setAIConfig, setRootFolder, setSidebarTab } = useAppStore.getState();
      setAIConfig({
        baseUrl: settings.aiBaseUrl ?? '',
        apiKey: settings.aiApiKey ?? '',
        model: settings.aiModel ?? '',
      });

      if (settings.lastRootFolderPath) {
        try {
          const entries = await listDirectory(settings.lastRootFolderPath);
          setRootFolder(settings.lastRootFolderPath, entries);
          setSidebarTab('files');
        } catch (error) {
          console.warn('Failed to restore last root folder, clearing saved path:', error);
          await saveSetting('lastRootFolderPath', null);
        }
      }
    };
    void initSettings();
  }, [setPreviewFontSize]);

  useEffect(() => {
    void saveSetting('previewFontSize', previewFontSize);
  }, [previewFontSize]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-base)' }}>
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {sidebarVisible && <Sidebar />}
        <MainContent />
        {tocVisible && <TOC />}
      </div>
      <StatusBar />
      <SettingsModal />
    </div>
  );
}

export default App;
