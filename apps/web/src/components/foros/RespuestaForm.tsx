'use client';

import { useState } from 'react';
import { z } from 'zod';

const createForoRespuestaSchema = z.object({
  contenido: z
    .string()
    .trim()
    .min(3, 'El contenido debe tener al menos 3 caracteres')
    .max(5000, 'El contenido no puede exceder 5000 caracteres'),
  respuestaParentId: z.string().optional(),
});

interface RespuestaFormProps {
  onSubmit: (payload: {
    contenido: string;
    respuestaParentId?: string;
  }) => Promise<void>;
  replyLabel?: string | null;
  parentId?: string | null;
  disabled?: boolean;
}

export function RespuestaForm({
  onSubmit,
  replyLabel,
  parentId,
  disabled = false,
}: RespuestaFormProps) {
  const [contenido, setContenido] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const result = createForoRespuestaSchema.safeParse({
      contenido,
      respuestaParentId: parentId ?? undefined,
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Datos inválidos');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(result.data);
      setContenido('');
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'No se pudo enviar la respuesta'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      {replyLabel && (
        <p className="text-sm text-[var(--muted)]">{replyLabel}</p>
      )}
      <label className="grid gap-2">
        <span className="text-sm font-medium text-[var(--foreground)]">
          Tu respuesta
        </span>
        <textarea
          aria-label="Tu respuesta"
          value={contenido}
          onChange={(event) => setContenido(event.target.value)}
          disabled={disabled || loading}
          className="min-h-28 rounded-xl border border-[var(--border)] px-3 py-2 text-sm disabled:bg-slate-100"
        />
      </label>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={disabled || loading}
        className="w-fit rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Enviando...' : 'Enviar respuesta'}
      </button>
    </form>
  );
}
