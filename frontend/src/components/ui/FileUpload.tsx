import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Upload, X, FileAudio, File, AlertCircle } from 'lucide-react';
import { formatFileSize, getFileKind, validateFile, ACCEPT_STRING, type FileKind } from '../../utils/file';

export type UploadState = 'local' | 'uploading' | 'uploaded' | 'failed';

export interface FileData {
  id: string;
  file: File;
  preview: string;
  kind: FileKind;
  name: string;
  size: number;
  lastModified: number;
  uploadState: UploadState;
}

interface FileUploadError {
  id: string;
  message: string;
}

interface FileUploadProps {
  value: FileData[];
  onChange: (files: FileData[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  disabled?: boolean;
  className?: string;
  multi?: boolean;
}

const FileCard: React.FC<{
  file: FileData;
  onRemove: (id: string) => void;
  disabled: boolean;
  cardRef?: React.Ref<HTMLDivElement>;
  tabIndex?: number;
}> = ({ file, onRemove, disabled, cardRef, tabIndex }) => {
  return (
    <div
      ref={cardRef}
      tabIndex={tabIndex ?? -1}
      className="relative group bg-panel-card border border-panel-border rounded-lg overflow-hidden animate-fade-in-up outline-none focus-visible:ring-1 focus-visible:ring-brand-lime"
    >
      <div className="aspect-video overflow-hidden bg-black">
        {file.kind === 'image' && (
          <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
        )}
        {file.kind === 'video' && (
          <video src={file.preview} controls className="w-full h-full object-contain" />
        )}
        {file.kind === 'audio' && (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-panel-bg p-2">
            <FileAudio size={28} className="text-brand-lime shrink-0" />
            <audio src={file.preview} controls className="w-full h-8 max-w-full" />
          </div>
        )}
        {file.kind === 'unknown' && (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-panel-bg">
            <File size={28} className="text-gray-500" />
            <span className="text-[10px] text-gray-500 font-mono">Unknown</span>
          </div>
        )}
      </div>

      {!disabled && (
        <button
          type="button"
          onClick={() => onRemove(file.id)}
          className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 hover:bg-black opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none"
          aria-label={`Remove ${file.name}`}
        >
          <X size={12} />
        </button>
      )}

      <div className="p-2 space-y-0.5">
        <p className="text-[10px] text-gray-300 truncate leading-tight" title={file.name}>{file.name}</p>
        <p className="text-[9px] text-gray-500 font-mono">{formatFileSize(file.size)}</p>
      </div>
    </div>
  );
};

export const FileUpload: React.FC<FileUploadProps> = ({
  value,
  onChange,
  maxFiles = 5,
  maxSizeMB = 20,
  disabled = false,
  className = '',
  multi = true,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<FileUploadError[]>([]);
  const errorsRef = useRef<HTMLDivElement>(null);
  const fileCardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const trackedUrls = useRef<Set<string>>(new Set());

  const revokeUrl = useCallback((url: string) => {
    if (trackedUrls.current.has(url)) {
      URL.revokeObjectURL(url);
      trackedUrls.current.delete(url);
    }
  }, []);

  useEffect(() => {
    return () => {
      trackedUrls.current.forEach(url => URL.revokeObjectURL(url));
      trackedUrls.current.clear();
    };
  }, []);

  const isDuplicate = useCallback((file: File): boolean => {
    return value.some(
      existing =>
        existing.name === file.name &&
        existing.size === file.size &&
        existing.lastModified === file.lastModified
    );
  }, [value]);

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    const newErrors: FileUploadError[] = [];
    const remaining = maxFiles - value.length;
    const toAdd = files.slice(0, Math.max(0, remaining));

    if (files.length > remaining) {
      newErrors.push({
        id: `max-${Date.now()}`,
        message: `Maximum ${maxFiles} files allowed. ${files.length - remaining} file(s) not added.`,
      });
    }

    const validFiles: FileData[] = [];

    for (const file of toAdd) {
      if (isDuplicate(file)) {
        newErrors.push({ id: `${file.name}-${Date.now()}`, message: `${file.name}: Already added.` });
        continue;
      }

      const result = validateFile(file, maxSizeMB);
      if (!result.valid) {
        newErrors.push({ id: `${file.name}-${Date.now()}`, message: `${file.name}: ${result.error}` });
        continue;
      }

      const id = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const preview = URL.createObjectURL(file);
      trackedUrls.current.add(preview);

      validFiles.push({
        id,
        file,
        preview,
        kind: getFileKind(file.type),
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
        uploadState: 'local',
      });
    }

    if (newErrors.length > 0) {
      setErrors(prev => [...prev, ...newErrors]);
      setTimeout(() => setErrors([]), 5000);
    }

    if (validFiles.length > 0) {
      onChange(multi ? [...value, ...validFiles] : validFiles);
    }
  }, [value, onChange, maxFiles, maxSizeMB, multi, isDuplicate]);

  const removeFile = useCallback((id: string) => {
    const file = value.find(f => f.id === id);
    if (file) revokeUrl(file.preview);
    const remaining = value.filter(f => f.id !== id);
    onChange(remaining);

    requestAnimationFrame(() => {
      const cards = Array.from(fileCardRefs.current.entries());
      const nextCard = cards.find(([fid]) => fid !== id);
      if (nextCard) {
        nextCard[1]?.focus();
      } else {
        dropZoneRef.current?.focus();
      }
    });
  }, [value, onChange, revokeUrl]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
  }, [addFiles, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleBrowse = useCallback(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  }, [disabled]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
    e.target.value = '';
  }, [addFiles]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleBrowse();
    }
  }, [disabled, handleBrowse]);

  const setCardRef = useCallback((id: string) => (el: HTMLDivElement | null) => {
    if (el) fileCardRefs.current.set(id, el);
    else fileCardRefs.current.delete(id);
  }, []);

  return (
    <div className={`space-y-3 ${className}`}>
      <div
        ref={dropZoneRef}
        onClick={handleBrowse}
        onKeyDown={handleKeyDown}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label={dragOver ? 'Drop files here' : 'Upload files'}
        className={`
          border-2 border-dashed rounded-lg p-8 sm:p-10 text-center transition-all duration-200 outline-none
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${dragOver
            ? 'border-brand-lime bg-brand-soft scale-[1.01]'
            : 'border-panel-border/80 hover:border-brand-lime/20 hover:bg-panel-card/50'
          }
          ${!disabled ? 'focus-visible:border-brand-lime focus-visible:bg-brand-soft' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_STRING}
          multiple={multi}
          capture="environment"
          className="hidden"
          onChange={handleInputChange}
          disabled={disabled}
        />
        <Upload className="mx-auto text-gray-500 mb-3" size={36} />
        <h3 className="font-serif italic font-bold text-base mb-1">
          {dragOver ? 'Drop files here' : 'Capture or Upload Evidence'}
        </h3>
        <p className="text-gray-500 text-xs max-w-sm mx-auto mb-4">
          Drag & drop files here, or click to browse.
          Supports images (JPG, PNG, WEBP), video (MP4, MOV, WEBM), and audio (MP3, WAV, M4A).
        </p>
        <p className="text-gray-600 text-[10px] font-mono">
          Max {maxFiles} file{maxFiles !== 1 ? 's' : ''}, {maxSizeMB}MB each
        </p>
      </div>

      <div
        ref={errorsRef}
        role="alert"
        aria-live="polite"
        aria-atomic="true"
      >
        {errors.length > 0 && (
          <div className="space-y-1">
            {errors.map(err => (
              <p key={err.id} className="text-status-escalated text-[10px] font-mono flex items-center gap-1.5">
                <AlertCircle size={10} className="shrink-0" />
                {err.message}
              </p>
            ))}
          </div>
        )}
      </div>

      {value.length > 0 && (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
          role="list"
          aria-label={`${value.length} file${value.length !== 1 ? 's' : ''} attached`}
        >
          {value.map(f => (
            <div key={f.id} role="listitem" ref={setCardRef(f.id)}>
              <FileCard file={f} onRemove={removeFile} disabled={disabled} />
            </div>
          ))}
        </div>
      )}

      {value.length > 0 && (
        <p className="text-[10px] text-gray-500 font-mono text-right" aria-live="polite">
          {value.length} file{value.length !== 1 ? 's' : ''} attached
        </p>
      )}
    </div>
  );
};
