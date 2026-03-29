/**
 * Tests para FiltrosCursos
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FiltrosCursos } from '../FiltrosCursos';

const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

describe('FiltrosCursos', () => {
  const categoriasMock = [
    { id: 'cat1', nombre: 'Programación', slug: 'programacion' },
    { id: 'cat2', nombre: 'Diseño', slug: 'diseno' },
    { id: 'cat3', nombre: 'Matemáticas', slug: 'matematicas' },
  ];

  beforeEach(() => {
    mockPush.mockClear();
    mockSearchParams.delete('categoriaId');
    mockSearchParams.delete('nivel');
    mockSearchParams.delete('page');
  });

  it('renderiza el título de filtros', () => {
    render(<FiltrosCursos categorias={categoriasMock} />);

    expect(screen.getByText('Filtros')).toBeInTheDocument();
  });

  it('muestra todas las categorías', () => {
    render(<FiltrosCursos categorias={categoriasMock} />);

    expect(screen.getByText('Programación')).toBeInTheDocument();
    expect(screen.getByText('Diseño')).toBeInTheDocument();
    expect(screen.getByText('Matemáticas')).toBeInTheDocument();
  });

  it('muestra todos los niveles', () => {
    render(<FiltrosCursos categorias={categoriasMock} />);

    expect(screen.getByText('Principiante')).toBeInTheDocument();
    expect(screen.getByText('Intermedio')).toBeInTheDocument();
    expect(screen.getByText('Avanzado')).toBeInTheDocument();
  });

  it('muestra mensaje cuando no hay categorías', () => {
    render(<FiltrosCursos categorias={[]} />);

    expect(
      screen.getByText(/no hay categorías disponibles/i)
    ).toBeInTheDocument();
  });

  it('aplica filtro de categoría al hacer click', async () => {
    const user = userEvent.setup();
    render(<FiltrosCursos categorias={categoriasMock} />);

    const programacionBtn = screen.getByText('Programación');
    await user.click(programacionBtn);

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('categoriaId=cat1')
    );
  });

  it('aplica filtro de nivel al hacer click', async () => {
    const user = userEvent.setup();
    render(<FiltrosCursos categorias={categoriasMock} />);

    const principianteBtn = screen.getByText('Principiante');
    await user.click(principianteBtn);

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('nivel=PRINCIPIANTE')
    );
  });

  it('resetea a página 1 al aplicar filtro', async () => {
    mockSearchParams.set('page', '5');
    const user = userEvent.setup();
    render(<FiltrosCursos categorias={categoriasMock} />);

    const disenoBtn = screen.getByText('Diseño');
    await user.click(disenoBtn);

    const lastCall = mockPush.mock.calls[0][0];
    expect(lastCall).not.toContain('page=');
  });

  it('marca filtro de categoría como activo', () => {
    mockSearchParams.set('categoriaId', 'cat1');
    render(<FiltrosCursos categorias={categoriasMock} />);

    const programacionBtn = screen.getByRole('button', {
      name: 'Programación',
    });
    expect(programacionBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('marca filtro de nivel como activo', () => {
    mockSearchParams.set('nivel', 'INTERMEDIO');
    render(<FiltrosCursos categorias={categoriasMock} />);

    const intermedioBtn = screen.getByRole('button', { name: 'Intermedio' });
    expect(intermedioBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('muestra botón de limpiar cuando hay filtros activos', () => {
    mockSearchParams.set('categoriaId', 'cat1');
    render(<FiltrosCursos categorias={categoriasMock} />);

    expect(screen.getByText('Limpiar')).toBeInTheDocument();
  });

  it('no muestra botón de limpiar sin filtros activos', () => {
    render(<FiltrosCursos categorias={categoriasMock} />);

    expect(screen.queryByText('Limpiar')).not.toBeInTheDocument();
  });

  it('limpia todos los filtros al hacer click en Limpiar', async () => {
    mockSearchParams.set('categoriaId', 'cat1');
    mockSearchParams.set('nivel', 'AVANZADO');
    const user = userEvent.setup();
    render(<FiltrosCursos categorias={categoriasMock} />);

    const limpiarBtn = screen.getByText('Limpiar');
    await user.click(limpiarBtn);

    const lastCall = mockPush.mock.calls[0][0];
    expect(lastCall).not.toContain('categoriaId=');
    expect(lastCall).not.toContain('nivel=');
  });

  it('muestra sección de filtros activos cuando hay filtros', () => {
    mockSearchParams.set('categoriaId', 'cat1');
    render(<FiltrosCursos categorias={categoriasMock} />);

    expect(screen.getByText('Activos')).toBeInTheDocument();
  });

  it('muestra chips de filtros activos', () => {
    mockSearchParams.set('categoriaId', 'cat2');
    mockSearchParams.set('nivel', 'PRINCIPIANTE');
    render(<FiltrosCursos categorias={categoriasMock} />);

    // Buscar por el contenido dentro de los chips
    const chips = screen.getAllByText(/×/);
    expect(chips).toHaveLength(2);
  });

  it('permite quitar filtro individual desde el chip', async () => {
    mockSearchParams.set('categoriaId', 'cat1');
    const user = userEvent.setup();
    render(<FiltrosCursos categorias={categoriasMock} />);

    const removeButtons = screen.getAllByText('×');
    await user.click(removeButtons[0]);

    const lastCall = mockPush.mock.calls[0][0];
    expect(lastCall).not.toContain('categoriaId=');
  });

  it('quita filtro activo al hacer click nuevamente', async () => {
    mockSearchParams.set('categoriaId', 'cat1');
    const user = userEvent.setup();
    render(<FiltrosCursos categorias={categoriasMock} />);

    // Click en el filtro ya activo
    const programacionBtn = screen.getByRole('button', {
      name: 'Programación',
    });
    await user.click(programacionBtn);

    const lastCall = mockPush.mock.calls[0][0];
    expect(lastCall).not.toContain('categoriaId=cat1');
  });
});
