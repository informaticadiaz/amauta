'use client';

/**
 * Componente LeccionForm
 *
 * Formulario para crear y editar lecciones
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RichTextEditor } from './RichTextEditor';
import { MediaUploader, type MediaValue } from './MediaUploader';
import styles from './LeccionForm.module.css';

type TipoLeccion = 'TEXTO' | 'VIDEO' | 'QUIZ' | 'INTERACTIVO' | 'DESCARGABLE';

interface ContenidoTexto {
  html: string;
  format: 'html';
}

interface ContenidoH5P {
  h5pUrl: string;
  embedType: 'iframe';
  title?: string;
}

const H5P_ALLOWED_DOMAINS = ['h5p.org', 'www.h5p.org', 'lumi.education'];

function esDominioH5PPermitido(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return H5P_ALLOWED_DOMAINS.includes(hostname);
  } catch {
    return false;
  }
}

interface Leccion {
  id: string;
  titulo: string;
  descripcion: string | null;
  tipo: TipoLeccion;
  duracion: number | null;
  contenido:
    | ContenidoTexto
    | ContenidoH5P
    | {
        videoUrl?: string;
        provider?: string;
        storageKey?: string;
        mimeType?: string;
        size?: number;
      }
    | Record<string, unknown>;
  publicada: boolean;
}

interface LeccionFormProps {
  cursoId: string;
  leccion?: Leccion;
  onSuccess?: () => void;
}

const TIPOS_LECCION = [
  { value: 'TEXTO', label: 'Texto', icon: 'document' },
  { value: 'VIDEO', label: 'Video', icon: 'video' },
  { value: 'INTERACTIVO', label: 'Interactivo (H5P)', icon: 'puzzle' },
] as const;

const MAX_TITULO = 200;
const MAX_DESCRIPCION = 1000;

function getVideoEmbedUrl(url: string): string | null {
  // YouTube
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return null;
}

export function LeccionForm({ cursoId, leccion, onSuccess }: LeccionFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [titulo, setTitulo] = useState(leccion?.titulo || '');
  const [descripcion, setDescripcion] = useState(leccion?.descripcion || '');
  const [tipo, setTipo] = useState<TipoLeccion>(leccion?.tipo || 'TEXTO');
  const [duracion, setDuracion] = useState<string>(
    leccion?.duracion?.toString() || ''
  );
  const [contenidoTexto, setContenidoTexto] = useState<ContenidoTexto>(
    (leccion?.tipo === 'TEXTO' && (leccion.contenido as ContenidoTexto)) || {
      html: '',
      format: 'html',
    }
  );
  const [videoUrl, setVideoUrl] = useState(
    leccion?.tipo === 'VIDEO'
      ? (leccion.contenido as { videoUrl?: string })?.videoUrl || ''
      : ''
  );
  const contenidoVideo =
    leccion?.tipo === 'VIDEO'
      ? (leccion.contenido as {
          storageKey?: string;
          mimeType?: string;
          size?: number;
          videoUrl?: string;
        })
      : null;
  const [mediaValue, setMediaValue] = useState<MediaValue | null>(
    contenidoVideo?.storageKey
      ? {
          url: contenidoVideo.videoUrl || '',
          storageKey: contenidoVideo.storageKey,
          mimeType: contenidoVideo.mimeType || '',
          size: contenidoVideo.size || 0,
        }
      : null
  );
  const [videoMode, setVideoMode] = useState<'url' | 'upload'>(
    contenidoVideo?.storageKey ? 'upload' : 'url'
  );
  const [h5pUrl, setH5pUrl] = useState(
    leccion?.tipo === 'INTERACTIVO'
      ? (leccion.contenido as ContenidoH5P)?.h5pUrl || ''
      : ''
  );
  const [h5pTitle, setH5pTitle] = useState(
    leccion?.tipo === 'INTERACTIVO'
      ? (leccion.contenido as ContenidoH5P)?.title || ''
      : ''
  );
  const [publicada, setPublicada] = useState(leccion?.publicada || false);

  const isEditing = !!leccion;
  const embedUrl = videoUrl ? getVideoEmbedUrl(videoUrl) : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validación básica
    if (!titulo || titulo.length < 3) {
      setError('El título debe tener al menos 3 caracteres');
      setLoading(false);
      return;
    }

    if (tipo === 'TEXTO' && !contenidoTexto.html) {
      setError('El contenido de texto es requerido');
      setLoading(false);
      return;
    }

    if (tipo === 'VIDEO' && !videoUrl) {
      setError('La URL del video o el archivo subido son requeridos');
      setLoading(false);
      return;
    }

    if (tipo === 'INTERACTIVO') {
      if (!h5pUrl) {
        setError('La URL del contenido H5P es requerida');
        setLoading(false);
        return;
      }
      if (!esDominioH5PPermitido(h5pUrl)) {
        setError(
          `El dominio de la URL H5P no está permitido. Dominios válidos: ${H5P_ALLOWED_DOMAINS.join(', ')}`
        );
        setLoading(false);
        return;
      }
    }

    const contenido: Record<string, unknown> = {};
    if (tipo === 'TEXTO') {
      contenido.html = contenidoTexto.html;
      contenido.format = 'html';
    } else if (tipo === 'VIDEO' && videoUrl) {
      contenido.videoUrl = videoUrl;
      if (videoMode === 'upload' && mediaValue) {
        contenido.provider = 'local';
        contenido.storageKey = mediaValue.storageKey;
        contenido.mimeType = mediaValue.mimeType;
        contenido.size = mediaValue.size;
      }
    } else if (tipo === 'INTERACTIVO') {
      contenido.h5pUrl = h5pUrl;
      contenido.embedType = 'iframe';
      if (h5pTitle) {
        contenido.title = h5pTitle;
      }
    }

    const data = {
      titulo,
      descripcion: descripcion || null,
      tipo,
      duracion: duracion ? parseInt(duracion, 10) : null,
      contenido,
      publicada,
    };

    try {
      const endpoint = isEditing
        ? `/api/lecciones/${leccion.id}`
        : `/api/cursos/${cursoId}/lecciones`;
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al guardar la lección');
      }

      onSuccess?.();
      router.push(`/dashboard/cursos/${cursoId}/lecciones`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    router.push(`/dashboard/cursos/${cursoId}/lecciones`);
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.field}>
        <label htmlFor="titulo" className={styles.label}>
          Título<span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          id="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          maxLength={MAX_TITULO}
          required
          disabled={loading}
          placeholder="Ej: Introducción al tema"
          className={styles.input}
        />
        <div
          className={`${styles.charCount} ${
            titulo.length > MAX_TITULO * 0.9
              ? titulo.length >= MAX_TITULO
                ? styles.charCountError
                : styles.charCountWarning
              : ''
          }`}
        >
          {titulo.length}/{MAX_TITULO}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="descripcion" className={styles.label}>
          Descripción
        </label>
        <textarea
          id="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          maxLength={MAX_DESCRIPCION}
          disabled={loading}
          placeholder="Breve descripción de la lección (opcional)"
          className={styles.textarea}
          style={{ minHeight: '80px' }}
        />
        <div
          className={`${styles.charCount} ${
            descripcion.length > MAX_DESCRIPCION * 0.9
              ? descripcion.length >= MAX_DESCRIPCION
                ? styles.charCountError
                : styles.charCountWarning
              : ''
          }`}
        >
          {descripcion.length}/{MAX_DESCRIPCION}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Tipo de lección<span className={styles.required}>*</span>
        </label>
        <div className={styles.tipoSelector}>
          {TIPOS_LECCION.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTipo(t.value)}
              disabled={loading}
              className={`${styles.tipoOption} ${
                tipo === t.value ? styles.tipoOptionActive : ''
              }`}
            >
              {t.icon === 'document' && (
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              )}
              {t.icon === 'video' && (
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              {t.icon === 'puzzle' && (
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 4a1 1 0 011 1v1.5a1.5 1.5 0 003 0V6a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-1.5a1.5 1.5 0 000 3H18a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-1.5a1.5 1.5 0 00-3 0V18a1 1 0 01-1 1H9a1 1 0 01-1-1v-2a1 1 0 00-1-1H5.5a1.5 1.5 0 010-3H7a1 1 0 001-1V8a1 1 0 011-1h2V4z"
                  />
                </svg>
              )}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {(tipo === 'VIDEO' || videoUrl) && (
        <div className={styles.field}>
          <label className={styles.label}>
            Video
            {tipo === 'VIDEO' && <span className={styles.required}>*</span>}
          </label>
          <div className={styles.tipoSelector}>
            <button
              type="button"
              onClick={() => setVideoMode('url')}
              disabled={loading}
              className={`${styles.tipoOption} ${
                videoMode === 'url' ? styles.tipoOptionActive : ''
              }`}
            >
              URL externa
            </button>
            <button
              type="button"
              onClick={() => setVideoMode('upload')}
              disabled={loading}
              className={`${styles.tipoOption} ${
                videoMode === 'upload' ? styles.tipoOptionActive : ''
              }`}
            >
              Subir archivo
            </button>
          </div>

          {videoMode === 'url' ? (
            <>
              <input
                type="url"
                id="videoUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                disabled={loading}
                placeholder="https://www.youtube.com/watch?v=..."
                className={styles.input}
              />
              <p className={styles.hint}>Soporta YouTube y Vimeo</p>
              {embedUrl && (
                <div className={styles.videoPreview}>
                  <iframe
                    src={embedUrl}
                    title="Vista previa del video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </>
          ) : (
            <MediaUploader
              value={mediaValue}
              disabled={loading}
              onChange={(media) => {
                setMediaValue(media);
                setVideoUrl(media?.url || '');
              }}
            />
          )}
        </div>
      )}

      {tipo === 'TEXTO' && (
        <div className={styles.field}>
          <label className={styles.label}>
            Contenido
            <span className={styles.required}>*</span>
          </label>
          <RichTextEditor
            value={contenidoTexto}
            onChange={setContenidoTexto}
            disabled={loading}
          />
        </div>
      )}

      {tipo === 'INTERACTIVO' && (
        <>
          <div className={styles.field}>
            <label htmlFor="h5pUrl" className={styles.label}>
              URL de embed H5P<span className={styles.required}>*</span>
            </label>
            <input
              type="url"
              id="h5pUrl"
              value={h5pUrl}
              onChange={(e) => setH5pUrl(e.target.value)}
              disabled={loading}
              placeholder="https://h5p.org/h5p/embed/123456"
              className={styles.input}
            />
            <p className={styles.hint}>
              Creá el contenido en H5P.org o Lumi y pegá la URL de embed.
              Dominios permitidos: {H5P_ALLOWED_DOMAINS.join(', ')}
            </p>
            {h5pUrl && !esDominioH5PPermitido(h5pUrl) && (
              <p className={styles.error}>
                El dominio de la URL no está permitido.
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="h5pTitle" className={styles.label}>
              Título descriptivo (opcional)
            </label>
            <input
              type="text"
              id="h5pTitle"
              value={h5pTitle}
              onChange={(e) => setH5pTitle(e.target.value)}
              disabled={loading}
              placeholder="Ej: Quiz sobre el sistema solar"
              className={styles.input}
            />
          </div>

          {h5pUrl && esDominioH5PPermitido(h5pUrl) && (
            <div className={styles.videoPreview}>
              <iframe
                src={h5pUrl}
                title={h5pTitle || 'Vista previa del contenido H5P'}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                allow="fullscreen"
                loading="lazy"
              />
            </div>
          )}
        </>
      )}

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="duracion" className={styles.label}>
            Duración estimada (minutos)
          </label>
          <input
            type="number"
            id="duracion"
            value={duracion}
            onChange={(e) => setDuracion(e.target.value)}
            min={1}
            disabled={loading}
            placeholder="Ej: 15"
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Estado</label>
          <label
            className={styles.tipoOption}
            style={{ cursor: 'pointer', width: 'fit-content' }}
          >
            <input
              type="checkbox"
              checked={publicada}
              onChange={(e) => setPublicada(e.target.checked)}
              disabled={loading}
              style={{ width: 'auto' }}
            />
            Publicada
          </label>
          <p className={styles.hint}>
            Las lecciones publicadas son visibles para los estudiantes
          </p>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className={`${styles.button} ${styles.buttonSecondary}`}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`${styles.button} ${styles.buttonPrimary}`}
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Guardando...
            </>
          ) : isEditing ? (
            'Guardar cambios'
          ) : (
            'Crear lección'
          )}
        </button>
      </div>
    </form>
  );
}
