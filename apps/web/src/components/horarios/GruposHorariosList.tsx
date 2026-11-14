'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
interface Grupo {
  id: string;
  nombre: string;
  grado?: string | null;
  seccion?: string | null;
}
export function GruposHorariosList() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetch('/api/grupos?activo=true&limit=100')
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok)
          throw new Error(d.message || 'No se pudieron cargar los grupos');
        setGrupos(d.grupos ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  if (loading)
    return (
      <p className="rounded-lg border border-[var(--border)] p-4 text-sm text-[var(--muted)]">
        Cargando grupos...
      </p>
    );
  if (error)
    return (
      <p className="rounded-lg border border-[var(--error-border)] bg-[var(--error-bg)] p-4 text-sm text-[var(--error-text)]">
        {error}
      </p>
    );
  if (!grupos.length)
    return (
      <p className="rounded-lg border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">
        No hay grupos activos para configurar.
      </p>
    );
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {grupos.map((grupo) => (
        <Link
          key={grupo.id}
          href={`/dashboard/grupos/${grupo.id}/horarios`}
          className="rounded-lg border border-[var(--border)] p-4 hover:border-primary hover:no-underline"
        >
          <h2 className="font-semibold text-[var(--foreground)]">
            {grupo.nombre}
          </h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {[grupo.grado, grupo.seccion].filter(Boolean).join(' · ') ||
              'Ver y gestionar horario'}
          </p>
        </Link>
      ))}
    </div>
  );
}
