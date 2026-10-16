import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalificacionesRapidasSection } from './CalificacionesRapidasSection';

jest.mock('@/hooks/useAuthorization', () => ({ useAuthorization: jest.fn() }));
const { useAuthorization } = jest.requireMock('@/hooks/useAuthorization') as {
  useAuthorization: jest.Mock;
};

describe('CalificacionesRapidasSection', () => {
  beforeEach(() => {
    useAuthorization.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      isAdminEscuela: true,
      isEducador: false,
    });
    global.fetch = jest.fn(async (input: string) => {
      if (input === '/api/mi-institucion')
        return {
          ok: true,
          json: async () => ({ institucionId: 'inst-1', nombre: 'Demo' }),
        };
      if (input.startsWith('/api/grupos?'))
        return {
          ok: true,
          json: async () => ({
            grupos: [
              { id: 'grupo-1', nombre: '3ro A', institucionId: 'inst-1' },
            ],
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1,
          }),
        };
      if (input === '/api/grupos/grupo-1/materias')
        return {
          ok: true,
          json: async () => ({
            materias: [{ id: 'materia-1', nombre: 'Matemática' }],
          }),
        };
      if (input.startsWith('/api/instituciones/inst-1/periodos'))
        return {
          ok: true,
          json: async () => ({
            periodos: [
              { id: 'periodo-1', nombre: '2026 - 1er Semestre', activo: true },
            ],
          }),
        };
      if (input.includes('/calificaciones?'))
        return {
          ok: true,
          json: async () => ({
            grupoId: 'grupo-1',
            periodoAcademicoId: 'periodo-1',
            materia: { id: 'materia-1', nombre: 'Matemática' },
            estudiantes: [],
          }),
        };
      throw new Error(`Unexpected fetch ${input}`);
    }) as jest.Mock;
  });
  afterEach(() => jest.resetAllMocks());

  it('consulta calificaciones por materiaId asignada al grupo, nunca por texto libre', async () => {
    const user = userEvent.setup();
    render(<CalificacionesRapidasSection />);
    await screen.findByRole('option', { name: 'Matemática' });
    await user.selectOptions(
      screen.getByLabelText(/período académico/i),
      'periodo-1'
    );
    await user.selectOptions(screen.getByLabelText(/materia/i), 'materia-1');
    await user.click(screen.getByRole('button', { name: /buscar/i }));
    expect(
      await screen.findByText(/no hay estudiantes activos/i)
    ).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/grupos/grupo-1/calificaciones?periodoAcademicoId=periodo-1&materiaId=materia-1'
    );
  });
});
