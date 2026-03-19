import { render, screen, waitFor } from '@testing-library/react';
import { EvaluacionDetalle } from './EvaluacionDetalle';

describe('EvaluacionDetalle', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('deberia renderizar el titulo de la evaluacion', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        evaluacion: {
          id: 'eval-1',
          titulo: 'Evaluacion Diagnostico',
          descripcion: 'Descripcion de prueba',
          cursoId: 'curso-1',
          creadorId: 'user-1',
          tiempoLimiteMin: 30,
          puntajeMinimo: 70,
          intentosMaximos: 2,
          publicada: false,
          publicadoEn: null,
          createdAt: new Date('2026-03-01T12:00:00Z').toISOString(),
          updatedAt: new Date('2026-03-02T12:00:00Z').toISOString(),
        },
      }),
    });

    render(<EvaluacionDetalle evaluacionId="eval-1" />);

    expect(
      await screen.findByText(/evaluacion diagnostico/i)
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/evaluaciones/eval-1');
    });
  });
});
