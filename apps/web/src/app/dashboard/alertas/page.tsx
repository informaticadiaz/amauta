'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthorization } from '@/hooks/useAuthorization';

type TipoAlerta = 'ASISTENCIA_BAJA' | 'NOTA_EN_RIESGO';

interface Alerta {
  id: string;
  tipo: TipoAlerta;
  valorActual: number;
  umbral: number;
  detalle: string | null;
  estudiante: { nombre: string; apellido: string };
  grupo: { nombre: string };
  periodo: { nombre: string };
}

export default function AlertasPage() {
  const { isLoading, isAuthenticated, isAdminEscuela, isEducador } =
    useAuthorization();
  const router = useRouter();
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [detectando, setDetectando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarAlertas = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/alertas');
      if (!response.ok) throw new Error('No se pudieron cargar las alertas');
      const data = (await response.json()) as { alertas: Alerta[] };
      setAlertas(data.alertas);
      setError(null);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Error al cargar alertas'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login');
    if (!isLoading && isAuthenticated && !isAdminEscuela && !isEducador) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, isAdminEscuela, isEducador, router]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && (isAdminEscuela || isEducador)) {
      void cargarAlertas();
    }
  }, [cargarAlertas, isAdminEscuela, isEducador, isLoading, isAuthenticated]);

  async function detectar() {
    try {
      setDetectando(true);
      const response = await fetch('/api/alertas', { method: 'POST' });
      if (!response.ok)
        throw new Error('No se pudieron actualizar las alertas');
      await cargarAlertas();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Error al actualizar alertas'
      );
    } finally {
      setDetectando(false);
    }
  }

  if (isLoading || !isAuthenticated) return null;

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-primary">
            Seguimiento académico
          </p>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Alertas activas
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Estudiantes que requieren acompañamiento por asistencia o
            rendimiento.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void detectar()}
          disabled={detectando}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {detectando ? 'Actualizando…' : 'Actualizar alertas'}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Cargando alertas…</p>
      ) : alertas.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-8 text-center">
          <h2 className="font-semibold text-[var(--foreground)]">
            No hay alertas activas
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            El seguimiento actual no detecta estudiantes por debajo de los
            umbrales configurados.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {alertas.map((alerta) => {
            const asistencia = alerta.tipo === 'ASISTENCIA_BAJA';
            return (
              <article
                key={alerta.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${asistencia ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {asistencia ? 'Asistencia baja' : 'Nota en riesgo'}
                    </span>
                    <h2 className="mt-3 font-semibold text-[var(--foreground)]">
                      {alerta.estudiante.nombre} {alerta.estudiante.apellido}
                    </h2>
                  </div>
                  <strong className="text-xl text-[var(--foreground)]">
                    {alerta.valorActual.toFixed(1)}
                  </strong>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-[var(--muted)]">Grupo</dt>
                    <dd className="font-medium">{alerta.grupo.nombre}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted)]">Umbral</dt>
                    <dd className="font-medium">{alerta.umbral.toFixed(1)}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-[var(--muted)]">Período</dt>
                    <dd className="font-medium">{alerta.periodo.nombre}</dd>
                  </div>
                </dl>
                {alerta.detalle && (
                  <p className="mt-4 text-xs text-[var(--muted)]">
                    {alerta.detalle}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
