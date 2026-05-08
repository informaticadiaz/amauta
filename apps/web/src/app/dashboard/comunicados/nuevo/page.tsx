'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthorization } from '@/hooks/useAuthorization';
import { useEffect } from 'react';

export default function NuevoComunicadoPage() {
  const { isAuthenticated, isLoading, isAdminEscuela, isEducador } =
    useAuthorization();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isAdminEscuela && !isEducador) {
      router.replace('/dashboard/comunicados');
    }
  }, [isLoading, isAuthenticated, isAdminEscuela, isEducador, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      titulo: formData.get('titulo') as string,
      contenido: formData.get('contenido') as string,
      tipo: formData.get('tipo') as string,
      prioridad: formData.get('prioridad') as string,
    };

    if (!data.titulo || data.titulo.length < 3) {
      setError('El título debe tener al menos 3 caracteres.');
      setLoading(false);
      return;
    }

    if (!data.contenido || data.contenido.length < 10) {
      setError('El contenido debe tener al menos 10 caracteres.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/me/comunicados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message ?? 'Error al crear comunicado');
      }

      router.push('/dashboard/comunicados');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-[var(--muted)]">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Nuevo comunicado
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Publicá un comunicado para tu institución.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label
            htmlFor="titulo"
            className="block text-sm font-medium text-[var(--foreground)]"
          >
            Título
          </label>
          <input
            id="titulo"
            name="titulo"
            type="text"
            required
            minLength={3}
            maxLength={200}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            placeholder="Título del comunicado"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label
              htmlFor="tipo"
              className="block text-sm font-medium text-[var(--foreground)]"
            >
              Tipo
            </label>
            <select
              id="tipo"
              name="tipo"
              defaultValue="GENERAL"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
            >
              <option value="GENERAL">General</option>
              <option value="ACADEMICO">Académico</option>
              <option value="ADMINISTRATIVO">Administrativo</option>
              <option value="EVENTO">Evento</option>
              <option value="URGENTE">Urgente</option>
            </select>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="prioridad"
              className="block text-sm font-medium text-[var(--foreground)]"
            >
              Prioridad
            </label>
            <select
              id="prioridad"
              name="prioridad"
              defaultValue="NORMAL"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
            >
              <option value="BAJA">Baja</option>
              <option value="NORMAL">Normal</option>
              <option value="ALTA">Alta</option>
              <option value="URGENTE">Urgente</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="contenido"
            className="block text-sm font-medium text-[var(--foreground)]"
          >
            Contenido
          </label>
          <textarea
            id="contenido"
            name="contenido"
            required
            minLength={10}
            rows={8}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            placeholder="Escribí el contenido del comunicado..."
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Publicando...' : 'Publicar comunicado'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)]"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
