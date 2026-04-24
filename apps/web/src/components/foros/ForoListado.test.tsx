import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ForoListado } from './ForoListado';

describe('ForoListado', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('debería cargar posts y crear una nueva publicación con etiquetas normalizadas', async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          posts: [
            {
              id: 'post-1',
              tipo: 'PREGUNTA',
              titulo: '¿Cómo entregar la actividad 1?',
              contenido: 'No encuentro el botón de entrega.',
              etiquetas: ['entrega'],
              estado: 'PUBLICADO',
              eliminado: false,
              creadoEn: '2026-04-24T12:00:00.000Z',
              actualizadoEn: '2026-04-24T12:00:00.000Z',
              autor: {
                id: 'user-1',
                nombre: 'Ana',
                apellido: 'Pérez',
              },
              responseCount: 0,
            },
          ],
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          post: {
            id: 'post-2',
            tipo: 'DISCUSION',
            titulo: 'Compartamos resúmenes',
            contenido: 'Dejo un espacio para compartir apuntes.',
            etiquetas: ['resumenes', 'colaboracion'],
            estado: 'PUBLICADO',
            eliminado: false,
            creadoEn: '2026-04-24T13:00:00.000Z',
            actualizadoEn: '2026-04-24T13:00:00.000Z',
            autor: {
              id: 'user-1',
              nombre: 'Ana',
              apellido: 'Pérez',
            },
            responseCount: 0,
          },
          message: 'Post creado exitosamente',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          posts: [
            {
              id: 'post-2',
              tipo: 'DISCUSION',
              titulo: 'Compartamos resúmenes',
              contenido: 'Dejo un espacio para compartir apuntes.',
              etiquetas: ['resumenes', 'colaboracion'],
              estado: 'PUBLICADO',
              eliminado: false,
              creadoEn: '2026-04-24T13:00:00.000Z',
              actualizadoEn: '2026-04-24T13:00:00.000Z',
              autor: {
                id: 'user-1',
                nombre: 'Ana',
                apellido: 'Pérez',
              },
              responseCount: 0,
            },
            {
              id: 'post-1',
              tipo: 'PREGUNTA',
              titulo: '¿Cómo entregar la actividad 1?',
              contenido: 'No encuentro el botón de entrega.',
              etiquetas: ['entrega'],
              estado: 'PUBLICADO',
              eliminado: false,
              creadoEn: '2026-04-24T12:00:00.000Z',
              actualizadoEn: '2026-04-24T12:00:00.000Z',
              autor: {
                id: 'user-1',
                nombre: 'Ana',
                apellido: 'Pérez',
              },
              responseCount: 0,
            },
          ],
          total: 2,
          page: 1,
          limit: 20,
          totalPages: 1,
        }),
      });

    render(
      <ForoListado
        cursoId="curso-1"
        cursoSlug="matematica-1"
        currentUserId="user-1"
        currentUserRol="ESTUDIANTE"
      />
    );

    expect(
      await screen.findByRole('heading', {
        name: /¿cómo entregar la actividad 1\?/i,
      })
    ).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/tipo de publicación/i), [
      'DISCUSION',
    ]);
    await user.type(
      screen.getByLabelText(/título del post/i),
      'Compartamos resúmenes'
    );
    await user.type(
      screen.getByLabelText(/contenido del post/i),
      'Dejo un espacio para compartir apuntes.'
    );
    await user.type(
      screen.getByLabelText(/etiquetas/i),
      ' resumenes, colaboracion, resumenes '
    );
    await user.click(
      screen.getByRole('button', { name: /publicar en el foro/i })
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/cursos/curso-1/foros',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipo: 'DISCUSION',
            titulo: 'Compartamos resúmenes',
            contenido: 'Dejo un espacio para compartir apuntes.',
            etiquetas: ['resumenes', 'colaboracion'],
          }),
        })
      );
    });

    expect(
      await screen.findByText(/publicación creada exitosamente/i)
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: /compartamos resúmenes/i })
    ).toBeInTheDocument();
  });
});
