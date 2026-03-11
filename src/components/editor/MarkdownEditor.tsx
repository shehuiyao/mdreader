import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { EditorView } from '@codemirror/view';
import { oneDark } from '@codemirror/theme-one-dark';
import { search, setSearchQuery, SearchQuery } from '@codemirror/search';
import { useAppStore } from '../../stores/useAppStore';
import { useCallback, useMemo, useRef, useEffect } from 'react';

/**
 * Catppuccin Mocha (dark) and Latte (light) color tokens — hardcoded here
 * so that EditorView.theme receives concrete values rather than CSS custom
 * properties.  CodeMirror injects its styles into a separate <style> tag
 * that lives outside the `.dark` / `:root` scope, so `var(--bg-base)` etc.
 * may not resolve correctly in all browsers.
 */
const catppuccin = {
  dark: {
    bgBase:     '#1e1e2e',
    bgMantle:   '#181825',
    bgSurface0: '#313244',
    bgSurface1: '#45475a',
    textPrimary:'#cdd6f4',
    textSecondary: '#a6adc8',
    textMuted:  '#6c7086',
    accent:     '#89b4fa',
    accentSurface: 'rgba(137, 180, 250, 0.10)',
    selection:  'rgba(137, 180, 250, 0.25)',
    border:     '#45475a',
  },
  light: {
    bgBase:     '#eff1f5',
    bgMantle:   '#e6e9ef',
    bgSurface0: '#ccd0da',
    bgSurface1: '#bcc0cc',
    textPrimary:'#4c4f69',
    textSecondary: '#6c6f85',
    textMuted:  '#9ca0b0',
    accent:     '#1e66f5',
    accentSurface: 'rgba(30, 102, 245, 0.08)',
    selection:  'rgba(30, 102, 245, 0.18)',
    border:     '#bcc0cc',
  },
} as const;

export default function MarkdownEditor() {
  const content = useAppStore((s) => s.content);
  const setContent = useAppStore((s) => s.setContent);
  const fontSize = useAppStore((s) => s.fontSize);
  const theme = useAppStore((s) => s.theme);
  const searchTerm = useAppStore((s) => s.searchTerm);
  const searchVisible = useAppStore((s) => s.searchVisible);
  const searchCurrentIndex = useAppStore((s) => s.searchCurrentIndex);
  const cmRef = useRef<ReactCodeMirrorRef>(null);

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const extensions = useMemo(
    () => {
      const palette = isDark ? catppuccin.dark : catppuccin.light;

      const exts = [
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        EditorView.lineWrapping,
      ];

      // In dark mode, push oneDark first for its syntax highlighting.
      // Our custom theme below overrides the background / gutter colors.
      if (isDark) {
        exts.push(oneDark);
      }

      // Build the custom Catppuccin theme.
      //
      // KEY FIX: pass `{ dark: true }` as the second argument when in dark
      // mode.  Without this flag the generated selectors target `.cm-light`,
      // while oneDark's selectors target `.cm-dark`, meaning oneDark always
      // wins on specificity and our overrides never apply.  With the flag
      // our selectors also target `.cm-dark` and, because they come later in
      // the extension array, they win by source order.
      exts.push(
        EditorView.theme(
          {
            '&': {
              height: '100%',
              fontSize: `${fontSize}px`,
              backgroundColor: palette.bgBase,
            },
            '.cm-scroller': {
              overflow: 'auto',
              fontFamily: '"SF Mono", "Fira Code", "JetBrains Mono", Menlo, Monaco, Consolas, monospace',
            },
            '.cm-content': {
              fontFamily: '"SF Mono", "Fira Code", "JetBrains Mono", Menlo, Monaco, Consolas, monospace',
              caretColor: palette.textPrimary,
            },
            '.cm-cursor, .cm-dropCursor': {
              borderLeftColor: palette.textPrimary,
            },
            '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
              backgroundColor: palette.selection,
            },
            '.cm-gutters': {
              border: 'none',
              backgroundColor: palette.bgMantle,
              color: palette.textMuted,
            },
            '.cm-lineNumbers .cm-gutterElement': {
              color: palette.textMuted,
            },
            '.cm-activeLineGutter': {
              backgroundColor: palette.bgSurface0,
              color: palette.textSecondary,
            },
            '.cm-activeLine': {
              backgroundColor: palette.accentSurface,
            },
            '.cm-foldGutter .cm-gutterElement': {
              color: palette.textMuted,
            },
            '.cm-matchingBracket': {
              backgroundColor: palette.accentSurface,
              outline: `1px solid ${palette.accent}`,
            },
          },
          { dark: isDark },
        ),
      );

      // Search extension (highlighting only, no panel)
      exts.push(search({ top: false }));

      return exts;
    },
    [fontSize, isDark],
  );

  // Sync search query to CodeMirror
  useEffect(() => {
    const view = cmRef.current?.view;
    if (!view) return;

    if (!searchVisible || !searchTerm) {
      view.dispatch({ effects: setSearchQuery.of(new SearchQuery({ search: '' })) });
      return;
    }

    view.dispatch({
      effects: setSearchQuery.of(new SearchQuery({ search: searchTerm, caseSensitive: false })),
    });
  }, [searchTerm, searchVisible]);

  // Navigate to current match in editor
  useEffect(() => {
    const view = cmRef.current?.view;
    if (!view || !searchVisible || !searchTerm) return;

    const text = view.state.doc.toString().toLowerCase();
    const termLower = searchTerm.toLowerCase();
    const positions: number[] = [];
    let pos = 0;
    while (true) {
      const found = text.indexOf(termLower, pos);
      if (found === -1) break;
      positions.push(found);
      pos = found + termLower.length;
    }

    if (positions.length > 0) {
      const idx = Math.min(searchCurrentIndex, positions.length - 1);
      const from = positions[idx];
      view.dispatch({
        selection: { anchor: from, head: from + searchTerm.length },
        scrollIntoView: true,
      });
    }
  }, [searchCurrentIndex, searchTerm, searchVisible]);

  const onChange = useCallback(
    (value: string) => {
      setContent(value);
    },
    [setContent],
  );

  return (
    <div className="h-full w-full overflow-hidden">
      <CodeMirror
        ref={cmRef}
        value={content}
        extensions={extensions}
        onChange={onChange}
        theme={isDark ? 'dark' : 'light'}
        height="100%"
        style={{ height: '100%' }}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
          bracketMatching: true,
          searchKeymap: false,
        }}
      />
    </div>
  );
}
