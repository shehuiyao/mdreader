import { type JSX, useMemo, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAppStore } from '../../stores/useAppStore';
import AISummaryCard from '../ai/AISummaryCard';
import 'github-markdown-css/github-markdown.css';

// Catppuccin color tokens — keep in sync with App.css
const darkColors = {
  bg: '#1e1e2e',
  text: '#cdd6f4',
};
const lightColors = {
  bg: '#eff1f5',
  text: '#4c4f69',
};

export default function MarkdownPreview() {
  const content = useAppStore((s) => s.content);
  const theme = useAppStore((s) => s.theme);
  const previewFontSize = useAppStore((s) => s.previewFontSize);
  const searchTerm = useAppStore((s) => s.searchTerm);
  const searchVisible = useAppStore((s) => s.searchVisible);
  const searchCurrentIndex = useAppStore((s) => s.searchCurrentIndex);
  const containerRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const colors = isDark ? darkColors : lightColors;

  const stats = useMemo(() => {
    const lines = content ? content.split('\n').length : 0;
    // 同时匹配中文字符和英文单词
    const chineseChars = (content.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;
    const englishWords = (content.match(/[a-zA-Z0-9]+/g) || []).length;
    const words = chineseChars + englishWords;
    return { words, lines };
  }, [content]);

  // Search highlighting via CSS Custom Highlight API
  useEffect(() => {
    const highlights = (CSS as any).highlights as Map<string, any> | undefined;
    if (!highlights) return;

    highlights.delete('search-result');
    highlights.delete('search-current');

    if (!searchVisible || !searchTerm || !containerRef.current) return;

    const termLower = searchTerm.toLowerCase();
    const ranges: Range[] = [];
    const walker = document.createTreeWalker(containerRef.current, NodeFilter.SHOW_TEXT);

    while (walker.nextNode()) {
      const node = walker.currentNode;
      const text = (node.textContent ?? '').toLowerCase();
      let pos = 0;
      while ((pos = text.indexOf(termLower, pos)) !== -1) {
        const range = new Range();
        range.setStart(node, pos);
        range.setEnd(node, pos + searchTerm.length);
        ranges.push(range);
        pos += termLower.length;
      }
    }

    if (ranges.length === 0) return;

    // Highlight all matches
    const HighlightClass = (window as any).Highlight;
    if (!HighlightClass) return;

    highlights.set('search-result', new HighlightClass(...ranges));

    // Highlight current match
    const idx = Math.min(searchCurrentIndex, ranges.length - 1);
    highlights.set('search-current', new HighlightClass(ranges[idx]));

    // Scroll current match into view
    const rect = ranges[idx].getBoundingClientRect();
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    if (rect.top < containerRect.top || rect.bottom > containerRect.bottom) {
      const scrollTop = container.scrollTop + rect.top - containerRect.top - containerRect.height / 3;
      container.scrollTo({ top: scrollTop, behavior: 'smooth' });
    }
  }, [searchTerm, searchVisible, searchCurrentIndex, content]);

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: colors.bg }}>
      <div
        ref={containerRef}
        id="preview-container"
        className="flex-1 overflow-y-auto"
        style={{ scrollBehavior: 'smooth' }}
        data-color-mode={isDark ? 'dark' : 'light'}
        data-dark-theme="dark"
        data-light-theme="light"
      >
        <AISummaryCard />
        <div
          className="markdown-body max-w-full p-8"
          style={{ backgroundColor: colors.bg, color: colors.text, fontSize: `${previewFontSize}px` }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSlug, rehypeRaw]}
            components={{
              code(props): JSX.Element {
                const { children, className, node, ref, ...rest } = props;
                const match = /language-(\w+)/.exec(className || '');
                const isBlock =
                  node?.position &&
                  node.position.start.line !== node.position.end.line;

                if (match && isBlock) {
                  return (
                    <SyntaxHighlighter
                      style={isDark ? oneDark : oneLight}
                      language={match[1]}
                      PreTag="div"
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  );
                }

                return (
                  <code className={className} {...rest}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
      {content && (
        <div
          className="flex-shrink-0 flex items-center gap-4 px-4 py-1 text-xs"
          style={{
            borderTop: '1px solid var(--border-subtle)',
            color: isDark ? '#6c7086' : '#9ca0b0',
            backgroundColor: colors.bg,
          }}
        >
          <span>{stats.words} 字</span>
          <span>{stats.lines} 行</span>
        </div>
      )}
    </div>
  );
}
