export interface TOCItem {
  id: string;       // slug, matches rehype-slug output
  text: string;     // heading text
  level: number;    // 1-6
}
