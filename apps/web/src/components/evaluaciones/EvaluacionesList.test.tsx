import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EvaluacionesList } from './EvaluacionesList';

describe('EvaluacionesList', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('debería renderizar el selector de curso', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        evaluaciones: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      }),
    });

    render(
      <EvaluacionesList cursos={[{ id: 'curso-1', titulo: 'Curso 1' }]} />
    );

    expect(screen.getByLabelText(/curso/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('debería mostrar empty state cuando no hay evaluaciones', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        evaluaciones: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      }),
    });

    render(
      <EvaluacionesList cursos={[{ id: 'curso-1', titulo: 'Curso 1' }]} />
    );

    expect(
      await screen.findByText(/todavía no hay evaluaciones/i)
    ).toBeInTheDocument();
  });

  it('debería mostrar mensaje cuando no hay cursos', () => {
    render(<EvaluacionesList cursos={[]} />);

    expect(
      screen.getByText(/todavía no tenés cursos disponibles/i)
    ).toBeInTheDocument();
  });

  it('debería mostrar error y permitir reintentar', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Error al cargar evaluaciones' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          evaluaciones: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        }),
      });

    render(
      <EvaluacionesList cursos={[{ id: 'curso-1', titulo: 'Curso 1' }]} />
    );

    expect(
      await screen.findByText(/error al cargar evaluaciones/i)
    ).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /reintentar/i });
    await user.click(retryButton);

    expect(
      await screen.findByText(/todavía no hay evaluaciones/i)
    ).toBeInTheDocument();
  });

  it('debería renderizar evaluaciones cuando hay resultados', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        evaluaciones: [
          {
            id: 'eval-1',
            titulo: 'Evaluación Diagnóstico',
            descripcion: 'Evaluación inicial del curso',
            publicada: true,
            tiempoLimiteMin: 30,
            puntajeMinimo: 70,
            intentosMaximos: 2,
            createdAt: new Date('2026-03-01T12:00:00Z').toISOString(),
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      }),
    });

    render(
      <EvaluacionesList cursos={[{ id: 'curso-1', titulo: 'Curso 1' }]} />
    );

    expect(
      await screen.findByText(/evaluación diagnóstico/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/publicada/i)).toBeInTheDocument();
    expect(screen.getByText(/tiempo 30 min/i)).toBeInTheDocument();
    expect(screen.getByText(/puntaje mín. 70/i)).toBeInTheDocument();
    expect(screen.getByText(/intentos 2/i)).toBeInTheDocument();
  });
});
