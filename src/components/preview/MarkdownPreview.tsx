import type { JSX } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAppStore } from '../../stores/useAppStore';
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

  return (
    <div
      id="preview-container"
      className="h-full overflow-y-auto"
      style={{ scrollBehavior: 'smooth', backgroundColor: colors.bg }}
      data-color-mode={isDark ? 'dark' : 'light'}
      data-dark-theme="dark"
      data-light-theme="light"
    >
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
  );
}
