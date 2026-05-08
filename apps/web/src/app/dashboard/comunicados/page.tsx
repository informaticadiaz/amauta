'use client';

import { useState, useEffect } from 'react';
import { useAuthorization } from '@/hooks/useAuthorization';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Comunicado {
  id: string;
  titulo: string;
  contenido: string;
  tipo: string;
  prioridad: string;
  publicadoEn: string;
  autor: { nombre: string; apellido: string };
}

interface ListaComunicadosResponse {
  comunicados: Comunicado[];
  total: number;
  page: number;
  totalPages: number;
}

const TIPO_LABELS: Record<string, string> = {
  GENERAL: 'General',
  ACADEMICO: 'Académico',
  ADMINISTRATIVO: 'Administrativo',
  EVENTO: 'Evento',
  URGENTE: 'Urgente',
};

const PRIORIDAD_COLORS: Record<string, string> = {
  BAJA: 'bg-gray-100 text-gray-700',
  NORMAL: 'bg-blue-100 text-blue-700',
  ALTA: 'bg-orange-100 text-orange-700',
  URGENTE: 'bg-red-100 text-red-700',
};

const TIPO_COLORS: Record<string, string> = {
  GENERAL: 'bg-gray-100 text-gray-600',
  ACADEMICO: 'bg-green-100 text-green-700',
  ADMINISTRATIVO: 'bg-purple-100 text-purple-700',
  EVENTO: 'bg-yellow-100 text-yellow-700',
  URGENTE: 'bg-red-100 text-red-700',
};

export default function ComunicadosPage() {
  const { isAuthenticated, isLoading, isAdminEscuela, isEducador } =
    useAuthorization();
  const router = useRouter();
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const params = new URLSearchParams();
      if (filtroTipo) params.set('tipo', filtroTipo);
      if (filtroPrioridad) params.set('prioridad', filtroPrioridad);
      params.set('limit', '20');

      fetch(`/api/me/comunicados?${params.toString()}`)
        .then((res) => res.json())
        .then((data: ListaComunicadosResponse) => {
          setComunicados(data.comunicados ?? []);
        })
        .catch(() => setError('No se pudieron cargar los comunicados.'))
        .finally(() => setLoading(false));
    }
  }, [isLoading, isAuthenticated, filtroTipo, filtroPrioridad]);

  const canCreate = isAdminEscuela || isEducador;

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-[var(--muted)]">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Comunicados
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Comunicados y anuncios de tu institución.
          </p>
        </div>
        {canCreate && (
          <Link
            href="/dashboard/comunicados/nuevo"
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 hover:no-underline"
          >
            Nuevo comunicado
          </Link>
        )}
      </div>

      <div className="flex gap-3">
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
        >
          <option value="">Todos los tipos</option>
          {Object.entries(TIPO_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={filtroPrioridad}
          onChange={(e) => setFiltroPrioridad(e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
        >
          <option value="">Todas las prioridades</option>
          <option value="BAJA">Baja</option>
          <option value="NORMAL">Normal</option>
          <option value="ALTA">Alta</option>
          <option value="URGENTE">Urgente</option>
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!error && comunicados.length === 0 && (
        <div className="rounded-lg border border-[var(--border)] p-8 text-center">
          <p className="text-[var(--muted)]">No hay comunicados publicados.</p>
        </div>
      )}

      <div className="space-y-3">
        {comunicados.map((com) => (
          <div
            key={com.id}
            className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="mb-2 flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TIPO_COLORS[com.tipo] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {TIPO_LABELS[com.tipo] ?? com.tipo}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${PRIORIDAD_COLORS[com.prioridad] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {com.prioridad}
                  </span>
                </div>
                <h3 className="font-semibold text-[var(--foreground)]">
                  {com.titulo}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
                  {com.contenido}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-[var(--muted)]">
              <span>
                {com.autor.nombre} {com.autor.apellido}
              </span>
              <span>
                {new Date(com.publicadoEn).toLocaleDateString('es-AR', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
