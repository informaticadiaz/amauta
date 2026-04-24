'use client';

import { useState } from 'react';
import { z } from 'zod';
import type { ForoPostListItem } from './types';

const createForoPostSchema = z.object({
  tipo: z.enum(['PREGUNTA', 'DISCUSION', 'ANUNCIO']),
  titulo: z
    .string()
    .trim()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres'),
  contenido: z
    .string()
    .trim()
    .min(3, 'El contenido debe tener al menos 3 caracteres')
    .max(5000, 'El contenido no puede exceder 5000 caracteres'),
  etiquetas: z.array(z.string().trim().min(1).max(30)).max(10),
});

interface NuevoPostFormProps {
  cursoId: string;
  currentUserRol: 'ESTUDIANTE' | 'EDUCADOR' | 'ADMIN_ESCUELA' | 'SUPER_ADMIN';
  onCreated: (post: ForoPostListItem) => Promise<void> | void;
}

function normalizarEtiquetas(raw: string) {
  return Array.from(
    new Set(
      raw
        .split(',')
        .map((etiqueta) => etiqueta.trim())
        .filter(Boolean)
    )
  );
}

export function NuevoPostForm({
  cursoId,
  currentUserRol,
  onCreated,
}: NuevoPostFormProps) {
  const [tipo, setTipo] = useState<'PREGUNTA' | 'DISCUSION' | 'ANUNCIO'>(
    'PREGUNTA'
  );
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [etiquetas, setEtiquetas] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canPublishAnnouncement =
    currentUserRol === 'EDUCADOR' ||
    currentUserRol === 'ADMIN_ESCUELA' ||
    currentUserRol === 'SUPER_ADMIN';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const payload = {
      tipo,
      titulo,
      contenido,
      etiquetas: normalizarEtiquetas(etiquetas),
    };

    const result = createForoPostSchema.safeParse(payload);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Datos inválidos');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`/api/cursos/${cursoId}/foros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'No se pudo crear la publicación');
      }

      await onCreated(data.post);
      setTitulo('');
      setContenido('');
      setEtiquetas('');
      setTipo('PREGUNTA');
      setSuccess('Publicación creada exitosamente');
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Error al crear la publicación'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-[var(--foreground)]">
        Nueva publicación
      </h2>

      <div className="mt-4 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-[var(--foreground)]">
            Tipo de publicación
          </span>
          <select
            aria-label="Tipo de publicación"
            value={tipo}
            onChange={(event) =>
              setTipo(
                event.target.value as 'PREGUNTA' | 'DISCUSION' | 'ANUNCIO'
              )
            }
            className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
          >
            <option value="PREGUNTA">Pregunta</option>
            <option value="DISCUSION">Discusión</option>
            {canPublishAnnouncement && <option value="ANUNCIO">Anuncio</option>}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-[var(--foreground)]">
            Título del post
          </span>
          <input
            aria-label="Título del post"
            value={titulo}
            onChange={(event) => setTitulo(event.target.value)}
            className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-[var(--foreground)]">
            Contenido del post
          </span>
          <textarea
            aria-label="Contenido del post"
            value={contenido}
            onChange={(event) => setContenido(event.target.value)}
            className="min-h-32 rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-[var(--foreground)]">
            Etiquetas
          </span>
          <input
            aria-label="Etiquetas"
            value={etiquetas}
            onChange={(event) => setEtiquetas(event.target.value)}
            placeholder="ej: examen, tarea, colaboracion"
            className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
          />
        </label>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-4 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Publicando...' : 'Publicar en el foro'}
      </button>
    </form>
  );
}
