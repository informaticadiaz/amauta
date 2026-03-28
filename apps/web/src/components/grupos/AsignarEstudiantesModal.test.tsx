/**
 * Tests para AsignarEstudiantesModal
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AsignarEstudiantesModal } from './AsignarEstudiantesModal';

describe('AsignarEstudiantesModal', () => {
  beforeEach(() => {
    global.fetch = jest.fn((input: RequestInfo, init?: RequestInit) => {
      const url = String(input);
      if (
        url.includes('/api/grupos/grupo-1/estudiantes') &&
        init?.method === 'POST'
      ) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            resultado: { agregados: ['u-1'], duplicados: ['u-2'], errores: [] },
          }),
        }) as Promise<Response>;
      }
      if (url.includes('/api/grupos/grupo-1/estudiantes')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            estudiantes: [{ id: 'u-2' }],
            totalPages: 1,
          }),
        }) as Promise<Response>;
      }
      if (url.includes('/api/instituciones/inst-1/estudiantes')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            usuarios: [
              {
                id: 'u-1',
                email: 'ana@test.com',
                nombre: 'Ana',
                apellido: 'Pérez',
                activo: true,
              },
              {
                id: 'u-2',
                email: 'mario@test.com',
                nombre: 'Mario',
                apellido: 'Gómez',
                activo: true,
              },
            ],
            total: 2,
            page: 1,
            limit: 10,
            totalPages: 1,
          }),
        }) as Promise<Response>;
      }
      return Promise.resolve({
        ok: false,
        json: async () => ({ message: 'Error inesperado' }),
      }) as Promise<Response>;
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('debería mostrar preview de agregados/duplicados', async () => {
    const user = userEvent.setup();

    render(
      <AsignarEstudiantesModal
        open
        onClose={() => {}}
        grupoId="grupo-1"
        institucionId="inst-1"
        onAssigned={() => {}}
      />
    );

    expect(await screen.findByText('Ana Pérez')).toBeInTheDocument();

    const checks = await screen.findAllByRole('checkbox');
    await user.click(checks[0]);
    await user.click(checks[1]);

    await waitFor(() => {
      expect(screen.getByText(/Agregados: 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Duplicados: 1/i)).toBeInTheDocument();
    });
  });
});
