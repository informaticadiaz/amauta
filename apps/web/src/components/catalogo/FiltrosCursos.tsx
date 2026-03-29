/**
 * Componente FiltrosCursos
 *
 * Panel lateral con filtros por categoría y nivel
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface Categoria {
  id: string;
  nombre: string;
  slug: string;
}

interface FiltrosCursosProps {
  categorias: Categoria[];
}

const NIVELES = [
  { value: 'PRINCIPIANTE', label: 'Principiante' },
  { value: 'INTERMEDIO', label: 'Intermedio' },
  { value: 'AVANZADO', label: 'Avanzado' },
];

export function FiltrosCursos({ categorias }: FiltrosCursosProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoriaActiva = searchParams.get('categoriaId');
  const nivelActivo = searchParams.get('nivel');

  function toggleFiltro(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    // Si ya está activo, lo quitamos; si no, lo agregamos
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    // Resetear a página 1 al filtrar
    params.delete('page');

    router.push(`/cursos?${params.toString()}`);
  }

  function limpiarFiltros() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('categoriaId');
    params.delete('nivel');
    params.delete('page');

    router.push(`/cursos?${params.toString()}`);
  }

  const hayFiltrosActivos = categoriaActiva || nivelActivo;

  return (
    <div className="space-y-6 rounded-lg border border-[var(--border)] bg-[var(--background)] p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Filtros
        </h2>
        {hayFiltrosActivos && (
          <button
            onClick={limpiarFiltros}
            className="text-sm font-medium text-[var(--primary)] hover:underline"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Filtro por Categoría */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
          Categoría
        </h3>
        <div className="space-y-2">
          {categorias.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">
              No hay categorías disponibles
            </p>
          ) : (
            categorias.map((cat) => {
              const isActive = categoriaActiva === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleFiltro('categoriaId', cat.id)}
                  aria-pressed={isActive}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    isActive
                      ? 'bg-[var(--primary)] text-white font-medium'
                      : 'text-[var(--foreground)] hover:bg-[var(--overlay-light)]'
                  }`}
                >
                  {cat.nombre}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Filtro por Nivel */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
          Nivel
        </h3>
        <div className="space-y-2">
          {NIVELES.map((nivel) => {
            const isActive = nivelActivo === nivel.value;
            return (
              <button
                key={nivel.value}
                onClick={() => toggleFiltro('nivel', nivel.value)}
                aria-pressed={isActive}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  isActive
                    ? 'bg-[var(--primary)] text-white font-medium'
                    : 'text-[var(--foreground)] hover:bg-[var(--overlay-light)]'
                }`}
              >
                {nivel.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtros activos */}
      {hayFiltrosActivos && (
        <div className="border-t border-[var(--border)] pt-4">
          <h3 className="mb-2 text-sm font-semibold text-[var(--foreground)]">
            Activos
          </h3>
          <div className="flex flex-wrap gap-2">
            {categoriaActiva && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--primary-bg)] px-3 py-1 text-xs font-medium text-[var(--primary)]">
                {categorias.find((c) => c.id === categoriaActiva)?.nombre}
                <button
                  onClick={() => toggleFiltro('categoriaId', categoriaActiva)}
                  className="hover:opacity-70"
                >
                  ×
                </button>
              </span>
            )}
            {nivelActivo && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--primary-bg)] px-3 py-1 text-xs font-medium text-[var(--primary)]">
                {NIVELES.find((n) => n.value === nivelActivo)?.label}
                <button
                  onClick={() => toggleFiltro('nivel', nivelActivo)}
                  className="hover:opacity-70"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
