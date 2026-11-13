import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EstudiantesHistorialList } from './EstudiantesHistorialList';

describe('EstudiantesHistorialList', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        usuarios: [
          { id: 'est-1', nombre: 'Ana', apellido: 'Pérez', email: 'ana@test' },
        ],
      }),
    });
  });

  it('carga estudiantes, busca y enlaza al detalle', async () => {
    render(<EstudiantesHistorialList institucionId="inst-1" />);
    expect(screen.getByText(/cargando estudiantes/i)).toBeInTheDocument();
    expect(await screen.findByText('Pérez, Ana')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /pérez, ana/i })).toHaveAttribute(
      'href',
      '/dashboard/historial/estudiantes/est-1'
    );

    fireEvent.change(screen.getByLabelText(/buscar estudiante/i), {
      target: { value: 'Ana' },
    });
    await waitFor(() =>
      expect(global.fetch).toHaveBeenLastCalledWith(
        '/api/instituciones/inst-1/estudiantes?limit=100&buscar=Ana'
      )
    );
  });
});
