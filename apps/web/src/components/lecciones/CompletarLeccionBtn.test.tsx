/**
 * Tests para CompletarLeccionBtn
 * Verifica el botón para marcar lecciones como completadas con optimistic UI
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CompletarLeccionBtn } from './CompletarLeccionBtn';
import {
  encolarSync,
  guardarProgresoOffline,
  marcarProgresoSincronizado,
} from '@/lib/sync/sync-manager';

// Mock de next/navigation
const mockRefresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

jest.mock('@/lib/sync/sync-manager', () => ({
  encolarSync: jest.fn(),
  guardarProgresoOffline: jest.fn(),
  marcarProgresoSincronizado: jest.fn(),
}));

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('CompletarLeccionBtn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      configurable: true,
    });
  });

  it('debería mostrar "Marcar como completada" cuando no está completada', () => {
    render(
      <CompletarLeccionBtn
        leccionId="lec-1"
        cursoId="curso-1"
        completada={false}
      />
    );
    expect(
      screen.getByRole('button', { name: /marcar como completada/i })
    ).toBeInTheDocument();
  });

  it('debería mostrar estado completado cuando completada=true', () => {
    render(
      <CompletarLeccionBtn
        leccionId="lec-1"
        cursoId="curso-1"
        completada={true}
      />
    );
    expect(screen.getByText(/completada/i)).toBeInTheDocument();
  });

  it('debería llamar a la API al hacer click y actualizar estado optimísticamente', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        progreso: { completado: true },
        message: 'Lección marcada como completada',
      }),
    });

    render(
      <CompletarLeccionBtn
        leccionId="lec-1"
        cursoId="curso-1"
        completada={false}
      />
    );

    const btn = screen.getByRole('button', { name: /marcar como completada/i });
    fireEvent.click(btn);

    // Optimistic update: inmediatamente muestra completada
    await waitFor(() => {
      expect(screen.getByText(/completada/i)).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/lecciones/lec-1/completar',
      expect.objectContaining({ method: 'POST' })
    );
    expect(marcarProgresoSincronizado).toHaveBeenCalledWith('lec-1');
  });

  it('debería llamar a router.refresh() después de completar exitosamente', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ progreso: { completado: true }, message: 'ok' }),
    });

    render(
      <CompletarLeccionBtn
        leccionId="lec-1"
        cursoId="curso-1"
        completada={false}
      />
    );

    fireEvent.click(
      screen.getByRole('button', { name: /marcar como completada/i })
    );

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('debería revertir estado si la API falla', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Error' }),
    });

    render(
      <CompletarLeccionBtn
        leccionId="lec-1"
        cursoId="curso-1"
        completada={false}
      />
    );

    fireEvent.click(
      screen.getByRole('button', { name: /marcar como completada/i })
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /marcar como completada/i })
      ).toBeInTheDocument();
    });
    expect(encolarSync).not.toHaveBeenCalled();
  });

  it('debería deshabilitar el botón si ya está completada', () => {
    render(
      <CompletarLeccionBtn
        leccionId="lec-1"
        cursoId="curso-1"
        completada={true}
      />
    );
    const btn = screen.queryByRole('button', {
      name: /marcar como completada/i,
    });
    // No debe mostrar el botón activo, o debe estar deshabilitado
    expect(btn).not.toBeInTheDocument();
  });

  it('debería mostrar estado de carga durante la petición', async () => {
    let resolvePromise!: (value: unknown) => void;
    mockFetch.mockReturnValueOnce(
      new Promise((resolve) => {
        resolvePromise = resolve;
      })
    );

    render(
      <CompletarLeccionBtn
        leccionId="lec-1"
        cursoId="curso-1"
        completada={false}
      />
    );

    fireEvent.click(
      screen.getByRole('button', { name: /marcar como completada/i })
    );

    // Mientras carga: el botón está deshabilitado
    await waitFor(() => {
      const btn = screen.queryByRole('button', {
        name: /marcar como completada/i,
      });
      if (btn) {
        expect(btn).toBeDisabled();
      }
    });

    // Resolver para evitar warnings de act()
    resolvePromise({
      ok: true,
      json: async () => ({ progreso: { completado: true }, message: 'ok' }),
    });
  });

  it('debería llamar a onCompletada callback después de completar exitosamente', async () => {
    const onCompletada = jest.fn();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ progreso: { completado: true }, message: 'ok' }),
    });

    render(
      <CompletarLeccionBtn
        leccionId="lec-1"
        cursoId="curso-1"
        completada={false}
        onCompletada={onCompletada}
      />
    );

    fireEvent.click(
      screen.getByRole('button', { name: /marcar como completada/i })
    );

    await waitFor(() => {
      expect(onCompletada).toHaveBeenCalled();
    });
  });

  it('debería encolar la acción cuando está offline', async () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      configurable: true,
    });

    render(
      <CompletarLeccionBtn
        leccionId="lec-1"
        cursoId="curso-1"
        completada={false}
      />
    );

    fireEvent.click(
      screen.getByRole('button', { name: /marcar como completada/i })
    );

    await waitFor(() => {
      expect(encolarSync).toHaveBeenCalledWith(
        'completar-leccion',
        expect.objectContaining({
          leccionId: 'lec-1',
          cursoId: 'curso-1',
          completada: true,
        })
      );
    });
    expect(mockFetch).not.toHaveBeenCalled();
    expect(guardarProgresoOffline).toHaveBeenCalled();
  });
});
