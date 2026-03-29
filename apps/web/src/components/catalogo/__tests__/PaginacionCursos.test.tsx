/**
 * Tests para PaginacionCursos
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaginacionCursos } from '../PaginacionCursos';

const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

describe('PaginacionCursos', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockSearchParams.delete('page');
    mockSearchParams.delete('buscar');
    mockSearchParams.delete('categoriaId');
  });

  it('renderiza los botones de navegación', () => {
    render(<PaginacionCursos currentPage={1} totalPages={5} />);

    expect(screen.getByLabelText(/página anterior/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/página siguiente/i)).toBeInTheDocument();
  });

  it('muestra el número de la página actual', () => {
    render(<PaginacionCursos currentPage={3} totalPages={10} />);

    const currentPageBtn = screen.getByLabelText('Página 3');
    expect(currentPageBtn).toBeInTheDocument();
    expect(currentPageBtn).toHaveAttribute('aria-current', 'page');
  });

  it('deshabilita botón anterior en la primera página', () => {
    render(<PaginacionCursos currentPage={1} totalPages={5} />);

    const prevBtn = screen.getByLabelText(/página anterior/i);
    expect(prevBtn).toBeDisabled();
  });

  it('deshabilita botón siguiente en la última página', () => {
    render(<PaginacionCursos currentPage={5} totalPages={5} />);

    const nextBtn = screen.getByLabelText(/página siguiente/i);
    expect(nextBtn).toBeDisabled();
  });

  it('navega a la página anterior', async () => {
    const user = userEvent.setup();
    render(<PaginacionCursos currentPage={3} totalPages={5} />);

    const prevBtn = screen.getByLabelText(/página anterior/i);
    await user.click(prevBtn);

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('page=2'));
  });

  it('navega a la página siguiente', async () => {
    const user = userEvent.setup();
    render(<PaginacionCursos currentPage={2} totalPages={5} />);

    const nextBtn = screen.getByLabelText(/página siguiente/i);
    await user.click(nextBtn);

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('page=3'));
  });

  it('navega a una página específica al hacer click', async () => {
    const user = userEvent.setup();
    render(<PaginacionCursos currentPage={1} totalPages={10} />);

    // Con delta=2, desde página 1 se muestran: 1, 2, 3, ..., 10
    const page2Btn = screen.getByLabelText('Página 2');
    await user.click(page2Btn);

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('page=2'));
  });

  it('muestra ellipsis cuando hay muchas páginas', () => {
    render(<PaginacionCursos currentPage={5} totalPages={20} />);

    const ellipsis = screen.getAllByText('...');
    expect(ellipsis.length).toBeGreaterThan(0);
  });

  it('siempre muestra la primera página', () => {
    render(<PaginacionCursos currentPage={10} totalPages={20} />);

    expect(screen.getByLabelText('Página 1')).toBeInTheDocument();
  });

  it('siempre muestra la última página', () => {
    render(<PaginacionCursos currentPage={10} totalPages={20} />);

    expect(screen.getByLabelText('Página 20')).toBeInTheDocument();
  });

  it('muestra páginas cercanas a la actual (delta = 2)', () => {
    render(<PaginacionCursos currentPage={10} totalPages={20} />);

    // Debería mostrar 8, 9, 10, 11, 12 (delta de 2)
    expect(screen.getByLabelText('Página 8')).toBeInTheDocument();
    expect(screen.getByLabelText('Página 9')).toBeInTheDocument();
    expect(screen.getByLabelText('Página 10')).toBeInTheDocument();
    expect(screen.getByLabelText('Página 11')).toBeInTheDocument();
    expect(screen.getByLabelText('Página 12')).toBeInTheDocument();
  });

  it('mantiene filtros existentes al cambiar de página', async () => {
    mockSearchParams.set('buscar', 'JavaScript');
    mockSearchParams.set('categoriaId', 'cat1');
    const user = userEvent.setup();
    render(<PaginacionCursos currentPage={1} totalPages={5} />);

    const nextBtn = screen.getByLabelText(/página siguiente/i);
    await user.click(nextBtn);

    const lastCall = mockPush.mock.calls[0][0];
    expect(lastCall).toContain('buscar=JavaScript');
    expect(lastCall).toContain('categoriaId=cat1');
  });

  it('no muestra ellipsis inicial si está cerca del inicio', () => {
    const { container } = render(
      <PaginacionCursos currentPage={2} totalPages={10} />
    );

    const text = container.textContent || '';
    // No debería haber ellipsis al inicio si estamos en página 2
    const ellipsisCount = (text.match(/\.\.\./g) || []).length;
    expect(ellipsisCount).toBe(1); // Solo al final
  });

  it('no muestra ellipsis final si está cerca del final', () => {
    const { container } = render(
      <PaginacionCursos currentPage={9} totalPages={10} />
    );

    const text = container.textContent || '';
    // No debería haber ellipsis al final si estamos en página 9 de 10
    const ellipsisCount = (text.match(/\.\.\./g) || []).length;
    expect(ellipsisCount).toBe(1); // Solo al inicio
  });

  it('marca aria-current en la página actual', () => {
    render(<PaginacionCursos currentPage={5} totalPages={10} />);

    const currentPageBtn = screen.getByLabelText('Página 5');
    expect(currentPageBtn).toHaveAttribute('aria-current', 'page');
  });

  it('no marca aria-current en otras páginas', () => {
    render(<PaginacionCursos currentPage={5} totalPages={10} />);

    const page1Btn = screen.getByLabelText('Página 1');
    expect(page1Btn).not.toHaveAttribute('aria-current');
  });
});
