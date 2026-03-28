'use client';

import { useEffect, useState } from 'react';

interface UsuarioItem {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  activo: boolean;
}

interface ListaUsuariosResponse {
  usuarios: UsuarioItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AsignarEducadorFormProps {
  grupoId: string;
  institucionId: string;
  onAssigned: () => void;
}

const PAGE_LIMIT = 10;

export function AsignarEducadorForm({
  grupoId,
  institucionId,
  onAssigned,
}: AsignarEducadorFormProps) {
  const [data, setData] = useState<ListaUsuariosResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [buscar, setBuscar] = useState('');
  const [educadorId, setEducadorId] = useState('');
  const [rol, setRol] = useState<'TITULAR' | 'SUPLENTE'>('TITULAR');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadEducadores() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(PAGE_LIMIT));
        if (buscar.trim()) params.set('buscar', buscar.trim());

        const response = await fetch(
          `/api/instituciones/${institucionId}/educadores?${params.toString()}`
        );

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.message || 'Error al cargar educadores');
        }

        const payload = (await response.json()) as ListaUsuariosResponse;
        if (isActive) {
          setData(payload);
        }
      } catch (err) {
        if (isActive) {
          setError(
            err instanceof Error ? err.message : 'Error al cargar educadores'
          );
        }
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadEducadores();
    return () => {
      isActive = false;
    };
  }, [institucionId, page, buscar]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!educadorId) {
      setError('Seleccioná un educador válido');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/grupos/${grupoId}/educadores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ educadorId, rol }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message || 'Error al asignar educador');
      }

      mostrarToast('Educador asignado');
      setEducadorId('');
      setRol('TITULAR');
      onAssigned();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al asignar educador');
    } finally {
      setSubmitting(false);
    }
  }

  function mostrarToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      <div>
        <h3 className="text-base font-semibold text-[var(--foreground)]">
          Asignar educador
        </h3>
        <p className="text-sm text-[var(--muted)]">
          Solo educadores de la institución seleccionada.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={buscar}
          onChange={(event) => setBuscar(event.target.value)}
          placeholder="Buscar por nombre o email"
          className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]"
        />

        <div className="space-y-2">
          <label
            htmlFor="educadorId"
            className="text-sm font-medium text-[var(--foreground)]"
          >
            Educador
          </label>
          <select
            id="educadorId"
            value={educadorId}
            onChange={(event) => setEducadorId(event.target.value)}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
          >
            <option value="">Seleccioná un educador</option>
            {(data?.usuarios ?? []).map((usuario) => (
              <option key={usuario.id} value={usuario.id}>
                {usuario.nombre} {usuario.apellido} — {usuario.email}
              </option>
            ))}
          </select>
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--success-bg)] px-2 py-0.5 text-xs text-[var(--success-text)]">
            ✔ Educadores verificados por institución
          </span>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="rol"
            className="text-sm font-medium text-[var(--foreground)]"
          >
            Rol en el grupo
          </label>
          <select
            id="rol"
            value={rol}
            onChange={(event) =>
              setRol(event.target.value as 'TITULAR' | 'SUPLENTE')
            }
            className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
          >
            <option value="TITULAR">Titular</option>
            <option value="SUPLENTE">Suplente</option>
          </select>
        </div>

        {error && (
          <div className="rounded-lg border border-[var(--error-border)] bg-[var(--error-bg)] px-3 py-2 text-sm text-[var(--error-text)]">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--muted)]">
          <span>
            {data ? `${data.total} educadores encontrados` : 'Cargando...'}
          </span>
          {data && data.totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page <= 1}
                className="rounded-md border border-[var(--border)] px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() =>
                  setPage((prev) =>
                    data ? Math.min(prev + 1, data.totalPages) : prev
                  )
                }
                disabled={data ? page >= data.totalPages : true}
                className="rounded-md border border-[var(--border)] px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting || loading}
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Asignando...' : 'Asignar educador'}
        </button>
      </form>
    </div>
  );
}
