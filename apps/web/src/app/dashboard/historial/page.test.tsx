import { render, screen, waitFor } from '@testing-library/react';
import HistorialPage from './page';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/useAuthorization', () => ({
  useAuthorization: jest.fn(),
}));

const { useRouter } = jest.requireMock('next/navigation') as {
  useRouter: jest.Mock;
};
const { useAuthorization } = jest.requireMock('@/hooks/useAuthorization') as {
  useAuthorization: jest.Mock;
};

describe('HistorialPage', () => {
  const replace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue({ replace });
    global.fetch = jest.fn();
  });

  it('redirige a usuarios autenticados que no son estudiantes', () => {
    useAuthorization.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      isEstudiante: false,
    });

    render(<HistorialPage />);

    expect(replace).toHaveBeenCalledWith('/dashboard');
  });

  it('muestra el historial recibido del proxy', async () => {
    useAuthorization.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      isEstudiante: true,
    });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        estudianteId: 'student-1',
        promedioAcumulado: 8.25,
        estadoPromocion: null,
        periodos: [
          {
            id: 'period-1',
            nombre: 'Primer trimestre',
            orden: 1,
            promedio: 8.5,
            calificaciones: [],
          },
        ],
        evolucionPorMateria: [],
      }),
    });

    render(<HistorialPage />);

    await waitFor(() =>
      expect(screen.getByText('Primer trimestre')).toBeInTheDocument()
    );
    expect(global.fetch).toHaveBeenCalledWith('/api/me/historial');
  });
});
