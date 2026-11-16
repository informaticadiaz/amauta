import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TutorEstudiantesSection } from './TutorEstudiantesSection';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn() }),
}));
jest.mock('@/hooks/useAuthorization', () => ({ useAuthorization: jest.fn() }));
const { useAuthorization } = jest.requireMock('@/hooks/useAuthorization') as {
  useAuthorization: jest.Mock;
};

const response = (body: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});
const link = {
  id: 'link-1',
  relacion: 'PADRE',
  tutor: { id: 't-1', nombre: 'Luis', apellido: 'Pérez', email: 'luis@test' },
  estudiante: {
    id: 's-1',
    nombre: 'Ana',
    apellido: 'Gómez',
    email: 'ana@test',
  },
};

function setupFetch() {
  const fetchMock = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url === '/api/mi-institucion')
      return Promise.resolve(response({ institucionId: 'i-1' }));
    if (url.includes('/estudiantes'))
      return Promise.resolve(
        response({
          usuarios: [
            { id: 's-1', nombre: 'Ana', apellido: 'Gómez', email: 'ana@test' },
          ],
        })
      );
    if (url.includes('/tutores-estudiantes') && init?.method === 'POST')
      return Promise.resolve(response({ vinculo: link }));
    if (
      url.includes('/tutores-estudiantes/link-1') &&
      init?.method === 'DELETE'
    )
      return Promise.resolve(response(null, 204));
    if (url.includes('/tutores-estudiantes'))
      return Promise.resolve(response({ vinculos: [link] }));
    return Promise.resolve(response({}));
  });
  global.fetch = fetchMock;
  return fetchMock;
}

describe('TutorEstudiantesSection', () => {
  beforeEach(() =>
    useAuthorization.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      isAdmin: true,
      isSuperAdmin: false,
    })
  );
  afterEach(() => jest.resetAllMocks());

  it('muestra carga, carga estudiantes y vínculos', async () => {
    setupFetch();
    render(<TutorEstudiantesSection />);
    expect(screen.getByRole('status')).toHaveTextContent(/cargando/i);
    expect(await screen.findByText(/Pérez, Luis/)).toBeInTheDocument();
    expect(screen.getAllByText(/Gómez, Ana/).length).toBeGreaterThan(0);
  });

  it('no muestra contenido a un usuario no autorizado', () => {
    useAuthorization.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      isAdmin: false,
      isSuperAdmin: false,
    });
    render(<TutorEstudiantesSection />);
    expect(screen.queryByText(/Vincular tutor/i)).not.toBeInTheDocument();
  });

  it('valida y crea un vínculo exitosamente', async () => {
    const fetchMock = setupFetch();
    render(<TutorEstudiantesSection />);
    await screen.findByText(/Pérez, Luis/);
    await userEvent.click(
      screen.getByRole('button', { name: /vincular tutor/i })
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(/obligatorios/i);
    await userEvent.type(screen.getByLabelText('ID del tutor'), 't-1');
    await userEvent.selectOptions(screen.getByLabelText('Estudiante'), 's-1');
    await userEvent.click(
      screen.getByRole('button', { name: /vincular tutor/i })
    );
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/instituciones/i-1/tutores-estudiantes',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            tutorId: 't-1',
            estudianteId: 's-1',
            relacion: 'PADRE',
          }),
        })
      )
    );
  });

  it('desactiva un vínculo mediante DELETE', async () => {
    const fetchMock = setupFetch();
    render(<TutorEstudiantesSection />);
    await screen.findByText(/Pérez, Luis/);
    await userEvent.click(screen.getByRole('button', { name: /desactivar/i }));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/instituciones/i-1/tutores-estudiantes/link-1',
        { method: 'DELETE' }
      )
    );
  });
});
