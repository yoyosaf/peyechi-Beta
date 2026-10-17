import JSZip from 'jszip';
import { ArchiveStats, ZipEntryMeta, ZipTreeNode } from '../types/zip';

export function getFileCategory(extension: string): ZipEntryMeta['category'] {
  const ext = extension.toLowerCase();
  if (['ts', 'tsx', 'js', 'jsx', 'json', 'html', 'css', 'scss', 'py', 'java', 'c', 'cpp', 'rs', 'go', 'php', 'rb', 'sh', 'bash', 'sql', 'xml', 'yaml', 'yml'].includes(ext)) {
    return 'code';
  }
  if (['txt', 'md', 'markdown', 'log', 'ini', 'cfg', 'conf', 'env', 'gitignore', 'license', 'rtf'].includes(ext)) {
    return 'text';
  }
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico', 'avif', 'tiff'].includes(ext)) {
    return 'image';
  }
  if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(ext)) {
    return 'audio';
  }
  if (['csv', 'tsv'].includes(ext)) {
    return 'data';
  }
  if (['zip', 'tar', 'gz', 'bz2', '7z', 'rar', 'jar', 'apk', 'cbz'].includes(ext)) {
    return 'archive';
  }
  return 'binary';
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  if (i < 0) return `${bytes} B`;
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i] || 'B'}`;
}

export function formatCrc32(crc?: number): string {
  if (crc === undefined || crc === null) return 'N/A';
  // convert unsigned 32-bit int to uppercase 8-char hex
  return (crc >>> 0).toString(16).toUpperCase().padStart(8, '0');
}

export async function parseZipArchive(
  fileOrBuffer: File | Blob | ArrayBuffer,
  fileName: string
): Promise<{
  zipInstance: JSZip;
  entries: ZipEntryMeta[];
  tree: ZipTreeNode;
  stats: ArchiveStats;
}> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(fileOrBuffer);

  const entries: ZipEntryMeta[] = [];
  let totalFiles = 0;
  let totalFolders = 0;
  let uncompressedTotal = 0;
  let compressedTotal = 0;
  let earliestDate: Date | null = null;
  let latestDate: Date | null = null;

  const fileKeys = Object.keys(loadedZip.files);

  for (const relativePath of fileKeys) {
    const zipObj = loadedZip.files[relativePath];
    const isDir = zipObj.dir || relativePath.endsWith('/');
    const cleanPath = relativePath.replace(/\/$/, '');
    const pathParts = cleanPath.split('/');
    const name = pathParts[pathParts.length - 1] || cleanPath;

    let ext = '';
    if (!isDir && name.includes('.')) {
      ext = name.split('.').pop() || '';
    }

    // Access internal JSZip properties safely if present
    const rawData = (zipObj as unknown as { _data?: { uncompressedSize?: number; compressedSize?: number; crc32?: number } })._data;
    
    // Calculate or infer size
    let uncompressedSize = 0;
    if (rawData?.uncompressedSize !== undefined) {
      uncompressedSize = rawData.uncompressedSize;
    } else if (!isDir) {
      try {
        const u8 = await zipObj.async('uint8array');
        uncompressedSize = u8.length;
      } catch {
        uncompressedSize = 0;
      }
    }

    const compressedSize = rawData?.compressedSize !== undefined ? rawData.compressedSize : Math.round(uncompressedSize * 0.75);
    const crcVal = rawData?.crc32;
    const date = zipObj.date ? new Date(zipObj.date) : new Date();

    if (!isDir) {
      totalFiles++;
      uncompressedTotal += uncompressedSize;
      compressedTotal += compressedSize;
    } else {
      totalFolders++;
    }

    if (!earliestDate || date < earliestDate) earliestDate = date;
    if (!latestDate || date > latestDate) latestDate = date;

    let savedPct = 0;
    if (uncompressedSize > 0 && compressedSize > 0) {
      savedPct = Math.max(0, Math.round(((uncompressedSize - compressedSize) / uncompressedSize) * 100));
    }

    entries.push({
      id: relativePath,
      name,
      path: relativePath,
      dir: isDir,
      size: uncompressedSize,
      compressedSize: compressedSize,
      compressionRatio: savedPct,
      date,
      crc32: formatCrc32(crcVal),
      comment: zipObj.comment || undefined,
      extension: ext,
      category: isDir ? 'directory' : getFileCategory(ext),
    });
  }

  // Sort entries: directories first, then alphabetical by path
  entries.sort((a, b) => {
    if (a.dir && !b.dir) return -1;
    if (!a.dir && b.dir) return 1;
    return a.path.localeCompare(b.path);
  });

  const overallSaved =
    uncompressedTotal > 0
      ? Math.max(0, Math.round(((uncompressedTotal - compressedTotal) / uncompressedTotal) * 100))
      : 0;

  const stats: ArchiveStats = {
    filename: fileName,
    totalFiles,
    totalFolders,
    uncompressedSize: uncompressedTotal,
    compressedSize: compressedTotal,
    savedPercentage: overallSaved,
    earliestDate,
    latestDate,
    integrityStatus: 'untested',
  };

  const tree = buildTree(entries);

  return {
    zipInstance: loadedZip,
    entries,
    tree,
    stats,
  };
}

function buildTree(entries: ZipEntryMeta[]): ZipTreeNode {
  const root: ZipTreeNode = {
    name: 'root',
    path: '',
    isDir: true,
    children: [],
    fileCount: 0,
    totalSize: 0,
  };

  for (const entry of entries) {
    const rawPath = entry.path.replace(/\/$/, '');
    const parts = rawPath.split('/');

    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const subPath = parts.slice(0, i + 1).join('/') + (isLast && entry.dir ? '/' : '');

      let child = current.children.find((c) => c.name === part);

      if (!child) {
        child = {
          name: part,
          path: subPath,
          isDir: !isLast || entry.dir,
          children: [],
          entry: isLast ? entry : undefined,
          fileCount: 0,
          totalSize: 0,
        };
        current.children.push(child);
      } else if (isLast && entry) {
        child.entry = entry;
      }

      current = child;
    }
  }

  // Calculate recursive sizes and file counts
  function calculateAggregates(node: ZipTreeNode): { files: number; size: number } {
    let files = 0;
    let size = 0;

    if (!node.isDir && node.entry) {
      files = 1;
      size = node.entry.size;
    } else {
      for (const child of node.children) {
        const childStats = calculateAggregates(child);
        files += childStats.files;
        size += childStats.size;
      }
    }

    node.fileCount = files;
    node.totalSize = size;
    return { files, size };
  }

  calculateAggregates(root);

  // Sort children: directories first, then alphabetical
  function sortNodeChildren(node: ZipTreeNode) {
    node.children.sort((a, b) => {
      if (a.isDir && !b.isDir) return -1;
      if (!a.isDir && b.isDir) return 1;
      return a.name.localeCompare(b.name);
    });
    for (const child of node.children) {
      if (child.isDir) {
        sortNodeChildren(child);
      }
    }
  }

  sortNodeChildren(root);
  return root;
}

export async function verifyArchiveIntegrity(
  zip: JSZip,
  onProgress?: (checked: number, total: number) => void
): Promise<{ isValid: boolean; corruptedFiles: string[] }> {
  const corruptedFiles: string[] = [];
  const fileKeys = Object.keys(zip.files).filter((k) => !zip.files[k].dir);
  let checked = 0;

  for (const path of fileKeys) {
    try {
      await zip.files[path].async('uint8array');
    } catch {
      corruptedFiles.push(path);
    }
    checked++;
    if (onProgress) {
      onProgress(checked, fileKeys.length);
    }
  }

  return {
    isValid: corruptedFiles.length === 0,
    corruptedFiles,
  };
}

export async function extractFileContent(
  zip: JSZip,
  path: string,
  type: 'text' | 'base64' | 'uint8array' | 'blob'
): Promise<string | Uint8Array | Blob> {
  const file = zip.file(path);
  if (!file) {
    throw new Error(`File not found: ${path}`);
  }

  if (type === 'text') {
    return await file.async('text');
  }
  if (type === 'base64') {
    return await file.async('base64');
  }
  if (type === 'uint8array') {
    return await file.async('uint8array');
  }
  return await file.async('blob');
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
