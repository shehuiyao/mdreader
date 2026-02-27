import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAppStore } from '../../stores/useAppStore';
import { t } from '../../lib/i18n';

export default function AISummaryCard() {
  const aiSummary = useAppStore((s) => s.aiSummary);
  const aiLoading = useAppStore((s) => s.aiLoading);
  const aiError = useAppStore((s) => s.aiError);
  const aiVisible = useAppStore((s) => s.aiVisible);
  const clearAISummary = useAppStore((s) => s.clearAISummary);
  const setAIVisible = useAppStore((s) => s.setAIVisible);
  const setAILoading = useAppStore((s) => s.setAILoading);
  const locale = useAppStore((s) => s.locale);

  const [collapsed, setCollapsed] = useState(false);

  if (!aiVisible) return null;

  return (
    <div
      className="mx-8 mt-4 mb-2 rounded-lg border"
      style={{
        backgroundColor: 'var(--accent-surface)',
        borderColor: 'var(--accent-border)',
      }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            {t(locale, 'aiSummary')}
          </span>
          {aiLoading && (
            <span
              className="text-xs animate-pulse"
              style={{ color: 'var(--text-muted)' }}
            >
              {t(locale, 'aiSummarizing')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {aiLoading && (
            <button
              className="text-xs hover:opacity-80"
              style={{ color: 'var(--accent-red)' }}
              onClick={() => {
                setAILoading(false);
              }}
            >
              {t(locale, 'aiCancel')}
            </button>
          )}
          <button
            className="text-xs hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? t(locale, 'aiExpand') : t(locale, 'aiCollapse')}
          </button>
          <button
            className="text-xs hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
            onClick={() => {
              setAIVisible(false);
              clearAISummary();
            }}
          >
            {t(locale, 'aiClose')}
          </button>
        </div>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="px-4 pb-3">
          {aiError ? (
            <div className="flex items-center gap-2">
              <p className="text-sm" style={{ color: 'var(--accent-red)' }}>
                {aiError}
              </p>
              <button
                className="text-xs px-2 py-0.5 rounded hover:opacity-80"
                style={{
                  color: 'var(--accent)',
                  border: '1px solid var(--border-subtle)',
                }}
                onClick={() => {
                  clearAISummary();
                  setAIVisible(false);
                  // 用户可通过再次点击 AI 按钮重试
                }}
              >
                {t(locale, 'aiRetry')}
              </button>
            </div>
          ) : aiSummary ? (
            <div
              className="text-sm ai-summary-content"
              style={{ color: 'var(--text-secondary)' }}
            >
              {/* 安全说明：此处故意不使用 rehypeRaw，防止 AI 输出的原始 HTML 被渲染 */}
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {aiSummary}
              </ReactMarkdown>
            </div>
          ) : aiLoading ? (
            <p
              className="text-sm animate-pulse"
              style={{ color: 'var(--text-muted)' }}
            >
              ...
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
