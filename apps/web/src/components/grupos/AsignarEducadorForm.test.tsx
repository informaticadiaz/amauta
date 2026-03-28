/**
 * Tests para AsignarEducadorForm
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AsignarEducadorForm } from './AsignarEducadorForm';

describe('AsignarEducadorForm', () => {
  beforeEach(() => {
    global.fetch = jest.fn((input: RequestInfo, init?: RequestInit) => {
      const url = String(input);
      if (
        url.includes('/api/grupos/grupo-1/educadores') &&
        init?.method === 'POST'
      ) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ asignacion: { educadorId: 'edu-1' } }),
        }) as Promise<Response>;
      }
      if (url.includes('/api/instituciones/inst-1/educadores')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            usuarios: [
              {
                id: 'edu-1',
                email: 'profe@test.com',
                nombre: 'Juan',
                apellido: 'López',
                activo: true,
              },
            ],
            total: 1,
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

  it('debería asignar un educador', async () => {
    const user = userEvent.setup();

    render(
      <AsignarEducadorForm
        grupoId="grupo-1"
        institucionId="inst-1"
        onAssigned={() => {}}
      />
    );

    const select = await screen.findByLabelText(/educador/i);
    await screen.findByText(/juan lópez/i);
    await user.selectOptions(select, 'edu-1');
    await user.click(screen.getByRole('button', { name: /asignar educador/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/grupos/grupo-1/educadores',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });
});
