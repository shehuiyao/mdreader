import { type JSX, useMemo } from 'react';
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

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: colors.bg }}>
      <div
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
