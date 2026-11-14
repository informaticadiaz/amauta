'use client';
import { useEffect, useState } from 'react';
import { HorarioSemanal } from './HorarioSemanal';
import type { Horario, HorariosResponse } from './types';

export function MisHorarios({ rol }: { rol: 'EDUCADOR' | 'ESTUDIANTE' }) {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          rol === 'EDUCADOR'
            ? '/api/educadores/me/horarios'
            : '/api/me/horarios'
        );
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || 'No se pudo cargar el horario');
        }
        const data = (await response.json()) as HorariosResponse;
        if (active) setHorarios(data.horarios ?? []);
      } catch (err) {
        if (active)
          setError(
            err instanceof Error ? err.message : 'Error al cargar horarios'
          );
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [rol]);
  if (loading)
    return (
      <div className="rounded-lg border border-[var(--border)] p-4 text-sm text-[var(--muted)]">
        Cargando horario semanal...
      </div>
    );
  if (error)
    return (
      <div className="rounded-lg border border-[var(--error-border)] bg-[var(--error-bg)] p-4 text-sm text-[var(--error-text)]">
        {error}
      </div>
    );
  return (
    <HorarioSemanal
      horarios={horarios}
      emptyMessage="Todavía no tenés clases programadas."
    />
  );
}
