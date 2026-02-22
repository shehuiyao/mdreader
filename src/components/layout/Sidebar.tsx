import { useAppStore } from '../../stores/useAppStore';
import SidebarTabs from '../sidebar/SidebarTabs';
import FileTree from '../sidebar/FileTree';
import RecentFiles from '../sidebar/RecentFiles';

export default function Sidebar() {
  const sidebarTab = useAppStore((s) => s.sidebarTab);

  return (
    <div className="w-60 flex-shrink-0 flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-mantle)', borderRight: '1px solid var(--border-subtle)' }}>
      <SidebarTabs />
      <div className="flex-1 overflow-y-auto">
        {sidebarTab === 'files' ? <FileTree /> : <RecentFiles />}
      </div>
    </div>
  );
}
