/**
 * Tests para GruposList
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GruposList } from './GruposList';

const mockPeriodos = [
  { id: 'periodo-1', nombre: '2025 - Primer Semestre' },
  { id: 'periodo-2', nombre: '2025 - Segundo Semestre' },
];

const mockGrupos = [
  {
    id: 'grupo-1',
    nombre: '3ro A',
    grado: '3ro',
    seccion: 'A',
    activo: true,
    periodoAcademicoId: 'periodo-1',
    educadorId: 'educador-1',
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'grupo-2',
    nombre: '4to B',
    grado: '4to',
    seccion: 'B',
    activo: false,
    periodoAcademicoId: 'periodo-2',
    educadorId: 'educador-2',
    createdAt: '2026-02-01T10:00:00Z',
  },
];

describe('GruposList', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('debería mostrar estado de carga inicialmente', () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // nunca resuelve
    );

    render(<GruposList institucionId="inst-1" periodos={mockPeriodos} />);

    expect(screen.getByText(/cargando grupos/i)).toBeInTheDocument();
  });

  it('debería mostrar empty state cuando no hay grupos', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        grupos: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      }),
    });

    render(<GruposList institucionId="inst-1" periodos={mockPeriodos} />);

    expect(await screen.findByText(/no hay grupos/i)).toBeInTheDocument();
  });

  it('debería renderizar la lista de grupos', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        grupos: mockGrupos,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      }),
    });

    render(<GruposList institucionId="inst-1" periodos={mockPeriodos} />);

    expect(await screen.findByText('3ro A')).toBeInTheDocument();
    expect(screen.getByText('4to B')).toBeInTheDocument();
  });

  it('debería mostrar el estado activo/inactivo de cada grupo', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        grupos: mockGrupos,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      }),
    });

    render(<GruposList institucionId="inst-1" periodos={mockPeriodos} />);

    await screen.findByText('3ro A');
    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.getByText('Inactivo')).toBeInTheDocument();
  });

  it('debería mostrar error y permitir reintentar', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Error al cargar grupos' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          grupos: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        }),
      });

    render(<GruposList institucionId="inst-1" periodos={mockPeriodos} />);

    expect(
      await screen.findByText(/error al cargar grupos/i)
    ).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /reintentar/i });
    await user.click(retryBtn);

    expect(await screen.findByText(/no hay grupos/i)).toBeInTheDocument();
  });

  it('debería tener filtro de estado (activo/inactivo/todos)', () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        grupos: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      }),
    });

    render(<GruposList institucionId="inst-1" periodos={mockPeriodos} />);

    expect(screen.getByLabelText(/estado/i)).toBeInTheDocument();
  });

  it('debería tener filtro de período académico', () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        grupos: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      }),
    });

    render(<GruposList institucionId="inst-1" periodos={mockPeriodos} />);

    expect(screen.getByLabelText(/período/i)).toBeInTheDocument();
    expect(screen.getByText('2025 - Primer Semestre')).toBeInTheDocument();
    expect(screen.getByText('2025 - Segundo Semestre')).toBeInTheDocument();
  });

  it('debería llamar a la API con el filtro de estado aplicado', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        grupos: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      }),
    });

    render(<GruposList institucionId="inst-1" periodos={mockPeriodos} />);

    await screen.findByText(/no hay grupos/i);

    const estadoSelect = screen.getByLabelText(/estado/i);
    await user.selectOptions(estadoSelect, 'true');

    await waitFor(() => {
      const lastCall = (global.fetch as jest.Mock).mock.calls.at(
        -1
      )?.[0] as string;
      expect(lastCall).toContain('activo=true');
    });
  });

  it('debería mostrar link para crear grupo', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        grupos: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      }),
    });

    render(<GruposList institucionId="inst-1" periodos={mockPeriodos} />);

    await screen.findByText(/no hay grupos/i);
    const crearLink = screen.getByRole('link', { name: /nuevo grupo/i });
    expect(crearLink).toBeInTheDocument();
  });
});
