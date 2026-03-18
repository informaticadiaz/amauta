/**
 * Unit Tests - EvaluacionesService
 *
 * Criterios de aceptación testeados:
 * - [ ] DTO + validación con safeParse
 * - [ ] Crear evaluación con datos válidos
 * - [ ] Validar curso existente y propiedad del educador
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
});
