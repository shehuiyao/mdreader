import { useAppStore } from '../../stores/useAppStore';
import { t } from '../../lib/i18n';

export default function SidebarTabs() {
  const activeTab = useAppStore((s) => s.sidebarTab);
  const setTab = useAppStore((s) => s.setSidebarTab);
  const locale = useAppStore((s) => s.locale);
  const tabs = [
    { key: 'files' as const, labelKey: 'files' as const },
    { key: 'recent' as const, labelKey: 'recent' as const },
  ];

  return (
    <div
      className="flex"
      style={{
        backgroundColor: 'var(--bg-mantle)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => setTab(tab.key)}
            className="flex-1 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer"
            style={{
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)';
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            {t(locale, tab.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
