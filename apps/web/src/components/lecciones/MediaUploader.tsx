'use client';

/**
 * Componente MediaUploader
 *
 * Permite subir archivos de video o audio (drag & drop) con barra de
 * progreso, y eliminarlos. Usado en lecciones de tipo VIDEO (F7-003).
 */

import { useState, useRef, useCallback } from 'react';

export interface MediaValue {
  url: string;
  storageKey: string;
  mimeType: string;
  size: number;
  duration?: number;
}

interface MediaUploaderProps {
  value?: MediaValue | null;
  onChange: (media: MediaValue | null) => void;
  disabled?: boolean;
}

const ALLOWED_TYPES = [
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
];

const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB
const MAX_AUDIO_SIZE = 100 * 1024 * 1024; // 100MB

export function MediaUploader({
  value,
  onChange,
  disabled = false,
}: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Tipo de archivo no permitido. Use ${ALLOWED_TYPES.join(', ')}.`;
    }
    const isVideo = file.type.startsWith('video/');
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_AUDIO_SIZE;
    if (file.size > maxSize) {
      return `El archivo no puede superar ${maxSize / 1024 / 1024}MB.`;
    }
    return null;
  };

  const uploadFile = (file: File) => {
    setError(null);
    setIsUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/uploads/media');

    xhr.upload.onprogress = (event) => {
      if (event.total > 0) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as MediaValue;
          onChange(data);
        } catch {
          setError('Respuesta inválida del servidor');
        }
      } else {
        try {
          const data = JSON.parse(xhr.responseText) as { message?: string };
          setError(data.message || 'Error al subir el archivo');
        } catch {
          setError('Error al subir el archivo');
        }
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      setError('Error al subir el archivo');
    };

    xhr.send(formData);
  };

  const handleFile = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    uploadFile(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled || isUploading) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [disabled, isUploading]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    e.target.value = '';
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setError(null);

    if (value?.storageKey) {
      try {
        await fetch('/api/uploads/media', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storageKey: value.storageKey }),
        });
      } catch {
        // Si falla la eliminación remota, igual quitamos la referencia local
      }
    }

    onChange(null);
  };

  if (value) {
    const isAudio = value.mimeType.startsWith('audio/');

    return (
      <div className="space-y-2">
        <div className="relative w-full overflow-hidden rounded-lg bg-black">
          {isAudio ? (
            <audio src={value.url} controls className="w-full" />
          ) : (
            <video src={value.url} controls className="w-full" />
          )}
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-sm text-red-500 hover:underline"
          >
            Eliminar archivo
          </button>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-[var(--border)] hover:border-primary/50'
        } ${disabled || isUploading ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-[var(--muted)]">
              Subiendo... {progress}%
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            <svg
              className="h-10 w-10 text-[var(--muted)]"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            <p className="text-sm font-medium text-[var(--foreground)]">
              Arrastra un archivo aquí
            </p>
            <p className="text-xs text-[var(--muted)]">
              o haz clic para seleccionar
            </p>
            <p className="text-xs text-[var(--muted)]">
              Video (MP4, WebM, max 500MB) o audio (MP3, OGG, WAV, max 100MB)
            </p>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
