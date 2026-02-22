import { LazyStore } from '@tauri-apps/plugin-store';
import type { RecentFile } from '../types/file';

const store = new LazyStore('recent-files.json');

export async function loadRecentFiles(): Promise<RecentFile[]> {
  try {
    const files = await store.get<RecentFile[]>('recentFiles');
    return files ?? [];
  } catch {
    return [];
  }
}

export async function persistRecentFiles(files: RecentFile[]): Promise<void> {
  await store.set('recentFiles', files);
  await store.save();
}
