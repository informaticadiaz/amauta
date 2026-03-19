/**
 * Unit Tests - EvaluacionesService
 *
 * Criterios de aceptación testeados:
 * - [ ] DTO + validación con safeParse
 * - [ ] Crear evaluación con datos válidos
 * - [ ] Validar curso existente y propiedad del educador
 * - [ ] Obtener detalle de evaluación con verificación de propietario
 * - [ ] Publicar/despublicar evaluación con validación de propietario
 */

// Mock @prisma/client ANTES de cualquier import que lo use
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
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EvaluacionesService } from './evaluaciones.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EvaluacionesService', () => {
  let service: EvaluacionesService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;

  const mockPrisma = {
    curso: {
      findUnique: jest.fn(),
    },
    evaluacion: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockEvaluacion = {
    id: 'evaluacion-123',
    titulo: 'Evaluación de prueba',
    descripcion: 'Descripción de la evaluación',
    cursoId: 'curso-123',
    creadorId: 'educador-123',
    tiempoLimiteMin: 30,
    puntajeMinimo: 60,
    intentosMaximos: 2,
    publicada: false,
    publicadoEn: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluacionesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<EvaluacionesService>(EvaluacionesService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('crear', () => {
    const createDto = {
      titulo: 'Nueva Evaluación',
      descripcion: 'Descripción de la evaluación',
      cursoId: 'curso-123',
      tiempoLimiteMin: 45,
      puntajeMinimo: 60,
      intentosMaximos: 2,
    };

    it('debería crear una evaluación con datos válidos', async () => {
      prisma.curso.findUnique.mockResolvedValue({ educadorId: 'educador-123' });
      prisma.evaluacion.create.mockResolvedValue(mockEvaluacion);

      const result = await service.crear(createDto, 'educador-123');

      expect(result).toEqual(mockEvaluacion);
      expect(prisma.evaluacion.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          titulo: createDto.titulo,
          descripcion: createDto.descripcion,
          cursoId: createDto.cursoId,
          tiempoLimiteMin: createDto.tiempoLimiteMin,
          puntajeMinimo: createDto.puntajeMinimo,
          intentosMaximos: createDto.intentosMaximos,
          creadorId: 'educador-123',
        }),
      });
    });

    it('debería lanzar NotFoundException si el curso no existe', async () => {
      prisma.curso.findUnique.mockResolvedValue(null);

      await expect(service.crear(createDto, 'educador-123')).rejects.toThrow(
        NotFoundException
      );
    });

    it('debería lanzar ForbiddenException si no es propietario del curso', async () => {
      prisma.curso.findUnique.mockResolvedValue({ educadorId: 'otro-123' });

      await expect(service.crear(createDto, 'educador-123')).rejects.toThrow(
        ForbiddenException
      );
    });

    it('debería lanzar BadRequestException con datos inválidos', async () => {
      const dtoInvalido = { ...createDto, titulo: 'AB' };

      await expect(service.crear(dtoInvalido, 'educador-123')).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('listarPorCurso', () => {
    it('debería retornar evaluaciones paginadas del curso', async () => {
      prisma.curso.findUnique.mockResolvedValue({ educadorId: 'educador-123' });
      prisma.evaluacion.findMany.mockResolvedValue([mockEvaluacion]);
      prisma.evaluacion.count.mockResolvedValue(1);

      const result = await service.listarPorCurso(
        'curso-123',
        { page: 1, limit: 10 },
        'educador-123'
      );

      expect(result).toEqual({
        evaluaciones: [mockEvaluacion],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(prisma.evaluacion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { cursoId: 'curso-123' },
          skip: 0,
          take: 10,
        })
      );
    });

    it('debería aplicar filtro por publicada cuando se proporciona', async () => {
      prisma.curso.findUnique.mockResolvedValue({ educadorId: 'educador-123' });
      prisma.evaluacion.findMany.mockResolvedValue([]);
      prisma.evaluacion.count.mockResolvedValue(0);

      await service.listarPorCurso(
        'curso-123',
        { page: 1, limit: 10, publicada: true },
        'educador-123'
      );

      expect(prisma.evaluacion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { cursoId: 'curso-123', publicada: true },
        })
      );
    });

    it('debería lanzar NotFoundException si el curso no existe', async () => {
      prisma.curso.findUnique.mockResolvedValue(null);

      await expect(
        service.listarPorCurso(
          'curso-123',
          { page: 1, limit: 10 },
          'educador-123'
        )
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar ForbiddenException si no es propietario del curso', async () => {
      prisma.curso.findUnique.mockResolvedValue({ educadorId: 'otro-123' });

      await expect(
        service.listarPorCurso(
          'curso-123',
          { page: 1, limit: 10 },
          'educador-123'
        )
      ).rejects.toThrow(ForbiddenException);
    });

    it('debería lanzar BadRequestException con query inválida', async () => {
      prisma.curso.findUnique.mockResolvedValue({ educadorId: 'educador-123' });

      await expect(
        service.listarPorCurso(
          'curso-123',
          { page: 0, limit: 10 },
          'educador-123'
        )
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('obtenerDetalle', () => {
    it('debería retornar la evaluación si el educador es propietario', async () => {
      prisma.evaluacion.findUnique.mockResolvedValue({
        ...mockEvaluacion,
        curso: { educadorId: 'educador-123' },
      });

      const result = await service.obtenerDetalle(
        'evaluacion-123',
        'educador-123'
      );

      expect(result).toEqual(mockEvaluacion);
      expect(prisma.evaluacion.findUnique).toHaveBeenCalledWith({
        where: { id: 'evaluacion-123' },
        include: { curso: { select: { educadorId: true } } },
      });
    });

    it('debería lanzar NotFoundException si la evaluación no existe', async () => {
      prisma.evaluacion.findUnique.mockResolvedValue(null);

      await expect(
        service.obtenerDetalle('evaluacion-999', 'educador-123')
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar ForbiddenException si no es propietario del curso', async () => {
      prisma.evaluacion.findUnique.mockResolvedValue({
        ...mockEvaluacion,
        curso: { educadorId: 'otro-educador' },
      });

      await expect(
        service.obtenerDetalle('evaluacion-123', 'educador-123')
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('cambiarEstadoPublicacion', () => {
    it('debería publicar una evaluación', async () => {
      prisma.evaluacion.findUnique.mockResolvedValue({
        ...mockEvaluacion,
        curso: { educadorId: 'educador-123' },
      });
      prisma.evaluacion.update.mockResolvedValue({
        ...mockEvaluacion,
        publicada: true,
        publicadoEn: new Date(),
      });

      const result = await service.cambiarEstadoPublicacion(
        'evaluacion-123',
        { publicar: true },
        'educador-123'
      );

      expect(result.publicada).toBe(true);
      expect(prisma.evaluacion.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            publicada: true,
            publicadoEn: expect.any(Date),
          }),
        })
      );
    });

    it('debería despublicar una evaluación', async () => {
      prisma.evaluacion.findUnique.mockResolvedValue({
        ...mockEvaluacion,
        curso: { educadorId: 'educador-123' },
      });
      prisma.evaluacion.update.mockResolvedValue({
        ...mockEvaluacion,
        publicada: false,
        publicadoEn: null,
      });

      const result = await service.cambiarEstadoPublicacion(
        'evaluacion-123',
        { publicar: false },
        'educador-123'
      );

      expect(result.publicada).toBe(false);
      expect(prisma.evaluacion.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            publicada: false,
            publicadoEn: null,
          }),
        })
      );
    });

    it('debería lanzar NotFoundException si la evaluación no existe', async () => {
      prisma.evaluacion.findUnique.mockResolvedValue(null);

      await expect(
        service.cambiarEstadoPublicacion(
          'evaluacion-999',
          { publicar: true },
          'educador-123'
        )
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar ForbiddenException si no es propietario del curso', async () => {
      prisma.evaluacion.findUnique.mockResolvedValue({
        ...mockEvaluacion,
        curso: { educadorId: 'otro-educador' },
      });

      await expect(
        service.cambiarEstadoPublicacion(
          'evaluacion-123',
          { publicar: true },
          'educador-123'
        )
      ).rejects.toThrow(ForbiddenException);
    });

    it('debería lanzar BadRequestException con datos inválidos', async () => {
      await expect(
        service.cambiarEstadoPublicacion(
          'evaluacion-123',
          {} as { publicar: boolean },
          'educador-123'
        )
      ).rejects.toThrow(BadRequestException);
    });
  });
});
