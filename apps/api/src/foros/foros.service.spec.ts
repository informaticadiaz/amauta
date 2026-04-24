jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
}));

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { ForosService } from './foros.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

describe('ForosService', () => {
  let service: ForosService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let notificacionesService: any;

  const createMockPrisma = () => ({
    usuario: { findUnique: jest.fn() },
    curso: { findUnique: jest.fn() },
    inscripcion: { findUnique: jest.fn() },
    foroPost: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    foroRespuesta: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    reaccionForo: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  });

  const CURSO_ID = 'ckr0000000000000000001001';
  const POST_ID = 'ckr0000000000000000001002';
  const RESPUESTA_ID = 'ckr0000000000000000001003';
  const ESTUDIANTE_ID = 'ckr0000000000000000001004';
  const EDUCADOR_ID = 'ckr0000000000000000001005';
  const ADMIN_ID = 'ckr0000000000000000001006';
  const OTRO_ESTUDIANTE_ID = 'ckr0000000000000000001007';

  const curso = {
    id: CURSO_ID,
    educadorId: EDUCADOR_ID,
    educador: {
      perfil: {
        institucion: 'Escuela Belgrano',
      },
    },
  };

  const estudiante = {
    id: ESTUDIANTE_ID,
    rol: 'ESTUDIANTE',
    perfil: {
      institucion: 'Escuela Belgrano',
    },
  };

  const otroEstudiante = {
    id: OTRO_ESTUDIANTE_ID,
    rol: 'ESTUDIANTE',
    perfil: {
      institucion: 'Escuela Belgrano',
    },
  };

  const admin = {
    id: ADMIN_ID,
    rol: 'ADMIN_ESCUELA',
    perfil: {
      institucion: 'Escuela Belgrano',
    },
  };

  beforeEach(async () => {
    prisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForosService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: NotificacionesService,
          useValue: {
            crearNotificacionNuevaRespuesta: jest.fn(),
            crearNotificacionSolucionMarcada: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ForosService>(ForosService);
    notificacionesService = module.get(NotificacionesService);
    jest.resetAllMocks();
    prisma.$transaction.mockImplementation(async (input: unknown) => {
      if (typeof input === 'function') {
        return input(prisma);
      }

      return Promise.all(input as unknown[]);
    });
  });

  describe('listarPosts', () => {
    it('debería devolver posts paginados aplicando filtros de tipo, etiqueta y sin responder', async () => {
      prisma.usuario.findUnique.mockResolvedValue(estudiante);
      prisma.curso.findUnique.mockResolvedValue(curso);
      prisma.inscripcion.findUnique.mockResolvedValue({ estado: 'ACTIVO' });
      prisma.foroPost.findMany.mockResolvedValue([
        {
          id: POST_ID,
          tipo: 'PREGUNTA',
          titulo: '¿Cómo resolver ecuaciones?',
          contenido: 'Necesito ayuda',
          etiquetas: ['algebra'],
          estado: 'PUBLICADO',
          eliminado: false,
          creadoEn: new Date('2026-04-24T10:00:00.000Z'),
          actualizadoEn: new Date('2026-04-24T10:00:00.000Z'),
          autor: {
            id: ESTUDIANTE_ID,
            nombre: 'Ana',
            apellido: 'Alvarez',
          },
          respuestas: [],
        },
      ]);
      prisma.foroPost.count.mockResolvedValue(1);

      const result = await service.listarPosts(
        CURSO_ID,
        {
          page: 1,
          limit: 20,
          tipo: 'PREGUNTA',
          etiqueta: 'algebra',
          sinResponder: true,
        },
        ESTUDIANTE_ID
      );

      expect(result.total).toBe(1);
      expect(result.posts[0]).toEqual(
        expect.objectContaining({
          id: POST_ID,
          responseCount: 0,
          etiquetas: ['algebra'],
        })
      );
      expect(prisma.foroPost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            cursoId: CURSO_ID,
            tipo: 'PREGUNTA',
            etiquetas: { has: 'algebra' },
            respuestas: { none: { eliminado: false } },
          }),
          skip: 0,
          take: 20,
        })
      );
    });
  });

  describe('crearPost', () => {
    it('debería crear una pregunta para un estudiante con inscripción activa', async () => {
      prisma.usuario.findUnique.mockResolvedValue(estudiante);
      prisma.curso.findUnique.mockResolvedValue(curso);
      prisma.inscripcion.findUnique.mockResolvedValue({ estado: 'ACTIVO' });
      prisma.foroPost.create.mockResolvedValue({
        id: POST_ID,
        tipo: 'PREGUNTA',
        titulo: 'Consulta',
        contenido: 'Tengo una duda sobre fracciones',
        etiquetas: ['fracciones'],
        estado: 'PUBLICADO',
        eliminado: false,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
        autor: {
          id: ESTUDIANTE_ID,
          nombre: 'Ana',
          apellido: 'Alvarez',
        },
        respuestas: [],
      });

      const result = await service.crearPost(
        CURSO_ID,
        {
          tipo: 'PREGUNTA',
          titulo: 'Consulta',
          contenido: 'Tengo una duda sobre fracciones',
          etiquetas: ['fracciones'],
        },
        ESTUDIANTE_ID
      );

      expect(result.tipo).toBe('PREGUNTA');
      expect(prisma.foroPost.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            cursoId: CURSO_ID,
            autorId: ESTUDIANTE_ID,
            tipo: 'PREGUNTA',
          }),
        })
      );
    });

    it('debería rechazar anuncios creados por estudiantes', async () => {
      prisma.usuario.findUnique.mockResolvedValue(estudiante);
      prisma.curso.findUnique.mockResolvedValue(curso);
      prisma.inscripcion.findUnique.mockResolvedValue({ estado: 'ACTIVO' });

      await expect(
        service.crearPost(
          CURSO_ID,
          {
            tipo: 'ANUNCIO',
            titulo: 'Aviso',
            contenido: 'Clase reprogramada',
          },
          ESTUDIANTE_ID
        )
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('obtenerDetallePost', () => {
    it('debería devolver placeholder cuando el post fue eliminado', async () => {
      prisma.usuario.findUnique.mockResolvedValue(estudiante);
      prisma.curso.findUnique.mockResolvedValue(curso);
      prisma.inscripcion.findUnique.mockResolvedValue({ estado: 'ACTIVO' });
      prisma.foroPost.findFirst.mockResolvedValue({
        id: POST_ID,
        cursoId: CURSO_ID,
        tipo: 'PREGUNTA',
        titulo: 'Post eliminado',
        contenido: 'Contenido original',
        etiquetas: [],
        estado: 'ELIMINADO',
        eliminado: true,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
        autor: {
          id: ESTUDIANTE_ID,
          nombre: 'Ana',
          apellido: 'Alvarez',
        },
        respuestas: [],
      });

      const result = await service.obtenerDetallePost(
        CURSO_ID,
        POST_ID,
        ESTUDIANTE_ID
      );

      expect(result.contenido).toBe('[contenido eliminado]');
      expect(result.estado).toBe('ELIMINADO');
    });
  });

  describe('responderPost', () => {
    it('debería crear la respuesta y notificar al autor del post', async () => {
      prisma.usuario.findUnique.mockResolvedValue(estudiante);
      prisma.curso.findUnique.mockResolvedValue(curso);
      prisma.inscripcion.findUnique.mockResolvedValue({ estado: 'ACTIVO' });
      prisma.foroPost.findFirst.mockResolvedValue({
        id: POST_ID,
        cursoId: CURSO_ID,
        autorId: OTRO_ESTUDIANTE_ID,
        estado: 'PUBLICADO',
        eliminado: false,
      });
      prisma.foroRespuesta.create.mockResolvedValue({
        id: RESPUESTA_ID,
        contenido: 'Podés simplificar antes de sumar',
        esSolucion: false,
        eliminado: false,
        respuestaParentId: null,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
        autor: {
          id: ESTUDIANTE_ID,
          nombre: 'Ana',
          apellido: 'Alvarez',
        },
      });
      const result = await service.responderPost(
        CURSO_ID,
        POST_ID,
        { contenido: 'Podés simplificar antes de sumar' },
        ESTUDIANTE_ID
      );

      expect(result.id).toBe(RESPUESTA_ID);
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(
        notificacionesService.crearNotificacionNuevaRespuesta
      ).toHaveBeenCalledWith(
        {
          actorId: ESTUDIANTE_ID,
          destinatarioId: OTRO_ESTUDIANTE_ID,
          postId: POST_ID,
          respuestaId: RESPUESTA_ID,
        },
        expect.any(Object)
      );
    });
  });

  describe('eliminarPost', () => {
    it('debería rechazar la eliminación cuando el usuario no es autor ni moderador', async () => {
      prisma.foroPost.findFirst.mockResolvedValue({
        id: POST_ID,
        autorId: ESTUDIANTE_ID,
        curso: curso,
      });
      prisma.usuario.findUnique.mockResolvedValue(otroEstudiante);

      await expect(
        service.eliminarPost(CURSO_ID, POST_ID, OTRO_ESTUDIANTE_ID)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('cerrarPost', () => {
    it('debería permitir al educador cerrar el thread', async () => {
      prisma.foroPost.findFirst.mockResolvedValue({
        id: POST_ID,
        cursoId: CURSO_ID,
        autorId: ESTUDIANTE_ID,
        tipo: 'PREGUNTA',
        titulo: 'Consulta',
        contenido: 'Necesito ayuda',
        etiquetas: [],
        estado: 'PUBLICADO',
        eliminado: false,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
        autor: {
          id: ESTUDIANTE_ID,
          nombre: 'Ana',
          apellido: 'Alvarez',
        },
        respuestas: [],
        curso,
      });
      prisma.usuario.findUnique.mockResolvedValue({
        id: EDUCADOR_ID,
        rol: 'EDUCADOR',
        perfil: {
          institucion: 'Escuela Belgrano',
        },
      });
      prisma.foroPost.update.mockResolvedValue({
        id: POST_ID,
        cursoId: CURSO_ID,
        tipo: 'PREGUNTA',
        titulo: 'Consulta',
        contenido: 'Necesito ayuda',
        etiquetas: [],
        estado: 'CERRADO',
        eliminado: false,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
        autor: {
          id: ESTUDIANTE_ID,
          nombre: 'Ana',
          apellido: 'Alvarez',
        },
        respuestas: [],
      });

      const result = await service.cerrarPost(CURSO_ID, POST_ID, EDUCADOR_ID);

      expect(result.estado).toBe('CERRADO');
      expect(prisma.foroPost.update).toHaveBeenCalledWith({
        where: { id: POST_ID },
        include: expect.any(Object),
        data: {
          estado: 'CERRADO',
        },
      });
    });

    it('debería rechazar respuestas sobre posts cerrados', async () => {
      prisma.usuario.findUnique.mockResolvedValue(estudiante);
      prisma.curso.findUnique.mockResolvedValue(curso);
      prisma.inscripcion.findUnique.mockResolvedValue({ estado: 'ACTIVO' });
      prisma.foroPost.findFirst.mockResolvedValue({
        id: POST_ID,
        cursoId: CURSO_ID,
        autorId: OTRO_ESTUDIANTE_ID,
        estado: 'CERRADO',
        eliminado: false,
      });

      await expect(
        service.responderPost(
          CURSO_ID,
          POST_ID,
          { contenido: 'Respuesta tardía' },
          ESTUDIANTE_ID
        )
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('eliminarRespuesta', () => {
    it('debería permitir a un admin de la misma institución eliminar una respuesta', async () => {
      prisma.foroRespuesta.findUnique.mockResolvedValue({
        id: RESPUESTA_ID,
        autorId: ESTUDIANTE_ID,
        post: {
          id: POST_ID,
          cursoId: CURSO_ID,
          curso,
        },
      });
      prisma.usuario.findUnique.mockResolvedValue(admin);
      prisma.foroRespuesta.update.mockResolvedValue({ id: RESPUESTA_ID });

      await service.eliminarRespuesta(
        CURSO_ID,
        POST_ID,
        RESPUESTA_ID,
        ADMIN_ID
      );

      expect(prisma.foroRespuesta.update).toHaveBeenCalledWith({
        where: { id: RESPUESTA_ID },
        data: {
          eliminado: true,
        },
      });
    });
  });

  describe('marcarRespuestaComoSolucion', () => {
    it('debería desplazar la solución anterior y marcar la nueva respuesta', async () => {
      prisma.foroRespuesta.findUnique
        .mockResolvedValueOnce({
          id: RESPUESTA_ID,
          autorId: OTRO_ESTUDIANTE_ID,
          eliminado: false,
          esSolucion: false,
          postId: POST_ID,
          post: {
            id: POST_ID,
            autorId: ESTUDIANTE_ID,
            cursoId: CURSO_ID,
            curso,
          },
        })
        .mockResolvedValueOnce({
          id: RESPUESTA_ID,
          contenido: 'Esta respuesta resuelve la duda',
          eliminado: false,
          esSolucion: true,
          respuestaParentId: null,
          creadoEn: new Date(),
          actualizadoEn: new Date(),
          autor: {
            id: OTRO_ESTUDIANTE_ID,
            nombre: 'Luis',
            apellido: 'Lopez',
          },
          _count: {
            reacciones: 2,
          },
          reacciones: [],
        });
      prisma.usuario.findUnique.mockResolvedValue(estudiante);
      prisma.foroRespuesta.findFirst = jest.fn().mockResolvedValue({
        id: 'ckr0000000000000000001099',
      });
      prisma.foroRespuesta.update.mockResolvedValue({ id: RESPUESTA_ID });

      const result = await service.marcarRespuestaComoSolucion(
        RESPUESTA_ID,
        ESTUDIANTE_ID
      );

      expect(prisma.foroRespuesta.update).toHaveBeenNthCalledWith(1, {
        where: { id: 'ckr0000000000000000001099' },
        data: { esSolucion: false },
      });
      expect(prisma.foroRespuesta.update).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          where: { id: RESPUESTA_ID },
          data: { esSolucion: true },
        })
      );
      expect(
        notificacionesService.crearNotificacionSolucionMarcada
      ).toHaveBeenCalledWith(
        {
          actorId: ESTUDIANTE_ID,
          destinatarioId: OTRO_ESTUDIANTE_ID,
          postId: POST_ID,
          respuestaId: RESPUESTA_ID,
        },
        expect.any(Object)
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: RESPUESTA_ID,
          esSolucion: true,
          esUtil: 2,
          marcoUtil: false,
        })
      );
    });

    it('debería ser idempotente si la respuesta ya está marcada como solución', async () => {
      prisma.foroRespuesta.findUnique
        .mockResolvedValueOnce({
          id: RESPUESTA_ID,
          autorId: OTRO_ESTUDIANTE_ID,
          eliminado: false,
          esSolucion: true,
          postId: POST_ID,
          post: {
            id: POST_ID,
            autorId: ESTUDIANTE_ID,
            cursoId: CURSO_ID,
            curso,
          },
        })
        .mockResolvedValueOnce({
          id: RESPUESTA_ID,
          contenido: 'Respuesta ya aceptada',
          eliminado: false,
          esSolucion: true,
          respuestaParentId: null,
          creadoEn: new Date(),
          actualizadoEn: new Date(),
          autor: {
            id: OTRO_ESTUDIANTE_ID,
            nombre: 'Luis',
            apellido: 'Lopez',
          },
          _count: {
            reacciones: 1,
          },
          reacciones: [],
        });
      prisma.usuario.findUnique.mockResolvedValue(estudiante);

      const result = await service.marcarRespuestaComoSolucion(
        RESPUESTA_ID,
        ESTUDIANTE_ID
      );

      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(prisma.foroRespuesta.update).not.toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          id: RESPUESTA_ID,
          esSolucion: true,
          esUtil: 1,
        })
      );
    });

    it('debería rechazar el marcado de solución para un usuario sin permisos', async () => {
      prisma.foroRespuesta.findUnique.mockResolvedValue({
        id: RESPUESTA_ID,
        autorId: OTRO_ESTUDIANTE_ID,
        eliminado: false,
        esSolucion: false,
        postId: POST_ID,
        post: {
          id: POST_ID,
          autorId: ESTUDIANTE_ID,
          cursoId: CURSO_ID,
          curso,
        },
      });
      prisma.usuario.findUnique.mockResolvedValue(otroEstudiante);

      await expect(
        service.marcarRespuestaComoSolucion(RESPUESTA_ID, OTRO_ESTUDIANTE_ID)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('marcarRespuestaComoUtil', () => {
    it('debería registrar la reacción útil una sola vez por usuario', async () => {
      prisma.usuario.findUnique.mockResolvedValue(estudiante);
      prisma.curso.findUnique.mockResolvedValue(curso);
      prisma.inscripcion.findUnique.mockResolvedValue({ estado: 'ACTIVO' });
      prisma.foroRespuesta.findUnique.mockResolvedValue({
        id: RESPUESTA_ID,
        autorId: OTRO_ESTUDIANTE_ID,
        contenido: 'Respuesta clara',
        eliminado: false,
        esSolucion: false,
        respuestaParentId: null,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
        postId: POST_ID,
        post: {
          id: POST_ID,
          cursoId: CURSO_ID,
        },
        autor: {
          id: OTRO_ESTUDIANTE_ID,
          nombre: 'Luis',
          apellido: 'Lopez',
        },
        _count: {
          reacciones: 3,
        },
        reacciones: [{ usuarioId: ESTUDIANTE_ID }],
      });
      prisma.reaccionForo = {
        create: jest.fn(),
      };
      prisma.reaccionForo.create.mockResolvedValue({ id: 'reaccion-1' });

      const result = await service.marcarRespuestaComoUtil(
        RESPUESTA_ID,
        ESTUDIANTE_ID
      );

      expect(prisma.reaccionForo.create).toHaveBeenCalledWith({
        data: {
          respuestaId: RESPUESTA_ID,
          usuarioId: ESTUDIANTE_ID,
        },
      });
      expect(result).toEqual(
        expect.objectContaining({
          id: RESPUESTA_ID,
          esUtil: 3,
          marcoUtil: true,
        })
      );
    });

    it('debería rechazar un segundo marcado útil sobre la misma respuesta', async () => {
      prisma.usuario.findUnique.mockResolvedValue(estudiante);
      prisma.curso.findUnique.mockResolvedValue(curso);
      prisma.inscripcion.findUnique.mockResolvedValue({ estado: 'ACTIVO' });
      prisma.foroRespuesta.findUnique.mockResolvedValue({
        id: RESPUESTA_ID,
        postId: POST_ID,
        eliminado: false,
        post: {
          id: POST_ID,
          cursoId: CURSO_ID,
        },
      });
      prisma.reaccionForo = {
        create: jest.fn(),
      };
      prisma.reaccionForo.create.mockRejectedValue({
        code: 'P2002',
      });

      await expect(
        service.marcarRespuestaComoUtil(RESPUESTA_ID, ESTUDIANTE_ID)
      ).rejects.toThrow(ConflictException);
    });
  });
});
