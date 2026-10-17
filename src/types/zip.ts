export interface ZipEntryMeta {
  id: string;
  name: string;
  path: string;
  dir: boolean;
  size: number; // uncompressed
  compressedSize: number; // compressed in archive
  compressionRatio: number; // percentage saved, e.g. 64%
  date: Date;
  crc32: string; // hex formatted CRC32 checksum
  comment?: string;
  extension: string;
  category: 'code' | 'text' | 'image' | 'audio' | 'data' | 'archive' | 'binary' | 'directory';
}

export interface ZipTreeNode {
  name: string;
  path: string;
  isDir: boolean;
  children: ZipTreeNode[];
  entry?: ZipEntryMeta;
  fileCount: number;
  totalSize: number;
}

export interface ArchiveStats {
  filename: string;
  totalFiles: number;
  totalFolders: number;
  uncompressedSize: number;
  compressedSize: number;
  savedPercentage: number;
  earliestDate: Date | null;
  latestDate: Date | null;
  integrityStatus: 'untested' | 'checking' | 'valid' | 'corrupted';
  corruptedFiles?: string[];
}

export type ViewMode = 'tree' | 'table';

export type PreviewTab = 'preview' | 'hex' | 'edit';
