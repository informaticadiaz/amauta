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
  // NOTE: avoid using fake timers globally because userEvent and async
  // helpers can break when timers are mocked. Tests that depend on a
  // specific fecha will explicitly set the date input to a deterministic
  // value instead of mocking Date.
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

    // Implement fetch mock based on URL + method to avoid fragile call-order
    const initialNomina = {
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
    };

    const updatedNomina = {
      grupoId: 'grupo-1',
      fecha: '2026-03-29',
      estudiantes: [
        {
          id: 'cm8estudiante000000000000001',
          nombre: 'Ana',
          apellido: 'Pérez',
          email: 'ana@test.com',
          asistencia: { estado: 'AUSENTE', observaciones: null },
        },
        {
          id: 'cm8estudiante000000000000002',
          nombre: 'Luis',
          apellido: 'Gómez',
          email: 'luis@test.com',
          asistencia: null,
        },
      ],
    };

    // Make the mock stateful: GET returns the current server state (initial until a
    // successful PUT occurs, then updated). This avoids races when the component
    // triggers extra GETs (for example after changing the fecha input) before the
    // test issues the PUT.
    let saved = false;
    const fetchMock = jest.fn(async (input, init) => {
      const url = typeof input === 'string' ? input : input?.url;
      if (url?.includes('/api/educadores/me/grupos')) {
        return {
          ok: true,
          json: async () => ({
            grupos: [{ id: 'grupo-1', nombre: '3ro A', rol: 'TITULAR' }],
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1,
          }),
        };
      }

      if (url?.includes('/api/grupos/grupo-1/asistencias')) {
        // PUT -> simulate saving and flip server-side state
        if (init?.method === 'PUT') {
          saved = true;
          return {
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
          };
        }

        // GET -> return current server state depending on whether we've 'saved'
        if (!saved) {
          return { ok: true, json: async () => initialNomina };
        }
        return { ok: true, json: async () => updatedNomina };
      }

      return { ok: false, json: async () => ({ message: 'not found' }) };
    });

    (global.fetch as jest.Mock) = fetchMock as unknown as jest.Mock;

    render(<AsistenciaRapidaSection />);

    await screen.findByText('Ana Pérez');
    // Ensure the fecha used by the component is deterministic for the test
    const fechaInput = screen.getByLabelText(/fecha/i) as HTMLInputElement;
    await user.clear(fechaInput);
    await user.type(fechaInput, '2026-03-29');

    await user.click(screen.getByRole('button', { name: /ausente-ana/i }));
    await user.click(
      screen.getByRole('button', { name: /guardar asistencias/i })
    );

    const expectedFecha = '2026-03-29';
    await waitFor(() => {
      const calls = (global.fetch as jest.Mock).mock.calls as Array<any>;
      const putCall = calls.find((c) => c[1]?.method === 'PUT');
      expect(putCall).toBeTruthy();
      const body = JSON.parse(putCall[1].body as string);
      expect(body).toEqual({
        fecha: expectedFecha,
        asistencias: [
          { estudianteId: 'cm8estudiante000000000000001', estado: 'AUSENTE' },
        ],
      });
      expect(putCall[1].headers).toEqual({
        'Content-Type': 'application/json',
      });
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

    // Similar URL-based mock for the third test
    const fetchMock2 = jest.fn(async (input, init) => {
      const url = typeof input === 'string' ? input : input?.url;
      if (url?.includes('/api/educadores/me/grupos')) {
        return {
          ok: true,
          json: async () => ({
            grupos: [{ id: 'grupo-1', nombre: '3ro A', rol: 'TITULAR' }],
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1,
          }),
        };
      }
      if (url?.includes('/api/grupos/grupo-1/asistencias')) {
        return {
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
                asistencia: { estado: 'PRESENTE', observaciones: null },
              },
            ],
          }),
        };
      }
      return { ok: false, json: async () => ({ message: 'not found' }) };
    });

    (global.fetch as jest.Mock) = fetchMock2 as unknown as jest.Mock;

    render(<AsistenciaRapidaSection />);

    await screen.findByText('Ana Pérez');
    // make fecha deterministic so the component treats the edit as same-day
    const fechaInput = screen.getByLabelText(/fecha/i) as HTMLInputElement;
    await user.clear(fechaInput);
    await user.type(fechaInput, '2026-03-29');

    await user.click(screen.getByRole('button', { name: /ausente-ana/i }));
    await user.click(
      screen.getByRole('button', { name: /guardar asistencias/i })
    );

    expect(
      await screen.findByText(/debés indicar una observación/i)
    ).toBeInTheDocument();
    const calls = (global.fetch as jest.Mock).mock.calls as Array<any>;
    expect(calls.length).toBeGreaterThanOrEqual(2);
  });
});
