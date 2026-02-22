export interface FileEntry {
  name: string;
  path: string;
  is_directory: boolean;
  children?: FileEntry[];
}

export interface RecentFile {
  path: string;
  name: string;
  lastOpened: number; // timestamp
  pinned?: boolean;
}
