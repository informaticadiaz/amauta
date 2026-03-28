/**
 * Tests para EstudiantesTable
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EstudiantesTable } from './EstudiantesTable';

const mockEstudiantes = [
  {
    id: 'est-1',
    email: 'ana@test.com',
    nombre: 'Ana',
    apellido: 'Pérez',
    inscritoEn: '2026-03-01T10:00:00Z',
  },
];

describe('EstudiantesTable', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    // @ts-expect-error - mock confirm
    global.confirm = jest.fn(() => true);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('debería mostrar estado de carga', () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    render(<EstudiantesTable grupoId="grupo-1" />);

    expect(screen.getByText(/cargando estudiantes/i)).toBeInTheDocument();
  });

  it('debería renderizar estudiantes asignados', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        estudiantes: mockEstudiantes,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      }),
    });

    render(<EstudiantesTable grupoId="grupo-1" />);

    expect(await screen.findByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText('ana@test.com')).toBeInTheDocument();
  });

  it('debería remover estudiante', async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          estudiantes: mockEstudiantes,
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        }),
      })
      .mockResolvedValueOnce({ ok: true, status: 204 });

    render(<EstudiantesTable grupoId="grupo-1" />);

    await screen.findByText('Ana Pérez');
    await user.click(screen.getByRole('button', { name: /remover/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/grupos/grupo-1/estudiantes/est-1',
        { method: 'DELETE' }
      );
    });
  });
});
