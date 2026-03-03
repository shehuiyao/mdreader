import { invoke } from '@tauri-apps/api/core';
import type { FileEntry } from '../types/file';

export async function readFile(path: string): Promise<string> {
  return invoke<string>('read_file', { path });
}

export async function writeFile(path: string, content: string): Promise<void> {
  return invoke<void>('write_file', { path, content });
}

export async function listDirectory(path: string): Promise<FileEntry[]> {
  return invoke<FileEntry[]>('list_directory', { path });
}

export async function getPendingFile(): Promise<string | null> {
  return invoke<string | null>('get_pending_file');
}
