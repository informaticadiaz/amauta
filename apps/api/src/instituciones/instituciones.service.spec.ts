/**
 * Unit Tests - InstitucionesService
 *
 * Criterios de aceptación testeados:
 * - [x] CRUD de períodos académicos por institución
 * - [x] Soft delete de períodos (activo = false)
 * - [x] Validación de datos de entrada
 * - [x] GET/PUT de escala de calificación (upsert)
 * - [x] Lanza NotFoundException si institución/período no existe
 */

// Mock @prisma/client ANTES de cualquier import
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
}));

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InstitucionesService } from './instituciones.service';
import { PrismaService } from '../prisma/prisma.service';

describe('InstitucionesService', () => {
  let service: InstitucionesService;

  const mockPrisma = {
    institucion: {
      findUnique: jest.fn(),
    },
    periodoAcademico: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    escalaCalificacion: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  };

  const mockInstitucion = {
    id: 'inst-123',
    nombre: 'Escuela Técnica N°1',
    tipo: 'ESCUELA',
    activa: true,
  };

  const mockPeriodo = {
    id: 'periodo-123',
    nombre: '1er Trimestre 2025',
    institucionId: 'inst-123',
    fechaInicio: new Date('2025-03-01'),
    fechaFin: new Date('2025-05-31'),
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEscala = {
    id: 'escala-123',
    institucionId: 'inst-123',
    notaMinima: 0,
    notaMaxima: 10,
    notaAprobacion: 6,
    descripcion: 'Escala 0-10, aprobado con 6',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstitucionesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<InstitucionesService>(InstitucionesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================
  // crearPeriodo
  // ============================================================
  describe('crearPeriodo', () => {
    const dto = {
      nombre: '1er Trimestre 2025',
      fechaInicio: '2025-03-01',
      fechaFin: '2025-05-31',
    };

    it('debería crear un período cuando los datos son válidos', async () => {
      mockPrisma.institucion.findUnique.mockResolvedValue(mockInstitucion);
      mockPrisma.periodoAcademico.create.mockResolvedValue(mockPeriodo);

      const result = await service.crearPeriodo('inst-123', dto);

      expect(result).toEqual(mockPeriodo);
      expect(mockPrisma.periodoAcademico.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          nombre: '1er Trimestre 2025',
          institucionId: 'inst-123',
        }),
      });
    });

    it('debería lanzar NotFoundException si la institución no existe', async () => {
      mockPrisma.institucion.findUnique.mockResolvedValue(null);

      await expect(
        service.crearPeriodo('inst-inexistente', dto)
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar BadRequestException si el nombre está vacío', async () => {
      await expect(
        service.crearPeriodo('inst-123', { ...dto, nombre: '' })
      ).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar BadRequestException si fechaFin es anterior a fechaInicio', async () => {
      mockPrisma.institucion.findUnique.mockResolvedValue(mockInstitucion);

      await expect(
        service.crearPeriodo('inst-123', {
          ...dto,
          fechaInicio: '2025-06-01',
          fechaFin: '2025-03-01',
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ============================================================
  // listarPeriodos
  // ============================================================
  describe('listarPeriodos', () => {
    it('debería retornar los períodos de una institución', async () => {
      mockPrisma.institucion.findUnique.mockResolvedValue(mockInstitucion);
      mockPrisma.periodoAcademico.findMany.mockResolvedValue([mockPeriodo]);

      const result = await service.listarPeriodos('inst-123');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockPeriodo);
      expect(mockPrisma.periodoAcademico.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { institucionId: 'inst-123' } })
      );
    });

    it('debería lanzar NotFoundException si la institución no existe', async () => {
      mockPrisma.institucion.findUnique.mockResolvedValue(null);

      await expect(service.listarPeriodos('inst-inexistente')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  // ============================================================
  // actualizarPeriodo
  // ============================================================
  describe('actualizarPeriodo', () => {
    it('debería actualizar un período existente', async () => {
      const periodoActualizado = {
        ...mockPeriodo,
        nombre: '2do Trimestre 2025',
      };
      mockPrisma.periodoAcademico.findUnique.mockResolvedValue(mockPeriodo);
      mockPrisma.periodoAcademico.update.mockResolvedValue(periodoActualizado);

      const result = await service.actualizarPeriodo('periodo-123', {
        nombre: '2do Trimestre 2025',
      });

      expect(result.nombre).toBe('2do Trimestre 2025');
      expect(mockPrisma.periodoAcademico.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'periodo-123' } })
      );
    });

    it('debería lanzar NotFoundException si el período no existe', async () => {
      mockPrisma.periodoAcademico.findUnique.mockResolvedValue(null);

      await expect(
        service.actualizarPeriodo('periodo-inexistente', { nombre: 'Nuevo' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ============================================================
  // eliminarPeriodo (soft delete)
  // ============================================================
  describe('eliminarPeriodo', () => {
    it('debería desactivar el período (soft delete)', async () => {
      mockPrisma.periodoAcademico.findUnique.mockResolvedValue(mockPeriodo);
      mockPrisma.periodoAcademico.update.mockResolvedValue({
        ...mockPeriodo,
        activo: false,
      });

      await service.eliminarPeriodo('periodo-123');

      expect(mockPrisma.periodoAcademico.update).toHaveBeenCalledWith({
        where: { id: 'periodo-123' },
        data: { activo: false },
      });
    });

    it('debería lanzar NotFoundException si el período no existe', async () => {
      mockPrisma.periodoAcademico.findUnique.mockResolvedValue(null);

      await expect(
        service.eliminarPeriodo('periodo-inexistente')
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ============================================================
  // obtenerEscala
  // ============================================================
  describe('obtenerEscala', () => {
    it('debería retornar la escala de calificación de una institución', async () => {
      mockPrisma.institucion.findUnique.mockResolvedValue(mockInstitucion);
      mockPrisma.escalaCalificacion.findUnique.mockResolvedValue(mockEscala);

      const result = await service.obtenerEscala('inst-123');

      expect(result).toEqual(mockEscala);
    });

    it('debería retornar null si no hay escala configurada', async () => {
      mockPrisma.institucion.findUnique.mockResolvedValue(mockInstitucion);
      mockPrisma.escalaCalificacion.findUnique.mockResolvedValue(null);

      const result = await service.obtenerEscala('inst-123');

      expect(result).toBeNull();
    });

    it('debería lanzar NotFoundException si la institución no existe', async () => {
      mockPrisma.institucion.findUnique.mockResolvedValue(null);

      await expect(service.obtenerEscala('inst-inexistente')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  // ============================================================
  // upsertEscala
  // ============================================================
  describe('upsertEscala', () => {
    const dto = {
      notaMinima: 0,
      notaMaxima: 10,
      notaAprobacion: 6,
      descripcion: 'Escala 0-10',
    };

    it('debería crear o actualizar la escala de calificación', async () => {
      mockPrisma.institucion.findUnique.mockResolvedValue(mockInstitucion);
      mockPrisma.escalaCalificacion.upsert.mockResolvedValue(mockEscala);

      const result = await service.upsertEscala('inst-123', dto);

      expect(result).toEqual(mockEscala);
      expect(mockPrisma.escalaCalificacion.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { institucionId: 'inst-123' },
        })
      );
    });

    it('debería lanzar BadRequestException si notaAprobacion > notaMaxima', async () => {
      mockPrisma.institucion.findUnique.mockResolvedValue(mockInstitucion);

      await expect(
        service.upsertEscala('inst-123', {
          ...dto,
          notaAprobacion: 15,
          notaMaxima: 10,
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar BadRequestException si notaAprobacion < notaMinima', async () => {
      mockPrisma.institucion.findUnique.mockResolvedValue(mockInstitucion);

      await expect(
        service.upsertEscala('inst-123', {
          ...dto,
          notaMinima: 5,
          notaAprobacion: 3,
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar NotFoundException si la institución no existe', async () => {
      mockPrisma.institucion.findUnique.mockResolvedValue(null);

      await expect(
        service.upsertEscala('inst-inexistente', dto)
      ).rejects.toThrow(NotFoundException);
    });
  });
});
