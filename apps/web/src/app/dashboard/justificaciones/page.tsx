'use client';

import { useEffect, useState } from 'react';
import { useAuthorization } from '@/hooks/useAuthorization';
import { useRouter } from 'next/navigation';

interface Justificacion {
  id: string;
  motivo: string;
  archivoNombre: string;
  estado: string;
  createdAt: string;
  asistencia: {
    fecha: string;
    estudiante: { nombre: string; apellido: string };
    grupo: { nombre: string };
  };
  solicitante: { nombre: string; apellido: string };
}

export default function JustificacionesPage() {
  const { isLoading, isAuthenticated, isEducador, isAdminEscuela } =
    useAuthorization();
  const router = useRouter();
  const [items, setItems] = useState<Justificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/justificaciones');
      const payload = await response.json();
      if (!response.ok)
        throw new Error(
          payload.message || 'No se pudieron cargar las solicitudes.'
        );
      setItems(payload as Justificacion[]);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'No se pudieron cargar las solicitudes.'
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (!isLoading && isAuthenticated && (isEducador || isAdminEscuela))
      void load();
  }, [isLoading, isAuthenticated, isEducador, isAdminEscuela]);
  useEffect(() => {
    if (!isLoading && isAuthenticated && !isEducador && !isAdminEscuela)
      router.replace('/dashboard');
  }, [isLoading, isAuthenticated, isEducador, isAdminEscuela, router]);

  async function resolve(id: string, estado: 'APROBADA' | 'RECHAZADA') {
    if (estado === 'RECHAZADA' && !reason.trim()) {
      setError('El motivo de rechazo es obligatorio.');
      return;
    }
    const response = await fetch(`/api/justificaciones/${id}/resolver`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estado,
        ...(estado === 'RECHAZADA' ? { motivoRechazo: reason.trim() } : {}),
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload.message || 'No se pudo resolver la solicitud.');
      return;
    }
    setRejecting(null);
    setReason('');
    void load();
  }
  function download(id: string) {
    window.location.href = `/api/justificaciones/${id}/archivo`;
  }
  if (isLoading || !isAuthenticated || (!isEducador && !isAdminEscuela))
    return null;
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Justificaciones de ausencias
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Revisá las solicitudes pendientes de tus grupos.
        </p>
      </header>
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}
      {loading ? (
        <p role="status" className="py-8 text-center text-[var(--muted)]">
          Cargando solicitudes...
        </p>
      ) : items.length === 0 ? (
        <p className="rounded-lg border border-[var(--border)] p-6 text-[var(--muted)]">
          No hay solicitudes pendientes.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-[var(--border)] p-5"
            >
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <h2 className="font-semibold">
                    {item.asistencia.estudiante.apellido},{' '}
                    {item.asistencia.estudiante.nombre}
                  </h2>
                  <p className="text-sm text-[var(--muted)]">
                    {new Date(item.asistencia.fecha).toLocaleDateString(
                      'es-AR'
                    )}{' '}
                    · {item.asistencia.grupo.nombre}
                  </p>
                </div>
                <span className="text-sm text-[var(--muted)]">
                  Solicita: {item.solicitante.apellido},{' '}
                  {item.solicitante.nombre}
                </span>
              </div>
              <p className="mt-3 text-sm">{item.motivo}</p>
              <button
                type="button"
                onClick={() => download(item.id)}
                className="mt-3 text-sm font-medium text-primary underline"
              >
                Descargar {item.archivoNombre}
              </button>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void resolve(item.id, 'APROBADA')}
                  className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white"
                >
                  Aprobar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRejecting(item.id);
                    setError(null);
                  }}
                  className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700"
                >
                  Rechazar
                </button>
              </div>
              {rejecting === item.id && (
                <div className="mt-3 space-y-2">
                  <label
                    htmlFor={`rechazo-${item.id}`}
                    className="block text-sm font-medium"
                  >
                    Motivo del rechazo
                  </label>
                  <textarea
                    id={`rechazo-${item.id}`}
                    required
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => void resolve(item.id, 'RECHAZADA')}
                    className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white"
                  >
                    Confirmar rechazo
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
