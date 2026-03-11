import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../../stores/useAppStore';

export default function SearchBar() {
  const searchVisible = useAppStore((s) => s.searchVisible);
  const searchTerm = useAppStore((s) => s.searchTerm);
  const searchCurrentIndex = useAppStore((s) => s.searchCurrentIndex);
  const searchMatchCount = useAppStore((s) => s.searchMatchCount);
  const setSearchTerm = useAppStore((s) => s.setSearchTerm);
  const setSearchMatchCount = useAppStore((s) => s.setSearchMatchCount);
  const searchNext = useAppStore((s) => s.searchNext);
  const searchPrev = useAppStore((s) => s.searchPrev);
  const closeSearch = useAppStore((s) => s.closeSearch);
  const content = useAppStore((s) => s.content);
  const inputRef = useRef<HTMLInputElement>(null);

  // Compute match count from raw content
  useEffect(() => {
    if (!searchTerm) {
      setSearchMatchCount(0);
      return;
    }
    const lower = content.toLowerCase();
    const termLower = searchTerm.toLowerCase();
    let count = 0;
    let pos = 0;
    while ((pos = lower.indexOf(termLower, pos)) !== -1) {
      count++;
      pos += termLower.length;
    }
    setSearchMatchCount(count);
  }, [content, searchTerm, setSearchMatchCount]);

  useEffect(() => {
    if (searchVisible) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [searchVisible]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeSearch();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          searchPrev();
        } else {
          searchNext();
        }
      }
    },
    [closeSearch, searchNext, searchPrev],
  );

  if (!searchVisible) return null;

  return (
    <div
      className="absolute top-0 right-4 z-50 flex items-center gap-1 px-3 py-1.5 rounded-b-lg shadow-lg"
      style={{
        backgroundColor: 'var(--bg-mantle)',
        border: '1px solid var(--border)',
        borderTop: 'none',
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="搜索..."
        className="w-52 px-2 py-1 text-sm rounded outline-none"
        style={{
          backgroundColor: 'var(--bg-base)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-subtle)',
        }}
      />

      {/* Match count */}
      <span
        className="text-xs min-w-[4rem] text-center select-none"
        style={{ color: 'var(--text-muted)' }}
      >
        {searchTerm
          ? searchMatchCount > 0
            ? `${searchCurrentIndex + 1} / ${searchMatchCount}`
            : '无结果'
          : ''}
      </span>

      {/* Previous */}
      <button
        onClick={searchPrev}
        disabled={searchMatchCount === 0}
        className="p-1 rounded hover:opacity-80 disabled:opacity-30"
        style={{ color: 'var(--text-secondary)' }}
        title="上一个 (Shift+Enter)"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 4l-4 4h8z" />
        </svg>
      </button>

      {/* Next */}
      <button
        onClick={searchNext}
        disabled={searchMatchCount === 0}
        className="p-1 rounded hover:opacity-80 disabled:opacity-30"
        style={{ color: 'var(--text-secondary)' }}
        title="下一个 (Enter)"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 12l4-4H4z" />
        </svg>
      </button>

      {/* Close */}
      <button
        onClick={closeSearch}
        className="p-1 rounded hover:opacity-80"
        style={{ color: 'var(--text-secondary)' }}
        title="关闭 (Esc)"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4.11 3.05L8 6.94l3.89-3.89.71.71L8.71 7.65l3.89 3.89-.71.71L8 8.36l-3.89 3.89-.71-.71 3.89-3.89L3.4 3.76z" />
        </svg>
      </button>
    </div>
  );
}
