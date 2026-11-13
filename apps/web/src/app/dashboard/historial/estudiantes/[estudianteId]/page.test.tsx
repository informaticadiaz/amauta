import { render, screen, waitFor } from '@testing-library/react';
import EstudianteHistorialPage from './page';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));
jest.mock('@/hooks/useAuthorization', () => ({ useAuthorization: jest.fn() }));
jest.mock('@/components/historial/HistorialAcademico', () => ({
  HistorialAcademico: () => <div>Historial renderizado</div>,
}));

const { useRouter, useParams } = jest.requireMock('next/navigation') as {
  useRouter: jest.Mock;
  useParams: jest.Mock;
};
const { useAuthorization } = jest.requireMock('@/hooks/useAuthorization') as {
  useAuthorization: jest.Mock;
};

describe('EstudianteHistorialPage', () => {
  const replace = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue({ replace, push: jest.fn() });
    useParams.mockReturnValue({ estudianteId: 'est-1' });
    useAuthorization.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      isAdminEscuela: true,
    });
  });

  it('resuelve institución, carga y reutiliza el historial', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ institucionId: 'inst-1' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          estudianteId: 'est-1',
          periodos: [],
          evolucionPorMateria: [],
          promedioAcumulado: null,
          estadoPromocion: null,
        }),
      });
    render(<EstudianteHistorialPage />);
    expect(
      await screen.findByText('Historial renderizado')
    ).toBeInTheDocument();
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      '/api/instituciones/inst-1/estudiantes/est-1/historial'
    );
  });

  it('muestra error del historial', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ institucionId: 'inst-1' }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Sin permisos' }),
      });
    render(<EstudianteHistorialPage />);
    expect(await screen.findByText('Sin permisos')).toBeInTheDocument();
  });

  it('redirige roles no autorizados', () => {
    useAuthorization.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      isAdminEscuela: false,
    });
    render(<EstudianteHistorialPage />);
    expect(replace).toHaveBeenCalledWith('/dashboard');
  });
});
