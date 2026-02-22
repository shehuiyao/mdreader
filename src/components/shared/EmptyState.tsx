import { useAppStore } from '../../stores/useAppStore';
import { t } from '../../lib/i18n';
import { useFileOperations } from '../../hooks/useFileOperations';

export default function EmptyState() {
  const locale = useAppStore((s) => s.locale);
  const { openFile } = useFileOperations();

  return (
    <div className="h-full flex flex-col items-center justify-center select-none">
      <div className="text-5xl font-extralight tracking-tight mb-4" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>{t(locale, 'appTitle')}</div>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>{t(locale, 'openFileToStart')}</p>
      <button
        onClick={openFile}
        className="px-6 py-3 mb-6 text-sm font-medium rounded-lg transition-opacity hover:opacity-90"
        style={{ backgroundColor: 'var(--accent-blue)', color: '#ffffff' }}
      >
        {t(locale, 'openFileButton')}
      </button>
      <div className="text-xs space-y-1" style={{ color: 'var(--text-muted)' }}>
        <div>
          <kbd
            className="px-1.5 py-0.5 rounded-md text-xs"
            style={{ backgroundColor: 'var(--bg-surface0)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
          >
            &#8984;O
          </kbd>
          <span className="ml-2">{t(locale, 'openFile')}</span>
        </div>
      </div>
    </div>
  );
}
