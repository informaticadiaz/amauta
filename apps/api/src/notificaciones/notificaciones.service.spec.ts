jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
}));

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { PrismaService } from '../prisma/prisma.service';

describe('NotificacionesService', () => {
  let service: NotificacionesService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;

  const createMockPrisma = () => ({
    usuario: {
      findUnique: jest.fn(),
    },
    notificacion: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  });

  const USUARIO_ID = 'ckr0000000000000000002001';
  const ACTOR_ID = 'ckr0000000000000000002002';
  const POST_ID = 'ckr0000000000000000002003';
  const RESPUESTA_ID = 'ckr0000000000000000002004';
  const NOTIFICACION_ID = 'ckr0000000000000000002005';

  beforeEach(async () => {
    prisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificacionesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<NotificacionesService>(NotificacionesService);
    jest.resetAllMocks();
  });

  describe('listar', () => {
    it('debería devolver notificaciones paginadas del usuario autenticado', async () => {
      prisma.notificacion.findMany.mockResolvedValue([
        {
          id: NOTIFICACION_ID,
          usuarioId: USUARIO_ID,
          tipo: 'NUEVA_RESPUESTA',
          leida: false,
          postId: POST_ID,
          respuestaId: RESPUESTA_ID,
          creadoEn: new Date('2026-04-24T10:00:00.000Z'),
        },
      ]);
      prisma.notificacion.count.mockResolvedValue(1);

      const result = await service.listar(USUARIO_ID, {
        page: 1,
        limit: 20,
      });

      expect(result.total).toBe(1);
      expect(result.notificaciones).toHaveLength(1);
      expect(prisma.notificacion.findMany).toHaveBeenCalledWith({
        where: {
          usuarioId: USUARIO_ID,
        },
        orderBy: {
          creadoEn: 'desc',
        },
        skip: 0,
        take: 20,
      });
    });
  });

  describe('marcarComoLeida', () => {
    it('debería marcar como leída una notificación del usuario y ser idempotente', async () => {
      prisma.notificacion.findFirst.mockResolvedValue({
        id: NOTIFICACION_ID,
        usuarioId: USUARIO_ID,
        tipo: 'NUEVA_RESPUESTA',
        leida: true,
        postId: POST_ID,
        respuestaId: RESPUESTA_ID,
        creadoEn: new Date('2026-04-24T10:00:00.000Z'),
      });

      const result = await service.marcarComoLeida(NOTIFICACION_ID, USUARIO_ID);

      expect(prisma.notificacion.update).not.toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          id: NOTIFICACION_ID,
          leida: true,
        })
      );
    });

    it('debería lanzar NotFoundException si la notificación no pertenece al usuario', async () => {
      prisma.notificacion.findFirst.mockResolvedValue(null);

      await expect(
        service.marcarComoLeida(NOTIFICACION_ID, USUARIO_ID)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('crearNotificacionNuevaRespuesta', () => {
    it('debería omitir la creación si ya existe una notificación no leída del mismo post', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        id: USUARIO_ID,
        activo: true,
      });
      prisma.notificacion.findFirst.mockResolvedValue({
        id: NOTIFICACION_ID,
      });

      await service.crearNotificacionNuevaRespuesta({
        actorId: ACTOR_ID,
        destinatarioId: USUARIO_ID,
        postId: POST_ID,
        respuestaId: RESPUESTA_ID,
      });

      expect(prisma.notificacion.create).not.toHaveBeenCalled();
    });

    it('debería omitir la creación si el destinatario está desactivado o es el mismo actor', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        id: USUARIO_ID,
        activo: false,
      });

      await service.crearNotificacionNuevaRespuesta({
        actorId: ACTOR_ID,
        destinatarioId: USUARIO_ID,
        postId: POST_ID,
        respuestaId: RESPUESTA_ID,
      });

      await service.crearNotificacionNuevaRespuesta({
        actorId: USUARIO_ID,
        destinatarioId: USUARIO_ID,
        postId: POST_ID,
        respuestaId: RESPUESTA_ID,
      });

      expect(prisma.notificacion.findFirst).not.toHaveBeenCalled();
      expect(prisma.notificacion.create).not.toHaveBeenCalled();
    });
  });

  describe('crearNotificacionSolucionMarcada', () => {
    it('debería crear una notificación de solución marcada para un destinatario activo', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        id: USUARIO_ID,
        activo: true,
      });
      prisma.notificacion.create.mockResolvedValue({
        id: NOTIFICACION_ID,
        usuarioId: USUARIO_ID,
        tipo: 'SOLUCION_MARCADA',
        leida: false,
        postId: POST_ID,
        respuestaId: RESPUESTA_ID,
        creadoEn: new Date('2026-04-24T10:00:00.000Z'),
      });

      const result = await service.crearNotificacionSolucionMarcada({
        actorId: ACTOR_ID,
        destinatarioId: USUARIO_ID,
        postId: POST_ID,
        respuestaId: RESPUESTA_ID,
      });

      expect(prisma.notificacion.create).toHaveBeenCalledWith({
        data: {
          usuarioId: USUARIO_ID,
          tipo: 'SOLUCION_MARCADA',
          postId: POST_ID,
          respuestaId: RESPUESTA_ID,
        },
      });
      expect(result).toEqual(
        expect.objectContaining({
          id: NOTIFICACION_ID,
          tipo: 'SOLUCION_MARCADA',
        })
      );
    });
  });
});
