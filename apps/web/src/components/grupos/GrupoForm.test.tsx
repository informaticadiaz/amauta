/**
 * Tests para GrupoForm
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GrupoForm } from './GrupoForm';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: jest.fn() }),
}));

const mockPeriodos = [
  { id: 'periodo-1', nombre: '2025 - Primer Semestre' },
  { id: 'periodo-2', nombre: '2025 - Segundo Semestre' },
];

const mockGrupo = {
  id: 'grupo-1',
  nombre: '3ro A',
  grado: '3ro',
  seccion: 'A',
  activo: true,
  periodoAcademicoId: 'periodo-1',
  educadorId: 'educador-uuid-123',
};

describe('GrupoForm', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    mockPush.mockClear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('debería renderizar todos los campos del formulario', () => {
    render(<GrupoForm institucionId="inst-1" periodos={mockPeriodos} />);

    expect(screen.getByLabelText(/nombre del grupo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/grado/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sección/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/período académico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/id del educador/i)).toBeInTheDocument();
  });

  it('debería mostrar botón "Crear grupo" cuando no hay grupo', () => {
    render(<GrupoForm institucionId="inst-1" periodos={mockPeriodos} />);

    expect(
      screen.getByRole('button', { name: /crear grupo/i })
    ).toBeInTheDocument();
  });

  it('debería mostrar botón "Guardar cambios" cuando se edita', () => {
    render(
      <GrupoForm
        institucionId="inst-1"
        periodos={mockPeriodos}
        grupo={mockGrupo}
      />
    );

    expect(
      screen.getByRole('button', { name: /guardar cambios/i })
    ).toBeInTheDocument();
  });

  it('debería pre-rellenar campos cuando se edita un grupo', () => {
    render(
      <GrupoForm
        institucionId="inst-1"
        periodos={mockPeriodos}
        grupo={mockGrupo}
      />
    );

    expect(screen.getByDisplayValue('3ro A')).toBeInTheDocument();
    expect(screen.getByDisplayValue('3ro')).toBeInTheDocument();
    expect(screen.getByDisplayValue('A')).toBeInTheDocument();
    expect(screen.getByDisplayValue('educador-uuid-123')).toBeInTheDocument();
  });

  it('debería mostrar error cuando nombre está vacío al enviar', async () => {
    const user = userEvent.setup();
    render(<GrupoForm institucionId="inst-1" periodos={mockPeriodos} />);

    const submitBtn = screen.getByRole('button', { name: /crear grupo/i });
    await user.click(submitBtn);

    expect(screen.getByText(/el nombre es requerido/i)).toBeInTheDocument();
  });

  it('debería mostrar error cuando educadorId está vacío al enviar', async () => {
    const user = userEvent.setup();
    render(<GrupoForm institucionId="inst-1" periodos={mockPeriodos} />);

    const nombreInput = screen.getByLabelText(/nombre del grupo/i);
    await user.type(nombreInput, '3ro A');

    const submitBtn = screen.getByRole('button', { name: /crear grupo/i });
    await user.click(submitBtn);

    expect(screen.getByText(/el educador es requerido/i)).toBeInTheDocument();
  });

  it('debería enviar datos correctos al crear grupo', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        grupo: { id: 'nuevo-id', nombre: '3ro A' },
        message: 'Grupo creado',
      }),
    });

    render(<GrupoForm institucionId="inst-1" periodos={mockPeriodos} />);

    await user.type(screen.getByLabelText(/nombre del grupo/i), '3ro A');
    await user.type(screen.getByLabelText(/grado/i), '3ro');
    await user.selectOptions(
      screen.getByLabelText(/período académico/i),
      'periodo-1'
    );
    await user.type(
      screen.getByLabelText(/id del educador/i),
      'educador-uuid-123'
    );

    await user.click(screen.getByRole('button', { name: /crear grupo/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/grupos'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('3ro A'),
        })
      );
    });
  });

  it('debería redirigir a /dashboard/grupos después de crear', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        grupo: { id: 'nuevo-id', nombre: '3ro A' },
        message: 'Grupo creado',
      }),
    });

    render(<GrupoForm institucionId="inst-1" periodos={mockPeriodos} />);

    await user.type(screen.getByLabelText(/nombre del grupo/i), '3ro A');
    await user.selectOptions(
      screen.getByLabelText(/período académico/i),
      'periodo-1'
    );
    await user.type(
      screen.getByLabelText(/id del educador/i),
      'educador-uuid-123'
    );

    await user.click(screen.getByRole('button', { name: /crear grupo/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard/grupos');
    });
  });

  it('debería mostrar error de API cuando falla la creación', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({
        message: 'El educador no pertenece a la institución',
      }),
    });

    render(<GrupoForm institucionId="inst-1" periodos={mockPeriodos} />);

    await user.type(screen.getByLabelText(/nombre del grupo/i), '3ro A');
    await user.selectOptions(
      screen.getByLabelText(/período académico/i),
      'periodo-1'
    );
    await user.type(
      screen.getByLabelText(/id del educador/i),
      'educador-invalido'
    );

    await user.click(screen.getByRole('button', { name: /crear grupo/i }));

    expect(
      await screen.findByText(/el educador no pertenece a la institución/i)
    ).toBeInTheDocument();
  });

  it('debería deshabilitar el botón mientras se envía el formulario', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ grupo: { id: 'id' }, message: 'ok' }),
            });
          }, 100);
        })
    );

    render(<GrupoForm institucionId="inst-1" periodos={mockPeriodos} />);

    await user.type(screen.getByLabelText(/nombre del grupo/i), '3ro A');
    await user.selectOptions(
      screen.getByLabelText(/período académico/i),
      'periodo-1'
    );
    await user.type(
      screen.getByLabelText(/id del educador/i),
      'educador-uuid-123'
    );

    const submitBtn = screen.getByRole('button', { name: /crear grupo/i });
    await user.click(submitBtn);

    expect(submitBtn).toBeDisabled();
  });
});
