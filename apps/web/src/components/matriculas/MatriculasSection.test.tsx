import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MatriculasSection } from './MatriculasSection';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn() }),
}));
jest.mock('@/hooks/useAuthorization', () => ({ useAuthorization: jest.fn() }));
const { useAuthorization } = jest.requireMock('@/hooks/useAuthorization') as {
  useAuthorization: jest.Mock;
};

const matricula = {
  id: 'm-1',
  estado: 'ACTIVA',
  observaciones: null,
  fechaInscripcion: '2026-01-01',
  estudiante: {
    id: 'e-1',
    nombre: 'Ana',
    apellido: 'Gómez',
    email: 'ana@test',
  },
  periodoAcademico: { id: 'p-1', nombre: '2026', activo: true },
};
function response(body: unknown, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

function setupFetch() {
  const fetchMock = jest.fn((input: RequestInfo | URL) => {
    const url = String(input);
    if (url === '/api/mi-institucion')
      return Promise.resolve(
        response({ institucionId: 'i-1', nombre: 'Escuela' })
      );
    if (url.includes('/periodos'))
      return Promise.resolve(
        response({ periodos: [{ id: 'p-1', nombre: '2026', activo: true }] })
      );
    if (url.includes('/estudiantes'))
      return Promise.resolve(
        response({
          usuarios: [
            { id: 'e-1', nombre: 'Ana', apellido: 'Gómez', email: 'ana@test' },
          ],
        })
      );
    if (url.includes('/matriculas'))
      return Promise.resolve(
        response({
          matriculas: [matricula],
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        })
      );
    return Promise.resolve(response({}));
  });
  global.fetch = fetchMock;
  return fetchMock;
}

describe('MatriculasSection', () => {
  beforeEach(() => {
    useAuthorization.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      isAdminEscuela: true,
    });
  });
  afterEach(() => jest.resetAllMocks());

  it('muestra carga y luego el padrón con filtros', async () => {
    const fetchMock = setupFetch();
    render(<MatriculasSection />);
    expect(screen.getByRole('status')).toHaveTextContent(/cargando/i);
    await waitFor(() =>
      expect(screen.getByText(/Gómez, Ana/)).toBeInTheDocument()
    );
    await userEvent.selectOptions(
      screen.getByLabelText('Filtrar por estado'),
      'BAJA'
    );
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('estado=BAJA')
      )
    );
  });

  it('crea una matrícula y envía el cuerpo esperado', async () => {
    const fetchMock = setupFetch();
    render(<MatriculasSection />);
    await waitFor(() =>
      expect(screen.getByText(/Gómez, Ana/)).toBeInTheDocument()
    );
    await userEvent.selectOptions(screen.getByLabelText('Estudiante'), 'e-1');
    await userEvent.type(
      screen.getByLabelText('Observaciones de nueva matrícula'),
      'Ingreso'
    );
    await userEvent.click(
      screen.getByRole('button', { name: /matricular estudiante/i })
    );
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/instituciones/i-1/matriculas',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            estudianteId: 'e-1',
            periodoAcademicoId: 'p-1',
            observaciones: 'Ingreso',
          }),
        })
      )
    );
  });

  it('actualiza estado y observaciones de una matrícula', async () => {
    const fetchMock = setupFetch();
    render(<MatriculasSection />);
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Guardar' })
      ).toBeInTheDocument()
    );
    await userEvent.selectOptions(
      screen.getByLabelText('Estado de Ana'),
      'BAJA'
    );
    await userEvent.type(
      screen.getByLabelText('Observaciones de Ana'),
      'Traslado'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/matriculas/m-1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ estado: 'BAJA', observaciones: 'Traslado' }),
        })
      )
    );
  });
});
