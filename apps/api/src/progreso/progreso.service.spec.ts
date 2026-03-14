/**
 * Unit Tests - ProgresoService
 *
 * Criterios de aceptación testeados:
 * - [x] Marcar lección completada (idempotente)
 * - [x] Progreso se calcula correctamente
 * - [x] Respuesta incluye última lección vista
 * - [x] Educador ve progreso de sus estudiantes
 * - [x] Solo estudiantes inscritos pueden marcar lecciones
 */

// Mock @prisma/client ANTES de cualquier import que lo use
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
  EstadoInscripcion: {
    ACTIVO: 'ACTIVO',
    COMPLETADO: 'COMPLETADO',
    ABANDONADO: 'ABANDONADO',
  },
}));

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProgresoService } from './progreso.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProgresoService', () => {
  let service: ProgresoService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;

  const mockPrisma = {
    leccion: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
    },
    curso: {
      findUnique: jest.fn(),
    },
    inscripcion: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    progreso: {
      upsert: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  const mockLeccion = {
    id: 'leccion-123',
    titulo: 'Lección de Prueba',
    orden: 0,
    cursoId: 'curso-123',
    publicada: true,
  };

  const mockCurso = {
    id: 'curso-123',
    educadorId: 'educador-123',
  };

  const mockInscripcion = {
    id: 'inscripcion-123',
    usuarioId: 'estudiante-123',
    cursoId: 'curso-123',
    estado: 'ACTIVO',
    progreso: 0,
    inscritoEn: new Date(),
  };

  const mockProgreso = {
    id: 'progreso-123',
    usuarioId: 'estudiante-123',
    leccionId: 'leccion-123',
    completado: true,
    completadoEn: new Date(),
    ultimoAcceso: new Date(),
    porcentaje: 0,
    intentos: 0,
    mejorPuntaje: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgresoService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ProgresoService>(ProgresoService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('completarLeccion', () => {
    beforeEach(() => {
      prisma.leccion.findUnique.mockResolvedValue(mockLeccion);
      prisma.inscripcion.findUnique.mockResolvedValue(mockInscripcion);
      prisma.progreso.upsert.mockResolvedValue(mockProgreso);
      prisma.leccion.count.mockResolvedValue(5);
      prisma.progreso.count.mockResolvedValue(1);
      prisma.inscripcion.update.mockResolvedValue({ ...mockInscripcion, progreso: 20 });
    });

    it('debería marcar una lección como completada', async () => {
      const result = await service.completarLeccion('leccion-123', 'estudiante-123');

      expect(result.progreso).toEqual(mockProgreso);
      expect(result.message).toBe('Lección marcada como completada');
      expect(prisma.progreso.upsert).toHaveBeenCalled();
    });

    it('debería ser idempotente (no falla si ya estaba completada)', async () => {
      prisma.progreso.upsert.mockResolvedValue({ ...mockProgreso, completado: true });

      const result = await service.completarLeccion('leccion-123', 'estudiante-123');

      expect(result.progreso.completado).toBe(true);
      expect(prisma.progreso.upsert).toHaveBeenCalledTimes(1);
    });

    it('debería actualizar el porcentaje en la inscripción', async () => {
      prisma.leccion.count.mockResolvedValue(4);
      prisma.progreso.count.mockResolvedValue(1);

      await service.completarLeccion('leccion-123', 'estudiante-123');

      expect(prisma.inscripcion.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            progreso: 25, // 1/4 * 100
          }),
        })
      );
    });

    it('debería marcar inscripción como COMPLETADO cuando todas las lecciones están completas', async () => {
      prisma.leccion.count.mockResolvedValue(3);
      prisma.progreso.count.mockResolvedValue(3);

      await service.completarLeccion('leccion-123', 'estudiante-123');

      expect(prisma.inscripcion.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            progreso: 100,
            estado: 'COMPLETADO',
          }),
        })
      );
    });

    it('debería lanzar NotFoundException si la lección no existe', async () => {
      prisma.leccion.findUnique.mockResolvedValue(null);

      await expect(
        service.completarLeccion('leccion-inexistente', 'estudiante-123')
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar ForbiddenException si el usuario no está inscripto', async () => {
      prisma.inscripcion.findUnique.mockResolvedValue(null);

      await expect(
        service.completarLeccion('leccion-123', 'estudiante-123')
      ).rejects.toThrow(ForbiddenException);
    });

    it('debería lanzar ForbiddenException si la inscripción está ABANDONADA', async () => {
      prisma.inscripcion.findUnique.mockResolvedValue({
        ...mockInscripcion,
        estado: 'ABANDONADO',
      });

      await expect(
        service.completarLeccion('leccion-123', 'estudiante-123')
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('obtenerProgresoCurso', () => {
    beforeEach(() => {
      prisma.curso.findUnique.mockResolvedValue(mockCurso);
      prisma.inscripcion.findUnique.mockResolvedValue(mockInscripcion);
      prisma.leccion.count.mockResolvedValue(10);
      prisma.progreso.count.mockResolvedValue(4);
      prisma.progreso.findFirst.mockResolvedValue({
        ...mockProgreso,
        leccion: { id: 'leccion-123', titulo: 'Lección de Prueba', orden: 0 },
      });
    });

    it('debería retornar el progreso del estudiante en el curso', async () => {
      const result = await service.obtenerProgresoCurso('curso-123', 'estudiante-123');

      expect(result.cursoId).toBe('curso-123');
      expect(result.totalLecciones).toBe(10);
      expect(result.leccionesCompletadas).toBe(4);
      expect(result.porcentaje).toBe(40);
    });

    it('debería incluir la última lección accedida', async () => {
      const result = await service.obtenerProgresoCurso('curso-123', 'estudiante-123');

      expect(result.ultimaLeccion).toEqual({
        id: 'leccion-123',
        titulo: 'Lección de Prueba',
        orden: 0,
      });
    });

    it('debería retornar ultimaLeccion null si no hay progreso', async () => {
      prisma.progreso.findFirst.mockResolvedValue(null);

      const result = await service.obtenerProgresoCurso('curso-123', 'estudiante-123');

      expect(result.ultimaLeccion).toBeNull();
    });

    it('debería calcular porcentaje 0 si no hay lecciones completadas', async () => {
      prisma.progreso.count.mockResolvedValue(0);

      const result = await service.obtenerProgresoCurso('curso-123', 'estudiante-123');

      expect(result.porcentaje).toBe(0);
    });

    it('debería lanzar NotFoundException si el curso no existe', async () => {
      prisma.curso.findUnique.mockResolvedValue(null);

      await expect(
        service.obtenerProgresoCurso('curso-inexistente', 'estudiante-123')
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar ForbiddenException si el usuario no está inscripto', async () => {
      prisma.inscripcion.findUnique.mockResolvedValue(null);

      await expect(
        service.obtenerProgresoCurso('curso-123', 'estudiante-123')
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('obtenerProgresoEstudiantes', () => {
    const mockUsuario = {
      id: 'estudiante-123',
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@test.com',
    };

    beforeEach(() => {
      prisma.curso.findUnique.mockResolvedValue(mockCurso);
      prisma.leccion.count.mockResolvedValue(5);
      prisma.inscripcion.findMany.mockResolvedValue([
        { ...mockInscripcion, usuario: mockUsuario },
      ]);
      prisma.progreso.count.mockResolvedValue(2);
    });

    it('debería retornar el progreso de todos los estudiantes del curso', async () => {
      const result = await service.obtenerProgresoEstudiantes(
        'curso-123',
        'educador-123'
      );

      expect(result.total).toBe(1);
      expect(result.estudiantes[0].usuario).toEqual(mockUsuario);
      expect(result.estudiantes[0].leccionesCompletadas).toBe(2);
      expect(result.estudiantes[0].porcentaje).toBe(40); // 2/5 * 100
    });

    it('debería lanzar NotFoundException si el curso no existe', async () => {
      prisma.curso.findUnique.mockResolvedValue(null);

      await expect(
        service.obtenerProgresoEstudiantes('curso-inexistente', 'educador-123')
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar ForbiddenException si no es el educador del curso', async () => {
      prisma.curso.findUnique.mockResolvedValue({
        ...mockCurso,
        educadorId: 'otro-educador',
      });

      await expect(
        service.obtenerProgresoEstudiantes('curso-123', 'educador-123')
      ).rejects.toThrow(ForbiddenException);
    });

    it('debería retornar lista vacía si no hay estudiantes inscritos', async () => {
      prisma.inscripcion.findMany.mockResolvedValue([]);

      const result = await service.obtenerProgresoEstudiantes(
        'curso-123',
        'educador-123'
      );

      expect(result.total).toBe(0);
      expect(result.estudiantes).toHaveLength(0);
    });
  });
});
