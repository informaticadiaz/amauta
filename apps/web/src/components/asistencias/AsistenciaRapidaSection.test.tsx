import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AsistenciaRapidaSection } from './AsistenciaRapidaSection';

jest.mock('@/hooks/useAuthorization', () => ({
  useAuthorization: jest.fn(),
}));

const { useAuthorization } = jest.requireMock('@/hooks/useAuthorization') as {
  useAuthorization: jest.Mock;
};

describe('AsistenciaRapidaSection', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('debería cargar grupos y mostrar la nómina del grupo seleccionado', async () => {
    useAuthorization.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      isAdminEscuela: true,
      isEducador: false,
    });

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          institucionId: 'inst-1',
          nombre: 'Institución Demo',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          grupos: [{ id: 'grupo-1', nombre: '3ro A' }],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          grupoId: 'grupo-1',
          fecha: '2026-03-29',
          estudiantes: [
            {
              id: 'cm8estudiante000000000000001',
              nombre: 'Ana',
              apellido: 'Pérez',
              email: 'ana@test.com',
              asistencia: null,
            },
          ],
        }),
      });

    render(<AsistenciaRapidaSection />);

    expect(await screen.findByLabelText(/grupo/i)).toBeInTheDocument();
    expect(await screen.findByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText(/sin registrar/i)).toBeInTheDocument();
  });

  it('debería enviar solo los cambios pendientes en el payload esperado', async () => {
    const user = userEvent.setup();

    useAuthorization.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      isAdminEscuela: false,
      isEducador: true,
    });

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          grupos: [{ id: 'grupo-1', nombre: '3ro A', rol: 'TITULAR' }],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          grupoId: 'grupo-1',
          fecha: '2026-03-29',
          estudiantes: [
            {
              id: 'cm8estudiante000000000000001',
              nombre: 'Ana',
              apellido: 'Pérez',
              email: 'ana@test.com',
              asistencia: null,
            },
            {
              id: 'cm8estudiante000000000000002',
              nombre: 'Luis',
              apellido: 'Gómez',
              email: 'luis@test.com',
              asistencia: null,
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          resultado: {
            grupoId: 'grupo-1',
            fecha: '2026-03-29',
            procesadas: 1,
            creadas: 1,
            actualizadas: 0,
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          grupoId: 'grupo-1',
          fecha: '2026-03-29',
          estudiantes: [
            {
              id: 'cm8estudiante000000000000001',
              nombre: 'Ana',
              apellido: 'Pérez',
              email: 'ana@test.com',
              asistencia: {
                estado: 'AUSENTE',
                observaciones: null,
              },
            },
            {
              id: 'cm8estudiante000000000000002',
              nombre: 'Luis',
              apellido: 'Gómez',
              email: 'luis@test.com',
              asistencia: null,
            },
          ],
        }),
      });

    render(<AsistenciaRapidaSection />);

    await screen.findByText('Ana Pérez');
    await user.click(screen.getByRole('button', { name: /ausente-ana/i }));
    await user.click(
      screen.getByRole('button', { name: /guardar asistencias/i })
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/grupos/grupo-1/asistencias',
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fecha: '2026-03-29',
            asistencias: [
              {
                estudianteId: 'cm8estudiante000000000000001',
                estado: 'AUSENTE',
              },
            ],
          }),
        })
      );
    });
  });

  it('debería exigir observación cuando se edita una asistencia existente del mismo día', async () => {
    const user = userEvent.setup();

    useAuthorization.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      isAdminEscuela: false,
      isEducador: true,
    });

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          grupos: [{ id: 'grupo-1', nombre: '3ro A', rol: 'TITULAR' }],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          grupoId: 'grupo-1',
          fecha: '2026-03-29',
          estudiantes: [
            {
              id: 'cm8estudiante000000000000001',
              nombre: 'Ana',
              apellido: 'Pérez',
              email: 'ana@test.com',
              asistencia: {
                estado: 'PRESENTE',
                observaciones: null,
              },
            },
          ],
        }),
      });

    render(<AsistenciaRapidaSection />);

    await screen.findByText('Ana Pérez');
    await user.click(screen.getByRole('button', { name: /ausente-ana/i }));
    await user.click(
      screen.getByRole('button', { name: /guardar asistencias/i })
    );

    expect(
      await screen.findByText(/debés indicar una observación/i)
    ).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
