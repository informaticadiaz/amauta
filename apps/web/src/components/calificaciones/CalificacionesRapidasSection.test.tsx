import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalificacionesRapidasSection } from './CalificacionesRapidasSection';

jest.mock('@/hooks/useAuthorization', () => ({
  useAuthorization: jest.fn(),
}));

const { useAuthorization } = jest.requireMock('@/hooks/useAuthorization') as {
  useAuthorization: jest.Mock;
};

describe('CalificacionesRapidasSection', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('debería cargar grupos, períodos y mostrar la nómina con notas', async () => {
    const user = userEvent.setup();

    useAuthorization.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      isAdminEscuela: true,
      isEducador: false,
    });

    (global.fetch as jest.Mock)
      // 1. mi-institucion
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          institucionId: 'inst-1',
          nombre: 'Institución Demo',
        }),
      })
      // 2. grupos de la institución
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          grupos: [{ id: 'grupo-1', nombre: '3ro A', institucionId: 'inst-1' }],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        }),
      })
      // 3. períodos de la institución
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          periodos: [
            { id: 'periodo-1', nombre: '2026 - 1er Semestre', activo: true },
          ],
        }),
      })
      // 4. nómina de calificaciones
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          grupoId: 'grupo-1',
          periodoAcademicoId: 'periodo-1',
          materia: 'Matemática',
          estudiantes: [
            {
              estudianteId: 'cm8estudiante000000000000001',
              nombre: 'Ana',
              apellido: 'Pérez',
              email: 'ana@test.com',
              nota: null,
              observaciones: null,
            },
          ],
        }),
      });

    render(<CalificacionesRapidasSection />);

    // Espera a que carguen grupos y períodos (opción visible en el select)
    await screen.findByRole('option', { name: /2026 - 1er Semestre/i });

    // Selecciona período
    await user.selectOptions(
      screen.getByLabelText(/período académico/i),
      'periodo-1'
    );

    // Ingresa materia y busca
    const materiaInput = screen.getByLabelText(/materia/i);
    await user.type(materiaInput, 'Matemática');

    const buscarBtn = screen.getByRole('button', { name: /buscar/i });
    await user.click(buscarBtn);

    // Verifica que aparece el estudiante
    expect(await screen.findByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText(/sin nota/i)).toBeInTheDocument();
  });

  it('debería enviar solo los cambios pendientes al guardar calificaciones', async () => {
    const user = userEvent.setup();

    useAuthorization.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      isAdminEscuela: false,
      isEducador: true,
    });

    (global.fetch as jest.Mock)
      // 1. grupos del educador (incluye institucionId en cada grupo)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          grupos: [
            {
              id: 'grupo-1',
              nombre: '3ro A',
              rol: 'TITULAR',
              institucionId: 'inst-1',
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        }),
      })
      // 2. períodos de la institución del grupo
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          periodos: [
            { id: 'periodo-1', nombre: '2026 - 1er Semestre', activo: true },
          ],
        }),
      })
      // 3. nómina de calificaciones
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          grupoId: 'grupo-1',
          periodoAcademicoId: 'periodo-1',
          materia: 'Lengua',
          estudiantes: [
            {
              estudianteId: 'cm8estudiante000000000000001',
              nombre: 'Ana',
              apellido: 'Pérez',
              email: 'ana@test.com',
              nota: null,
              observaciones: null,
            },
            {
              estudianteId: 'cm8estudiante000000000000002',
              nombre: 'Luis',
              apellido: 'Gómez',
              email: 'luis@test.com',
              nota: 8,
              observaciones: null,
            },
          ],
        }),
      })
      // 4. respuesta del PUT
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          resultado: {
            grupoId: 'grupo-1',
            periodoAcademicoId: 'periodo-1',
            materia: 'Lengua',
            procesadas: 1,
          },
          message: 'Calificaciones cargadas exitosamente',
        }),
      })
      // 5. refresh de la nómina
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          grupoId: 'grupo-1',
          periodoAcademicoId: 'periodo-1',
          materia: 'Lengua',
          estudiantes: [
            {
              estudianteId: 'cm8estudiante000000000000001',
              nombre: 'Ana',
              apellido: 'Pérez',
              email: 'ana@test.com',
              nota: 9,
              observaciones: null,
            },
            {
              estudianteId: 'cm8estudiante000000000000002',
              nombre: 'Luis',
              apellido: 'Gómez',
              email: 'luis@test.com',
              nota: 8,
              observaciones: null,
            },
          ],
        }),
      });

    render(<CalificacionesRapidasSection />);

    // Espera a que carguen los períodos
    await screen.findByRole('option', { name: /2026 - 1er Semestre/i });

    // Selecciona período
    await user.selectOptions(
      screen.getByLabelText(/período académico/i),
      'periodo-1'
    );

    // Ingresa materia y busca
    await user.type(screen.getByLabelText(/materia/i), 'Lengua');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    await screen.findByText('Ana Pérez');

    // Solo edita la nota de Ana (Luis ya tiene nota 8, no la cambia)
    const notaAnaInput = screen.getByRole('spinbutton', { name: /nota-Ana/i });
    await user.clear(notaAnaInput);
    await user.type(notaAnaInput, '9');

    await user.click(
      screen.getByRole('button', { name: /guardar calificaciones/i })
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/grupos/grupo-1/calificaciones',
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            periodoAcademicoId: 'periodo-1',
            materia: 'Lengua',
            calificaciones: [
              {
                estudianteId: 'cm8estudiante000000000000001',
                nota: 9,
              },
            ],
          }),
        })
      );
    });
  });

  it('debería mostrar estado vacío cuando la nómina no tiene estudiantes', async () => {
    const user = userEvent.setup();

    useAuthorization.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      isAdminEscuela: true,
      isEducador: false,
    });

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ institucionId: 'inst-1', nombre: 'Demo' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          grupos: [{ id: 'grupo-1', nombre: '3ro A', institucionId: 'inst-1' }],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          periodos: [
            { id: 'periodo-1', nombre: '2026 - 1er Semestre', activo: true },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          grupoId: 'grupo-1',
          periodoAcademicoId: 'periodo-1',
          materia: 'Física',
          estudiantes: [],
        }),
      });

    render(<CalificacionesRapidasSection />);

    // Espera a que carguen los períodos
    await screen.findByRole('option', { name: /2026 - 1er Semestre/i });

    await user.selectOptions(
      screen.getByLabelText(/período académico/i),
      'periodo-1'
    );
    await user.type(screen.getByLabelText(/materia/i), 'Física');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    expect(
      await screen.findByText(/no hay estudiantes activos/i)
    ).toBeInTheDocument();
  });
});
