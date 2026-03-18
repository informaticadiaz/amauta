import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EvaluacionForm } from './EvaluacionForm';

const push = jest.fn();
const refresh = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push,
    refresh,
    prefetch: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

describe('EvaluacionForm', () => {
  const cursos = [
    { id: 'curso-1', titulo: 'Curso de Matemática' },
    { id: 'curso-2', titulo: 'Historia Argentina' },
  ];

  beforeEach(() => {
    push.mockClear();
    refresh.mockClear();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('debería renderizar los campos principales', () => {
    render(<EvaluacionForm cursos={cursos} />);

    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/curso/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /crear evaluación/i })
    ).toBeInTheDocument();
  });

  it('debería mostrar error si falta el título', async () => {
    const user = userEvent.setup();
    render(<EvaluacionForm cursos={cursos} />);

    await user.selectOptions(screen.getByLabelText(/curso/i), 'curso-1');
    const form = screen
      .getByRole('button', { name: /crear evaluación/i })
      .closest('form');
    if (!form) {
      throw new Error('No se encontró el formulario');
    }
    fireEvent.submit(form);

    expect(
      await screen.findByText(/el título debe tener al menos 3 caracteres/i)
    ).toBeInTheDocument();
  });

  it('debería mostrar error si no se selecciona un curso', async () => {
    const user = userEvent.setup();
    render(<EvaluacionForm cursos={cursos} />);

    await user.type(screen.getByLabelText(/título/i), 'Evaluación 1');
    const form = screen
      .getByRole('button', { name: /crear evaluación/i })
      .closest('form');
    if (!form) {
      throw new Error('No se encontró el formulario');
    }
    fireEvent.submit(form);

    expect(
      await screen.findByText(/selecciona un curso/i, { selector: 'div' })
    ).toBeInTheDocument();
  });

  it('debería enviar el formulario con datos válidos', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ evaluacion: { id: 'eval-1' } }),
    });

    render(<EvaluacionForm cursos={cursos} />);

    await user.type(screen.getByLabelText(/título/i), 'Evaluación 1');
    await user.type(
      screen.getByLabelText(/descripción/i),
      'Descripción de la evaluación'
    );
    await user.selectOptions(screen.getByLabelText(/curso/i), 'curso-2');
    await user.type(screen.getByLabelText(/puntaje mínimo/i), '70');
    await user.type(screen.getByLabelText(/intentos máximos/i), '2');
    await user.type(screen.getByLabelText(/tiempo límite/i), '45');

    fireEvent.click(screen.getByRole('button', { name: /crear evaluación/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('/api/evaluaciones');
    expect(options.method).toBe('POST');

    const body = JSON.parse(options.body as string);
    expect(body).toEqual({
      titulo: 'Evaluación 1',
      descripcion: 'Descripción de la evaluación',
      cursoId: 'curso-2',
      puntajeMinimo: 70,
      intentosMaximos: 2,
      tiempoLimiteMin: 45,
    });

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/dashboard/evaluaciones?creada=1');
      expect(refresh).toHaveBeenCalled();
    });
  });
});
