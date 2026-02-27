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
import { loadSettings, saveSetting } from './hooks/useSettings';
import { readFile } from './lib/tauri';

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

  // Listen for file open events from macOS (double-click .md files)
  useEffect(() => {
    const unlisten = listen<string>('open-file', async (event) => {
      const path = event.payload;
      const name = path.split('/').pop() ?? path;
      try {
        const content = await readFile(path);
        openFile(path, name, content);
        addRecentFile(path, name);
      } catch (e) {
        console.error('Failed to open file:', e);
      }
    });
    return () => { void unlisten.then((fn) => fn()); };
  }, [openFile, addRecentFile]);

  useEffect(() => {
    const initSettings = async () => {
      const settings = await loadSettings();
      if (typeof settings.previewFontSize === 'number') {
        setPreviewFontSize(settings.previewFontSize);
      }
      const { setAIConfig } = useAppStore.getState();
      setAIConfig({
        baseUrl: settings.aiBaseUrl ?? '',
        apiKey: settings.aiApiKey ?? '',
        model: settings.aiModel ?? '',
      });
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
    </div>
  );
}

export default App;
