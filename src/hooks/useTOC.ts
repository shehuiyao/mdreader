import { useMemo } from 'react';
import { extractTOC } from '../lib/toc';
import type { TOCItem } from '../types/toc';

export function useTOC(content: string): TOCItem[] {
  return useMemo(() => extractTOC(content), [content]);
}
