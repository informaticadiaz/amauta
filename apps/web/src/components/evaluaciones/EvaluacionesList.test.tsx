import { render, screen, waitFor } from '@testing-library/react';
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
});
