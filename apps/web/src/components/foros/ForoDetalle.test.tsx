import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ForoDetalle } from './ForoDetalle';

describe('ForoDetalle', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('debería responder a una respuesta existente usando respuestaParentId', async () => {
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
          message: 'Post obtenido exitosamente',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          respuesta: {
            id: 'respuesta-2',
            contenido: 'Gracias, me sirve para estudiar.',
            eliminado: false,
            esSolucion: false,
            respuestaParentId: 'respuesta-1',
            creadoEn: '2026-04-24T12:15:00.000Z',
            actualizadoEn: '2026-04-24T12:15:00.000Z',
            autor: {
              id: 'user-1',
              nombre: 'Ana',
              apellido: 'Pérez',
            },
          },
          message: 'Respuesta creada exitosamente',
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
            actualizadoEn: '2026-04-24T12:16:00.000Z',
            autor: {
              id: 'user-2',
              nombre: 'Luis',
              apellido: 'Gómez',
            },
            responseCount: 2,
            respuestas: [
              {
                id: 'respuesta-1',
                contenido: 'Entra hasta el capítulo 3.',
                eliminado: false,
                esSolucion: false,
                respuestaParentId: null,
                creadoEn: '2026-04-24T12:10:00.000Z',
                actualizadoEn: '2026-04-24T12:10:00.000Z',
                autor: {
                  id: 'user-3',
                  nombre: 'Marta',
                  apellido: 'Sosa',
                },
              },
              {
                id: 'respuesta-2',
                contenido: 'Gracias, me sirve para estudiar.',
                eliminado: false,
                esSolucion: false,
                respuestaParentId: 'respuesta-1',
                creadoEn: '2026-04-24T12:15:00.000Z',
                actualizadoEn: '2026-04-24T12:15:00.000Z',
                autor: {
                  id: 'user-1',
                  nombre: 'Ana',
                  apellido: 'Pérez',
                },
              },
            ],
          },
          message: 'Post obtenido exitosamente',
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
      await screen.findByRole('heading', { name: /¿qué tema entra\?/i })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /responder a marta sosa/i })
    );
    await user.type(
      screen.getByLabelText(/tu respuesta/i),
      'Gracias, me sirve para estudiar.'
    );
    await user.click(screen.getByRole('button', { name: /enviar respuesta/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/cursos/curso-1/foros/post-1/respuestas',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contenido: 'Gracias, me sirve para estudiar.',
            respuestaParentId: 'respuesta-1',
          }),
        })
      );
    });

    expect(
      await screen.findByText(/respuesta publicada exitosamente/i)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/gracias, me sirve para estudiar\./i)
    ).toBeInTheDocument();
  });

  it('debería permitir cerrar el thread a un moderador del curso', async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          post: {
            id: 'post-9',
            tipo: 'ANUNCIO',
            titulo: 'Recordatorio de entrega',
            contenido: 'La actividad vence el viernes.',
            etiquetas: ['recordatorio'],
            estado: 'PUBLICADO',
            eliminado: false,
            creadoEn: '2026-04-24T12:00:00.000Z',
            actualizadoEn: '2026-04-24T12:00:00.000Z',
            autor: {
              id: 'educador-1',
              nombre: 'Laura',
              apellido: 'Ruiz',
            },
            responseCount: 0,
            respuestas: [],
          },
          message: 'Post obtenido exitosamente',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          post: {
            id: 'post-9',
            tipo: 'ANUNCIO',
            titulo: 'Recordatorio de entrega',
            contenido: 'La actividad vence el viernes.',
            etiquetas: ['recordatorio'],
            estado: 'CERRADO',
            eliminado: false,
            creadoEn: '2026-04-24T12:00:00.000Z',
            actualizadoEn: '2026-04-24T12:20:00.000Z',
            autor: {
              id: 'educador-1',
              nombre: 'Laura',
              apellido: 'Ruiz',
            },
            responseCount: 0,
          },
          message: 'Thread cerrado exitosamente',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          post: {
            id: 'post-9',
            tipo: 'ANUNCIO',
            titulo: 'Recordatorio de entrega',
            contenido: 'La actividad vence el viernes.',
            etiquetas: ['recordatorio'],
            estado: 'CERRADO',
            eliminado: false,
            creadoEn: '2026-04-24T12:00:00.000Z',
            actualizadoEn: '2026-04-24T12:20:00.000Z',
            autor: {
              id: 'educador-1',
              nombre: 'Laura',
              apellido: 'Ruiz',
            },
            responseCount: 0,
            respuestas: [],
          },
          message: 'Post obtenido exitosamente',
        }),
      });

    render(
      <ForoDetalle
        cursoId="curso-1"
        postId="post-9"
        currentUserId="educador-1"
        currentUserRol="EDUCADOR"
        courseEducadorId="educador-1"
      />
    );

    expect(
      await screen.findByRole('button', { name: /cerrar thread/i })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cerrar thread/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/cursos/curso-1/foros/post-9/cerrar',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    expect(await screen.findByText(/thread cerrado/i)).toBeInTheDocument();
  });
});
