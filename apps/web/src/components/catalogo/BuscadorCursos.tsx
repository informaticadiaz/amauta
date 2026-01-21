/**
 * Componente BuscadorCursos
 *
 * Input de búsqueda con debounce para el catálogo
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

export function BuscadorCursos() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get('buscar') || ''
  );

  // Debounce para búsqueda
  const updateSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value.trim()) {
        params.set('buscar', value.trim());
      } else {
        params.delete('buscar');
      }

      // Resetear a página 1 al buscar
      params.delete('page');

      router.push(`/cursos?${params.toString()}`);
    },
    [searchParams, router]
  );

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      updateSearch(searchTerm);
    }, 500); // 500ms de delay

    return () => clearTimeout(timer);
  }, [searchTerm, updateSearch]);

  function handleClear() {
    setSearchTerm('');
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar cursos por título o descripción..."
          className="w-full rounded-lg border border-[var(--border)] bg-white px-4 py-3 pl-12 pr-10 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />

        {/* Ícono de búsqueda */}
        <svg
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)]"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>

        {/* Botón para limpiar */}
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--muted)] transition-colors hover:bg-gray-100 hover:text-[var(--foreground)]"
            aria-label="Limpiar búsqueda"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Indicador de búsqueda activa */}
      {searchParams.get('buscar') && (
        <p className="mt-2 text-sm text-[var(--muted)]">
          Buscando:{' '}
          <span className="font-medium text-[var(--foreground)]">
            {searchParams.get('buscar')}
          </span>
        </p>
      )}
    </div>
  );
}
