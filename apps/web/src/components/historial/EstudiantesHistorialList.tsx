'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Estudiante {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
}

interface EstudiantesResponse {
  usuarios?: Estudiante[];
}

export function EstudiantesHistorialList({
  institucionId,
}: {
  institucionId: string;
}) {
  const [buscar, setBuscar] = useState('');
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const query = new URLSearchParams({ limit: '100' });
    if (buscar.trim()) query.set('buscar', buscar.trim());

    setLoading(true);
    fetch(`/api/instituciones/${institucionId}/estudiantes?${query}`)
      .then(async (response) => {
        const data = (await response.json()) as EstudiantesResponse & {
          message?: string;
        };
        if (!response.ok)
          throw new Error(
            data.message || 'No se pudieron cargar los estudiantes'
          );
        if (active) setEstudiantes(data.usuarios ?? []);
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : 'No se pudieron cargar los estudiantes'
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [buscar, institucionId]);

  return (
    <section className="space-y-4" aria-label="Estudiantes de la institución">
      <label
        className="block text-sm font-medium text-[var(--foreground)]"
        htmlFor="buscar-estudiante"
      >
        Buscar estudiante
      </label>
      <input
        id="buscar-estudiante"
        value={buscar}
        onChange={(event) => setBuscar(event.target.value)}
        placeholder="Nombre, apellido o email"
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
      />

      {loading && (
        <p className="text-sm text-[var(--muted)]">Cargando estudiantes...</p>
      )}
      {error && <p className="text-sm text-red-700">{error}</p>}
      {!loading && !error && estudiantes.length === 0 && (
        <p className="text-sm text-[var(--muted)]">
          No hay estudiantes para mostrar.
        </p>
      )}
      {!loading && !error && estudiantes.length > 0 && (
        <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)]">
          {estudiantes.map((estudiante) => (
            <li key={estudiante.id}>
              <Link
                href={`/dashboard/historial/estudiantes/${estudiante.id}`}
                className="block px-4 py-3 hover:bg-[var(--border)]/20 hover:no-underline"
              >
                <span className="font-medium text-[var(--foreground)]">
                  {estudiante.apellido}, {estudiante.nombre}
                </span>
                <span className="mt-1 block text-sm text-[var(--muted)]">
                  {estudiante.email}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
