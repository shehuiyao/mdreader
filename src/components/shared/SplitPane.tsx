import { useCallback, useRef, useState, type ReactNode } from 'react';

interface SplitPaneProps {
  left: ReactNode;
  right: ReactNode;
}

export default function SplitPane({ left, right }: SplitPaneProps) {
  const [splitPercent, setSplitPercent] = useState(50);
  const [dividerHovered, setDividerHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((ev.clientX - rect.left) / rect.width) * 100;
      setSplitPercent(Math.min(80, Math.max(20, pct)));
    };

    const onMouseUp = () => {
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, []);

  return (
    <div ref={containerRef} className="flex h-full w-full">
      <div className="overflow-hidden" style={{ width: `${splitPercent}%` }}>
        {left}
      </div>
      <div
        className="w-1 flex-shrink-0 cursor-col-resize transition-colors"
        style={{ backgroundColor: dividerHovered ? 'var(--accent)' : 'var(--border-subtle)' }}
        onMouseEnter={() => setDividerHovered(true)}
        onMouseLeave={() => setDividerHovered(false)}
        onMouseDown={onMouseDown}
      />
      <div className="overflow-hidden flex-1">
        {right}
      </div>
    </div>
  );
}
