export type FileKind = 'image' | 'video' | 'audio' | 'unknown';

export const ACCEPT_IMAGES = ['image/jpeg', 'image/png', 'image/webp'];
export const ACCEPT_VIDEO = ['video/mp4', 'video/quicktime', 'video/webm'];
export const ACCEPT_AUDIO = ['audio/webm', 'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a'];

export const ALL_MIME_TYPES = [...ACCEPT_IMAGES, ...ACCEPT_VIDEO, ...ACCEPT_AUDIO];
export const ACCEPT_STRING = ALL_MIME_TYPES.join(',');

export function getFileKind(mime: string): FileKind {
  if (ACCEPT_IMAGES.includes(mime)) return 'image';
  if (ACCEPT_VIDEO.includes(mime)) return 'video';
  if (ACCEPT_AUDIO.includes(mime)) return 'audio';
  return 'unknown';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export interface FileValidation {
  valid: boolean;
  error?: string;
}

export function validateFile(file: File, maxSizeMB: number): FileValidation {
  if (!ALL_MIME_TYPES.includes(file.type)) {
    const ext = file.name.split('.').pop() || '';
    return { valid: false, error: `Unsupported file type: .${ext}` };
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `File exceeds ${maxSizeMB} MB limit (${formatFileSize(file.size)})` };
  }
  return { valid: true };
}
