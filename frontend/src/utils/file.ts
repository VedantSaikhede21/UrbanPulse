export type FileKind = 'image' | 'video' | 'audio' | 'unknown';

/**
 * HEIC/HEIF are the default iPhone camera format. They were rejected outright,
 * so a citizen photographing a pothole on the most common phone in the country
 * got "Unsupported file type: .heic" at the last step of the wizard.
 * AVIF is accepted for the same reason (modern Android/desktop cameras).
 */
export const ACCEPT_IMAGES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/heic-sequence',
  'image/heif-sequence',
  'image/avif',
];

/** Extensions allowed to stand in when the browser reports an empty MIME type. */
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'avif'];

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
  // Some browsers (notably iOS Safari) hand over an empty `type` for camera
  // captures, so fall back to the extension before rejecting.
  const hasKnownMime = ALL_MIME_TYPES.includes(file.type);
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const hasKnownExt = hasKnownMime || IMAGE_EXTENSIONS.includes(ext);

  if (!hasKnownExt) {
    return { valid: false, error: `Unsupported file type: .${ext || 'unknown'}` };
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `File exceeds ${maxSizeMB} MB limit (${formatFileSize(file.size)})` };
  }
  return { valid: true };
}
