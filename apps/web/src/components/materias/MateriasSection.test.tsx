import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MateriasSection } from './MateriasSection';

function institutionResponse() {
  return {
    ok: true,
    json: async () => ({ institucionId: 'inst-1' }),
  };
}

describe('MateriasSection', () => {
  afterEach(() => jest.resetAllMocks());

  it('muestra el estado de carga mientras obtiene la institución y el catálogo', async () => {
    let resolveInstitution;
    const institutionPromise = new Promise((resolve) => {
      resolveInstitution = resolve;
    });
    global.fetch = jest.fn((input) => {
      if (input === '/api/mi-institucion') return institutionPromise;
      return Promise.resolve({
        ok: true,
        json: async () => ({ materias: [] }),
      });
    });

    render(React.createElement(MateriasSection));
    expect(screen.getByRole('status')).toHaveTextContent('Cargando materias');

    resolveInstitution(institutionResponse());
    await waitFor(() =>
      expect(
        screen.getByText('Todavía no hay materias activas.')
      ).toBeInTheDocument()
    );
  });

  it('crea, edita y desactiva una materia', async () => {
    const user = userEvent.setup();
    let materias = [
      {
        id: 'materia-1',
        nombre: 'Matemática',
        descripcion: null,
        activo: true,
      },
    ];
    global.fetch = jest.fn(async (input, init) => {
      if (input === '/api/mi-institucion') return institutionResponse();
      if (input === '/api/instituciones/inst-1/materias') {
        if (init?.method === 'POST') {
          materias = [
            ...materias,
            {
              id: 'materia-2',
              nombre: 'Historia',
              descripcion: null,
              activo: true,
            },
          ];
          return { ok: true, json: async () => ({ materia: materias[1] }) };
        }
        if (init?.method === 'GET' || !init) {
          return { ok: true, json: async () => ({ materias }) };
        }
      }
      if (input === '/api/materias/materia-1' && init?.method === 'PATCH') {
        materias[0] = { ...materias[0], nombre: 'Lengua' };
        return { ok: true, json: async () => ({ materia: materias[0] }) };
      }
      if (input === '/api/materias/materia-1' && init?.method === 'DELETE') {
        materias = [];
        return {
          ok: true,
          json: async () => ({ materia: { ...materias[0], activo: false } }),
        };
      }
      throw new Error(`Unexpected fetch ${input}`);
    });

    render(React.createElement(MateriasSection));
    expect(await screen.findByText('Matemática')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Nombre de materia'), 'Historia');
    await user.click(screen.getByRole('button', { name: 'Crear materia' }));
    expect(await screen.findByText('Historia')).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: 'Editar' })[0]);
    expect(screen.getByDisplayValue('Matemática')).toBeInTheDocument();
    await user.clear(screen.getByLabelText('Nombre de materia'));
    await user.type(screen.getByLabelText('Nombre de materia'), 'Lengua');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect(await screen.findByText('Lengua')).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: 'Desactivar' })[0]);
    await waitFor(() =>
      expect(
        screen.getByText('Todavía no hay materias activas.')
      ).toBeInTheDocument()
    );
  });

  it('muestra errores observables del catálogo y de las operaciones', async () => {
    const user = userEvent.setup();
    global.fetch = jest.fn(async (input, init) => {
      if (input === '/api/mi-institucion') return institutionResponse();
      if (input === '/api/instituciones/inst-1/materias' && !init) {
        return { ok: true, json: async () => ({ materias: [] }) };
      }
      return {
        ok: false,
        json: async () => ({ message: 'No se pudo guardar' }),
      };
    });

    render(React.createElement(MateriasSection));
    await screen.findByText('Todavía no hay materias activas.');
    await user.type(screen.getByLabelText('Nombre de materia'), 'Biología');
    await user.click(screen.getByRole('button', { name: 'Crear materia' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo guardar'
    );
  });
});
