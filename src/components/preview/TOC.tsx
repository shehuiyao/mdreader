import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { useTOC } from '../../hooks/useTOC';
import { t } from '../../lib/i18n';
import type { TOCItem } from '../../types/toc';

// Build a set of parent heading IDs that have children (next item has higher level number = deeper)
function getParentIds(items: TOCItem[]): Set<string> {
  const parents = new Set<string>();
  for (let i = 0; i < items.length - 1; i++) {
    if (items[i + 1].level > items[i].level) {
      parents.add(items[i].id);
    }
  }
  return parents;
}

// Get children IDs for a given parent (all subsequent items with level > parent's level, until same or lower)
function getChildIds(items: TOCItem[], parentIndex: number): Set<string> {
  const parentLevel = items[parentIndex].level;
  const children = new Set<string>();
  for (let i = parentIndex + 1; i < items.length; i++) {
    if (items[i].level <= parentLevel) break;
    children.add(items[i].id);
  }
  return children;
}

export default function TOC() {
  const content = useAppStore((s) => s.content);
  const locale = useAppStore((s) => s.locale);
  const items = useTOC(content);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  const parentIds = useMemo(() => getParentIds(items), [items]);

  // Determine which items are hidden (their parent is collapsed)
  const hiddenIds = useMemo(() => {
    const hidden = new Set<string>();
    for (let i = 0; i < items.length; i++) {
      if (collapsedIds.has(items[i].id)) {
        const children = getChildIds(items, i);
        children.forEach((id) => hidden.add(id));
      }
    }
    return hidden;
  }, [items, collapsedIds]);

  useEffect(() => {
    observerRef.current?.disconnect();

    const container = document.getElementById('preview-container');
    if (!container || items.length === 0) return;

    const timer = setTimeout(() => {
      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
      if (headings.length === 0) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id);
            }
          }
        },
        {
          root: container,
          rootMargin: '0px 0px -80% 0px',
          threshold: 0,
        }
      );

      headings.forEach((heading) => {
        if (heading.id) {
          observerRef.current!.observe(heading);
        }
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      observerRef.current?.disconnect();
    };
  }, [content, items]);

  const handleClick = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const toggleCollapse = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setCollapsedIds(new Set());
  }, []);

  const collapseAll = useCallback(() => {
    setCollapsedIds(new Set(parentIds));
  }, [parentIds]);

  const allCollapsed = parentIds.size > 0 && collapsedIds.size >= parentIds.size;

  return (
    <div
      className="w-[200px] shrink-0 flex flex-col overflow-hidden"
      style={{ borderLeft: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-mantle)' }}
    >
      <div className="px-3 py-2 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          {t(locale, 'toc')}
        </h3>
        {parentIds.size > 0 && (
          <button
            onClick={allCollapsed ? expandAll : collapseAll}
            className="text-[10px] px-1.5 py-0.5 rounded transition-colors duration-150 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.backgroundColor = 'var(--accent-surface)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.backgroundColor = '';
            }}
            title={allCollapsed ? t(locale, 'expandAll') : t(locale, 'collapseAll')}
          >
            {allCollapsed ? t(locale, 'expandAll') : t(locale, 'collapseAll')}
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-1">
        {items.length === 0 ? (
          <p className="px-2 py-4 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            {t(locale, 'noHeadings')}
          </p>
        ) : (
          <ul className="space-y-0.5">
            {items.map((item) => {
              if (hiddenIds.has(item.id)) return null;

              const isActive = activeId === item.id;
              const isParent = parentIds.has(item.id);
              const isCollapsed = collapsedIds.has(item.id);

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleClick(item.id)}
                    className="w-full text-left text-xs py-1 px-2 rounded-sm truncate transition-colors duration-150 cursor-pointer toc-item flex items-center gap-1"
                    style={{
                      paddingLeft: `${(item.level - 1) * 16 + 8}px`,
                      ...(isActive
                        ? {
                            color: 'var(--accent)',
                            backgroundColor: 'var(--accent-surface)',
                            borderLeft: '2px solid var(--accent)',
                            fontWeight: 500,
                          }
                        : {
                            color: 'var(--text-secondary)',
                            borderLeft: '2px solid transparent',
                          }),
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = 'var(--text-primary)';
                        e.currentTarget.style.backgroundColor = 'var(--accent-surface)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = 'var(--text-secondary)';
                        e.currentTarget.style.backgroundColor = '';
                      }
                    }}
                    title={item.text}
                  >
                    {isParent && (
                      <span
                        onClick={(e) => toggleCollapse(item.id, e)}
                        className="inline-flex items-center justify-center w-3 h-3 shrink-0 text-[8px] leading-none rounded transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {isCollapsed ? '\u25B6' : '\u25BC'}
                      </span>
                    )}
                    <span className="truncate">{item.text}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </nav>
    </div>
  );
}
