import { render, screen, waitFor } from '@testing-library/react';
import EstudiantesHistorialPage from './page';

jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));
jest.mock('@/hooks/useAuthorization', () => ({ useAuthorization: jest.fn() }));

const { useRouter } = jest.requireMock('next/navigation') as {
  useRouter: jest.Mock;
};
const { useAuthorization } = jest.requireMock('@/hooks/useAuthorization') as {
  useAuthorization: jest.Mock;
};

describe('EstudiantesHistorialPage', () => {
  const replace = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue({ replace });
    global.fetch = jest.fn().mockImplementation((url: string) =>
      url === '/api/mi-institucion'
        ? Promise.resolve({
            ok: true,
            json: async () => ({ institucionId: 'inst-1' }),
          })
        : Promise.resolve({ ok: true, json: async () => ({ usuarios: [] }) })
    );
  });

  it('protege la vista para ADMIN_ESCUELA y carga estudiantes', async () => {
    useAuthorization.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      isAdminEscuela: true,
    });
    render(<EstudiantesHistorialPage />);
    expect(
      await screen.findByRole('heading', { name: /historial de estudiantes/i })
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/instituciones/inst-1/estudiantes?limit=100'
      )
    );
  });

  it('redirige roles no autorizados', () => {
    useAuthorization.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      isAdminEscuela: false,
    });
    render(<EstudiantesHistorialPage />);
    expect(replace).toHaveBeenCalledWith('/dashboard');
  });
});
