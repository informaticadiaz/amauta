import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('deberia permitir publicar la evaluacion desde la UI', async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock).mockImplementation(
      async (input: RequestInfo, init?: RequestInit) => {
        if (input === '/api/evaluaciones/eval-1' && !init?.method) {
          return {
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
          };
        }

        if (
          input === '/api/evaluaciones/eval-1/publicar' &&
          init?.method === 'PATCH'
        ) {
          const body = JSON.parse(String(init.body));
          if (body.publicar !== true) {
            return {
              ok: false,
              status: 400,
              json: async () => ({ message: 'Payload invalido' }),
            };
          }

          return {
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
                publicada: true,
                publicadoEn: new Date('2026-03-03T12:00:00Z').toISOString(),
                createdAt: new Date('2026-03-01T12:00:00Z').toISOString(),
                updatedAt: new Date('2026-03-03T12:00:00Z').toISOString(),
              },
              message: 'Evaluacion publicada exitosamente',
            }),
          };
        }

        return {
          ok: false,
          status: 500,
          json: async () => ({ message: 'Error inesperado' }),
        };
      }
    );

    render(<EvaluacionDetalle evaluacionId="eval-1" />);

    const publishButton = await screen.findByRole('button', {
      name: /publicar/i,
    });

    await user.click(publishButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/evaluaciones/eval-1/publicar',
        expect.objectContaining({ method: 'PATCH' })
      );
    });

    expect(
      await screen.findByText(/evaluacion publicada exitosamente/i)
    ).toBeInTheDocument();
  });
});
