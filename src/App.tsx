import { useEffect } from 'react';
import './App.css';
import { useAppStore } from './stores/useAppStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useFileWatcher } from './hooks/useFileWatcher';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import MainContent from './components/layout/MainContent';
import TOC from './components/preview/TOC';
import { loadSettings, saveSetting } from './hooks/useSettings';

function App() {
  const sidebarVisible = useAppStore((s) => s.sidebarVisible);
  const tocVisible = useAppStore((s) => s.tocVisible);
  const theme = useAppStore((s) => s.theme);
  const previewFontSize = useAppStore((s) => s.previewFontSize);
  const setPreviewFontSize = useAppStore((s) => s.setPreviewFontSize);
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

  useEffect(() => {
    const initSettings = async () => {
      const settings = await loadSettings();
      if (typeof settings.previewFontSize === 'number') {
        setPreviewFontSize(settings.previewFontSize);
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
    </div>
  );
}

export default App;
