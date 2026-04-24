import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ForoDetalle } from './ForoDetalle';

describe('ForoDetalle - interacciones', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('debería permitir marcar solución y útil, reflejando el estado actualizado sin recarga manual', async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          post: {
            id: 'post-1',
            tipo: 'PREGUNTA',
            titulo: '¿Qué tema entra?',
            contenido: 'Quisiera confirmar el alcance de la evaluación.',
            etiquetas: ['examen'],
            estado: 'PUBLICADO',
            eliminado: false,
            creadoEn: '2026-04-24T12:00:00.000Z',
            actualizadoEn: '2026-04-24T12:00:00.000Z',
            autor: {
              id: 'user-1',
              nombre: 'Ana',
              apellido: 'Pérez',
            },
            responseCount: 1,
            respuestas: [
              {
                id: 'respuesta-1',
                contenido: 'Entra hasta el capítulo 3.',
                eliminado: false,
                esSolucion: false,
                esUtil: 0,
                marcoUtil: false,
                respuestaParentId: null,
                creadoEn: '2026-04-24T12:10:00.000Z',
                actualizadoEn: '2026-04-24T12:10:00.000Z',
                autor: {
                  id: 'user-3',
                  nombre: 'Marta',
                  apellido: 'Sosa',
                },
              },
            ],
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          respuesta: {
            id: 'respuesta-1',
            esSolucion: true,
            esUtil: 0,
            marcoUtil: false,
          },
          message: 'Respuesta marcada como solución',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          post: {
            id: 'post-1',
            tipo: 'PREGUNTA',
            titulo: '¿Qué tema entra?',
            contenido: 'Quisiera confirmar el alcance de la evaluación.',
            etiquetas: ['examen'],
            estado: 'PUBLICADO',
            eliminado: false,
            creadoEn: '2026-04-24T12:00:00.000Z',
            actualizadoEn: '2026-04-24T12:20:00.000Z',
            autor: {
              id: 'user-1',
              nombre: 'Ana',
              apellido: 'Pérez',
            },
            responseCount: 1,
            respuestas: [
              {
                id: 'respuesta-1',
                contenido: 'Entra hasta el capítulo 3.',
                eliminado: false,
                esSolucion: true,
                esUtil: 0,
                marcoUtil: false,
                respuestaParentId: null,
                creadoEn: '2026-04-24T12:10:00.000Z',
                actualizadoEn: '2026-04-24T12:10:00.000Z',
                autor: {
                  id: 'user-3',
                  nombre: 'Marta',
                  apellido: 'Sosa',
                },
              },
            ],
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          respuesta: {
            id: 'respuesta-1',
            esSolucion: true,
            esUtil: 1,
            marcoUtil: true,
          },
          message: 'Respuesta marcada como útil',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          post: {
            id: 'post-1',
            tipo: 'PREGUNTA',
            titulo: '¿Qué tema entra?',
            contenido: 'Quisiera confirmar el alcance de la evaluación.',
            etiquetas: ['examen'],
            estado: 'PUBLICADO',
            eliminado: false,
            creadoEn: '2026-04-24T12:00:00.000Z',
            actualizadoEn: '2026-04-24T12:25:00.000Z',
            autor: {
              id: 'user-1',
              nombre: 'Ana',
              apellido: 'Pérez',
            },
            responseCount: 1,
            respuestas: [
              {
                id: 'respuesta-1',
                contenido: 'Entra hasta el capítulo 3.',
                eliminado: false,
                esSolucion: true,
                esUtil: 1,
                marcoUtil: true,
                respuestaParentId: null,
                creadoEn: '2026-04-24T12:10:00.000Z',
                actualizadoEn: '2026-04-24T12:10:00.000Z',
                autor: {
                  id: 'user-3',
                  nombre: 'Marta',
                  apellido: 'Sosa',
                },
              },
            ],
          },
        }),
      });

    render(
      <ForoDetalle
        cursoId="curso-1"
        postId="post-1"
        currentUserId="user-1"
        currentUserRol="ESTUDIANTE"
        courseEducadorId="educador-1"
      />
    );

    expect(
      await screen.findByRole('button', { name: /marcar como solución/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /marcar como útil/i })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /marcar como solución/i })
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/foros/respuestas/respuesta-1/solucion',
        expect.objectContaining({ method: 'POST' })
      );
    });

    expect(
      await screen.findByText(/respuesta marcada como solución/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/resuelto/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /marcar como útil/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/foros/respuestas/respuesta-1/util',
        expect.objectContaining({ method: 'POST' })
      );
    });

    expect(await screen.findByText(/1 útil/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /te resultó útil/i })
    ).toBeDisabled();
  });

  it('debería ocultar la acción de solución cuando el usuario no tiene permiso', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        post: {
          id: 'post-1',
          tipo: 'PREGUNTA',
          titulo: '¿Qué tema entra?',
          contenido: 'Quisiera confirmar el alcance de la evaluación.',
          etiquetas: ['examen'],
          estado: 'PUBLICADO',
          eliminado: false,
          creadoEn: '2026-04-24T12:00:00.000Z',
          actualizadoEn: '2026-04-24T12:00:00.000Z',
          autor: {
            id: 'user-2',
            nombre: 'Luis',
            apellido: 'Gómez',
          },
          responseCount: 1,
          respuestas: [
            {
              id: 'respuesta-1',
              contenido: 'Entra hasta el capítulo 3.',
              eliminado: false,
              esSolucion: false,
              esUtil: 2,
              marcoUtil: false,
              respuestaParentId: null,
              creadoEn: '2026-04-24T12:10:00.000Z',
              actualizadoEn: '2026-04-24T12:10:00.000Z',
              autor: {
                id: 'user-3',
                nombre: 'Marta',
                apellido: 'Sosa',
              },
            },
          ],
        },
      }),
    });

    render(
      <ForoDetalle
        cursoId="curso-1"
        postId="post-1"
        currentUserId="user-4"
        currentUserRol="ESTUDIANTE"
        courseEducadorId="educador-1"
      />
    );

    expect(
      await screen.findByRole('heading', { name: /¿qué tema entra\?/i })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole('button', { name: /marcar como solución/i })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /marcar como útil/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/2 útiles/i)).toBeInTheDocument();
  });
});
