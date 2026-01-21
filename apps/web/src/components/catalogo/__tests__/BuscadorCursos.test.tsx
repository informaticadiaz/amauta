/**
 * Tests para BuscadorCursos
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BuscadorCursos } from '../BuscadorCursos';

const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

describe('BuscadorCursos', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockSearchParams.delete('buscar');
    mockSearchParams.delete('page');
  });

  it('renderiza el input de búsqueda', () => {
    render(<BuscadorCursos />);

    const input = screen.getByPlaceholderText(
      /buscar cursos por título o descripción/i
    );
    expect(input).toBeInTheDocument();
  });

  it('muestra el ícono de búsqueda', () => {
    render(<BuscadorCursos />);

    const searchIcon = screen
      .getByRole('textbox')
      .parentElement?.querySelector('svg');
    expect(searchIcon).toBeInTheDocument();
  });

  it('actualiza el valor del input al escribir', async () => {
    const user = userEvent.setup();
    render(<BuscadorCursos />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    await user.type(input, 'JavaScript');

    expect(input.value).toBe('JavaScript');
  });

  it('aplica debounce antes de actualizar la URL', async () => {
    const user = userEvent.setup();
    render(<BuscadorCursos />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'React');

    // No debe llamar inmediatamente
    expect(mockPush).not.toHaveBeenCalled();

    // Esperar el debounce (500ms)
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalled();
      },
      { timeout: 1000 }
    );
  });

  it('incluye el término de búsqueda en los query params', async () => {
    const user = userEvent.setup();
    render(<BuscadorCursos />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'TypeScript');

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('buscar=TypeScript')
      );
    });
  });

  it('resetea a página 1 al buscar', async () => {
    mockSearchParams.set('page', '3');
    const user = userEvent.setup();
    render(<BuscadorCursos />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'Node');

    await waitFor(() => {
      const lastCall = mockPush.mock.calls[mockPush.mock.calls.length - 1][0];
      expect(lastCall).not.toContain('page=');
    });
  });

  it('muestra botón de limpiar cuando hay texto', async () => {
    const user = userEvent.setup();
    render(<BuscadorCursos />);

    const input = screen.getByRole('textbox');

    // Inicialmente no debe haber botón
    expect(
      screen.queryByLabelText(/limpiar búsqueda/i)
    ).not.toBeInTheDocument();

    // Escribir texto
    await user.type(input, 'Python');

    // Ahora debe aparecer el botón
    expect(screen.getByLabelText(/limpiar búsqueda/i)).toBeInTheDocument();
  });

  it('limpia el input al hacer click en el botón de limpiar', async () => {
    const user = userEvent.setup();
    render(<BuscadorCursos />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    await user.type(input, 'Java');

    const clearButton = screen.getByLabelText(/limpiar búsqueda/i);
    await user.click(clearButton);

    expect(input.value).toBe('');
  });

  it('muestra el término de búsqueda activo desde searchParams', () => {
    mockSearchParams.set('buscar', 'Angular');
    render(<BuscadorCursos />);

    expect(screen.getByText(/buscando:/i)).toBeInTheDocument();
    expect(screen.getByText('Angular')).toBeInTheDocument();
  });

  it('no muestra indicador de búsqueda si no hay término activo', () => {
    render(<BuscadorCursos />);

    expect(screen.queryByText(/buscando:/i)).not.toBeInTheDocument();
  });

  it('elimina el parámetro de búsqueda si el input está vacío', async () => {
    const user = userEvent.setup();
    mockSearchParams.set('buscar', 'Vue');
    render(<BuscadorCursos />);

    const input = screen.getByRole('textbox') as HTMLInputElement;

    // Limpiar el input
    await user.clear(input);

    await waitFor(() => {
      const lastCall = mockPush.mock.calls[mockPush.mock.calls.length - 1][0];
      expect(lastCall).not.toContain('buscar=');
    });
  });
});
