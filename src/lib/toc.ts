import { unified } from 'unified';
import remarkParse from 'remark-parse';
import GithubSlugger from 'github-slugger';
import type { TOCItem } from '../types/toc';

export function extractTOC(markdown: string): TOCItem[] {
  const tree = unified().use(remarkParse).parse(markdown);
  const slugger = new GithubSlugger();
  const items: TOCItem[] = [];

  function getTextContent(node: any): string {
    if (node.type === 'text') return node.value;
    if (node.children) return node.children.map(getTextContent).join('');
    return '';
  }

  function walk(node: any) {
    if (node.type === 'heading') {
      const text = getTextContent(node);
      const id = slugger.slug(text);
      items.push({ id, text, level: node.depth });
    }
    if (node.children) {
      node.children.forEach(walk);
    }
  }

  walk(tree);
  return items;
}
