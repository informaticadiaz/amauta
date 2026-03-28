/**
 * Unit Tests - InstitucionesController
 *
 * Criterios de aceptación testeados:
 * - [x] Endpoints de períodos académicos (POST, GET, PATCH, DELETE)
 * - [x] Endpoints de escala de calificación (GET, PUT)
 * - [x] Delega correctamente al service
 * - [x] Retorna estructuras de respuesta correctas
 */

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { InstitucionesController } from './instituciones.controller';
import { InstitucionesService } from './instituciones.service';
import type { RequestUser } from '../common/guards';

describe('InstitucionesController', () => {
  let controller: InstitucionesController;

  const mockService = {
    crearPeriodo: jest.fn(),
    listarPeriodos: jest.fn(),
    actualizarPeriodo: jest.fn(),
    eliminarPeriodo: jest.fn(),
    obtenerEscala: jest.fn(),
    upsertEscala: jest.fn(),
    listarEstudiantes: jest.fn(),
    listarEducadores: jest.fn(),
  };

  const mockUser: RequestUser = {
    id: 'admin-123',
    email: 'admin@escuela.test',
    nombre: 'Admin',
    apellido: 'Escuela',
    rol: 'ADMIN_ESCUELA',
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
    descripcion: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsuarios = {
    usuarios: [
      {
        id: 'user-1',
        email: 'estudiante@escuela.test',
        nombre: 'Ana',
        apellido: 'Pérez',
        activo: true,
      },
    ],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstitucionesController],
      providers: [{ provide: InstitucionesService, useValue: mockService }],
    }).compile();

    controller = module.get<InstitucionesController>(InstitucionesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================
  // POST /instituciones/:institucionId/periodos
  // ============================================================
  describe('crearPeriodo', () => {
    it('debería crear un período y retornar la respuesta correcta', async () => {
      mockService.crearPeriodo.mockResolvedValue(mockPeriodo);

      const dto = {
        nombre: '1er Trimestre 2025',
        fechaInicio: '2025-03-01',
        fechaFin: '2025-05-31',
      };

      const result = await controller.crearPeriodo('inst-123', dto, mockUser);

      expect(result).toEqual({
        periodo: mockPeriodo,
        message: expect.any(String),
      });
      expect(mockService.crearPeriodo).toHaveBeenCalledWith('inst-123', dto);
    });

    it('debería propagar NotFoundException del service', async () => {
      mockService.crearPeriodo.mockRejectedValue(
        new NotFoundException('Institución no encontrada')
      );

      await expect(
        controller.crearPeriodo('inst-inexistente', {}, mockUser)
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ============================================================
  // GET /instituciones/:institucionId/periodos
  // ============================================================
  describe('listarPeriodos', () => {
    it('debería retornar la lista de períodos', async () => {
      mockService.listarPeriodos.mockResolvedValue([mockPeriodo]);

      const result = await controller.listarPeriodos('inst-123');

      expect(result).toEqual({ periodos: [mockPeriodo] });
    });
  });

  // ============================================================
  // PATCH /instituciones/:institucionId/periodos/:id
  // ============================================================
  describe('actualizarPeriodo', () => {
    it('debería actualizar un período', async () => {
      const actualizado = { ...mockPeriodo, nombre: '2do Trimestre' };
      mockService.actualizarPeriodo.mockResolvedValue(actualizado);

      const result = await controller.actualizarPeriodo(
        'inst-123',
        'periodo-123',
        { nombre: '2do Trimestre' },
        mockUser
      );

      expect(result).toEqual({
        periodo: actualizado,
        message: expect.any(String),
      });
    });
  });

  // ============================================================
  // DELETE /instituciones/:institucionId/periodos/:id
  // ============================================================
  describe('eliminarPeriodo', () => {
    it('debería eliminar (desactivar) un período', async () => {
      mockService.eliminarPeriodo.mockResolvedValue(undefined);

      await expect(
        controller.eliminarPeriodo('inst-123', 'periodo-123', mockUser)
      ).resolves.not.toThrow();

      expect(mockService.eliminarPeriodo).toHaveBeenCalledWith('periodo-123');
    });
  });

  // ============================================================
  // GET /instituciones/:institucionId/escala-calificacion
  // ============================================================
  describe('obtenerEscala', () => {
    it('debería retornar la escala de calificación', async () => {
      mockService.obtenerEscala.mockResolvedValue(mockEscala);

      const result = await controller.obtenerEscala('inst-123');

      expect(result).toEqual({ escala: mockEscala });
    });
  });

  // ============================================================
  // PUT /instituciones/:institucionId/escala-calificacion
  // ============================================================
  describe('upsertEscala', () => {
    it('debería crear o actualizar la escala y retornar la respuesta correcta', async () => {
      mockService.upsertEscala.mockResolvedValue(mockEscala);

      const dto = { notaMinima: 0, notaMaxima: 10, notaAprobacion: 6 };

      const result = await controller.upsertEscala('inst-123', dto, mockUser);

      expect(result).toEqual({
        escala: mockEscala,
        message: expect.any(String),
      });
      expect(mockService.upsertEscala).toHaveBeenCalledWith('inst-123', dto);
    });
  });

  // ============================================================
  // GET /instituciones/:institucionId/estudiantes
  // ============================================================
  describe('listarEstudiantes', () => {
    it('debería retornar la lista de estudiantes con paginación', async () => {
      mockService.listarEstudiantes.mockResolvedValue(mockUsuarios);

      const result = await controller.listarEstudiantes(
        'inst-123',
        { page: 1, limit: 10, buscar: 'ana' },
        mockUser
      );

      expect(result).toEqual(mockUsuarios);
      expect(mockService.listarEstudiantes).toHaveBeenCalledWith(
        'inst-123',
        { page: 1, limit: 10, buscar: 'ana' },
        mockUser.id
      );
    });
  });

  // ============================================================
  // GET /instituciones/:institucionId/educadores
  // ============================================================
  describe('listarEducadores', () => {
    it('debería retornar la lista de educadores con paginación', async () => {
      mockService.listarEducadores.mockResolvedValue(mockUsuarios);

      const result = await controller.listarEducadores(
        'inst-123',
        { page: 1, limit: 10 },
        mockUser
      );

      expect(result).toEqual(mockUsuarios);
      expect(mockService.listarEducadores).toHaveBeenCalledWith(
        'inst-123',
        { page: 1, limit: 10 },
        mockUser.id
      );
    });
  });
});
