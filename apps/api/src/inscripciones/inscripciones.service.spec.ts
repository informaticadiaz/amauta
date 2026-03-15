/**
 * Unit Tests - InscripcionesService
 *
 * Criterios de aceptación testeados:
 * - [x] Inscripción crea registro correctamente
 * - [x] No permite inscripciones duplicadas
 * - [x] Solo cursos publicados permiten inscripción
 * - [x] Cancelación cambia estado (no elimina)
 * - [x] Query de mis cursos funciona con paginación
 */

// Mock @prisma/client ANTES de cualquier import que lo use
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
  EstadoCurso: {
    BORRADOR: 'BORRADOR',
    REVISION: 'REVISION',
    PUBLICADO: 'PUBLICADO',
    ARCHIVADO: 'ARCHIVADO',
  },
  EstadoInscripcion: {
    ACTIVO: 'ACTIVO',
    COMPLETADO: 'COMPLETADO',
    ABANDONADO: 'ABANDONADO',
  },
}));

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InscripcionesService } from './inscripciones.service';
import { PrismaService } from '../prisma/prisma.service';

describe('InscripcionesService', () => {
  let service: InscripcionesService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;

  const mockPrisma = {
    curso: {
      findUnique: jest.fn(),
    },
    inscripcion: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  // Datos de prueba
  const mockCursoPublicado = {
    id: 'curso-123',
    estado: 'PUBLICADO',
    titulo: 'Curso de Prueba',
  };

  const mockCursoBorrador = {
    id: 'curso-borrador',
    estado: 'BORRADOR',
    titulo: 'Curso Borrador',
  };

  const mockInscripcionActiva = {
    id: 'inscripcion-123',
    usuarioId: 'usuario-123',
    cursoId: 'curso-123',
    estado: 'ACTIVO',
    progreso: 0,
    inscritoEn: new Date(),
    completadoEn: null,
    curso: {
      id: 'curso-123',
      titulo: 'Curso de Prueba',
      slug: 'curso-de-prueba',
      imagen: null,
      nivel: 'PRINCIPIANTE',
      educador: { id: 'educador-1', nombre: 'Juan', apellido: 'Pérez' },
      _count: { lecciones: 5 },
    },
  };

  const mockInscripcionAbandonada = {
    ...mockInscripcionActiva,
    id: 'inscripcion-abandonada',
    estado: 'ABANDONADO',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InscripcionesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<InscripcionesService>(InscripcionesService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('inscribirse', () => {
    it('debería inscribir a un usuario en un curso publicado', async () => {
      prisma.curso.findUnique.mockResolvedValue(mockCursoPublicado);
      prisma.inscripcion.findUnique.mockResolvedValue(null);
      prisma.inscripcion.create.mockResolvedValue(mockInscripcionActiva);

      const result = await service.inscribirse('curso-123', 'usuario-123');

      expect(result).toEqual(mockInscripcionActiva);
      expect(prisma.inscripcion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            usuarioId: 'usuario-123',
            cursoId: 'curso-123',
          }),
        })
      );
    });

    it('debería lanzar NotFoundException si el curso no existe', async () => {
      prisma.curso.findUnique.mockResolvedValue(null);

      await expect(
        service.inscribirse('curso-inexistente', 'usuario-123')
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar BadRequestException si el curso no está publicado', async () => {
      prisma.curso.findUnique.mockResolvedValue(mockCursoBorrador);

      await expect(
        service.inscribirse('curso-borrador', 'usuario-123')
      ).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar ConflictException si ya está inscrito activamente', async () => {
      prisma.curso.findUnique.mockResolvedValue(mockCursoPublicado);
      prisma.inscripcion.findUnique.mockResolvedValue(mockInscripcionActiva);

      await expect(
        service.inscribirse('curso-123', 'usuario-123')
      ).rejects.toThrow(ConflictException);
    });

    it('debería reactivar una inscripción abandonada', async () => {
      prisma.curso.findUnique.mockResolvedValue(mockCursoPublicado);
      prisma.inscripcion.findUnique.mockResolvedValue(
        mockInscripcionAbandonada
      );
      prisma.inscripcion.update.mockResolvedValue({
        ...mockInscripcionAbandonada,
        estado: 'ACTIVO',
      });

      const result = await service.inscribirse('curso-123', 'usuario-123');

      expect(result.estado).toBe('ACTIVO');
      expect(prisma.inscripcion.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockInscripcionAbandonada.id },
          data: expect.objectContaining({
            estado: 'ACTIVO',
          }),
        })
      );
      expect(prisma.inscripcion.create).not.toHaveBeenCalled();
    });
  });

  describe('cancelarInscripcion', () => {
    it('debería cancelar una inscripción activa (soft delete)', async () => {
      prisma.inscripcion.findUnique.mockResolvedValue(mockInscripcionActiva);
      prisma.inscripcion.update.mockResolvedValue({
        ...mockInscripcionActiva,
        estado: 'ABANDONADO',
      });

      await service.cancelarInscripcion('curso-123', 'usuario-123');

      expect(prisma.inscripcion.update).toHaveBeenCalledWith({
        where: { id: mockInscripcionActiva.id },
        data: { estado: 'ABANDONADO' },
      });
    });

    it('debería lanzar NotFoundException si no está inscrito', async () => {
      prisma.inscripcion.findUnique.mockResolvedValue(null);

      await expect(
        service.cancelarInscripcion('curso-123', 'usuario-123')
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar BadRequestException si ya está abandonada', async () => {
      prisma.inscripcion.findUnique.mockResolvedValue(
        mockInscripcionAbandonada
      );

      await expect(
        service.cancelarInscripcion('curso-123', 'usuario-123')
      ).rejects.toThrow(BadRequestException);
    });

    it('no debería eliminar físicamente la inscripción', async () => {
      prisma.inscripcion.findUnique.mockResolvedValue(mockInscripcionActiva);
      prisma.inscripcion.update.mockResolvedValue({});

      await service.cancelarInscripcion('curso-123', 'usuario-123');

      // Verificar que se usa update (soft delete), no delete
      expect(prisma.inscripcion.update).toHaveBeenCalled();
    });
  });

  describe('obtenerEstadoInscripcion', () => {
    it('debería retornar la inscripción si existe', async () => {
      prisma.inscripcion.findUnique.mockResolvedValue(mockInscripcionActiva);

      const result = await service.obtenerEstadoInscripcion(
        'curso-123',
        'usuario-123'
      );

      expect(result).toEqual(mockInscripcionActiva);
      expect(prisma.inscripcion.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            usuarioId_cursoId: {
              usuarioId: 'usuario-123',
              cursoId: 'curso-123',
            },
          },
        })
      );
    });

    it('debería retornar null si no está inscrito', async () => {
      prisma.inscripcion.findUnique.mockResolvedValue(null);

      const result = await service.obtenerEstadoInscripcion(
        'curso-123',
        'usuario-123'
      );

      expect(result).toBeNull();
    });
  });

  describe('listarMisInscripciones', () => {
    it('debería retornar lista paginada de inscripciones', async () => {
      prisma.inscripcion.findMany.mockResolvedValue([mockInscripcionActiva]);
      prisma.inscripcion.count.mockResolvedValue(1);

      const result = await service.listarMisInscripciones('usuario-123', {
        page: 1,
        limit: 10,
      });

      expect(result.inscripciones).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('debería filtrar por usuarioId correctamente', async () => {
      prisma.inscripcion.findMany.mockResolvedValue([]);
      prisma.inscripcion.count.mockResolvedValue(0);

      await service.listarMisInscripciones('usuario-123', {
        page: 1,
        limit: 10,
      });

      expect(prisma.inscripcion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            usuarioId: 'usuario-123',
          }),
        })
      );
    });

    it('debería filtrar por estado cuando se proporciona', async () => {
      prisma.inscripcion.findMany.mockResolvedValue([]);
      prisma.inscripcion.count.mockResolvedValue(0);

      await service.listarMisInscripciones('usuario-123', {
        page: 1,
        limit: 10,
        estado: 'ACTIVO',
      });

      expect(prisma.inscripcion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            usuarioId: 'usuario-123',
            estado: 'ACTIVO',
          }),
        })
      );
    });

    it('debería aplicar paginación correctamente', async () => {
      prisma.inscripcion.findMany.mockResolvedValue([]);
      prisma.inscripcion.count.mockResolvedValue(25);

      const result = await service.listarMisInscripciones('usuario-123', {
        page: 3,
        limit: 10,
      });

      expect(result.totalPages).toBe(3);
      expect(prisma.inscripcion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20, // (3 - 1) * 10
          take: 10,
        })
      );
    });

    it('debería lanzar BadRequestException con query inválida', async () => {
      await expect(
        service.listarMisInscripciones('usuario-123', {
          page: -1, // inválido: debe ser positivo
          limit: 10,
        })
      ).rejects.toThrow(BadRequestException);
    });
  });
});
