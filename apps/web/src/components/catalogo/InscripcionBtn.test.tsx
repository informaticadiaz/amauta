import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InscripcionBtn } from './InscripcionBtn';
import { encolarSync } from '@/lib/sync/sync-manager';

jest.mock('next-auth/react', () => ({
  useSession: () => ({ status: 'authenticated' }),
}));

jest.mock('@/lib/sync/sync-manager', () => ({
  encolarSync: jest.fn(),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('InscripcionBtn offline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      configurable: true,
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ inscrito: false }),
    });
  });

  it('debería encolar inscripción cuando no hay conexión', async () => {
    render(
      <InscripcionBtn
        cursoId="curso-1"
        cursoTitulo="Curso"
        totalLecciones={3}
        duracion={60}
      />
    );

    const btn = await screen.findByRole('button', {
      name: /inscribirse gratis/i,
    });

    fireEvent.click(btn);

    await waitFor(() => {
      expect(encolarSync).toHaveBeenCalledWith(
        'inscribir',
        expect.objectContaining({ cursoId: 'curso-1' })
      );
    });

    expect(screen.getByText(/ya estás inscrito/i)).toBeInTheDocument();
  });
});
