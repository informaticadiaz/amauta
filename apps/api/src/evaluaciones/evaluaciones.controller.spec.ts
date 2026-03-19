/**
 * Unit Tests - EvaluacionesController
 *
 * Criterios de aceptación testeados:
 * - [ ] Endpoint POST /evaluaciones
 * - [ ] Usa ID del educador autenticado
 * - [ ] Endpoint GET /evaluaciones/:id
 * - [ ] Endpoint PATCH /evaluaciones/:id/publicar
 */

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { EvaluacionesController } from './evaluaciones.controller';
import { EvaluacionesService } from './evaluaciones.service';
import type { RequestUser } from '../common/guards';

describe('EvaluacionesController', () => {
  let controller: EvaluacionesController;

  const mockEvaluacionesService = {
    crear: jest.fn(),
    listarPorCurso: jest.fn(),
    obtenerDetalle: jest.fn(),
    cambiarEstadoPublicacion: jest.fn(),
  };

  const mockUser: RequestUser = {
    id: 'educador-123',
    email: 'educador@test.com',
    nombre: 'Juan',
    apellido: 'Pérez',
    rol: 'EDUCADOR',
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
      controllers: [EvaluacionesController],
      providers: [
        { provide: EvaluacionesService, useValue: mockEvaluacionesService },
      ],
    }).compile();

    controller = module.get<EvaluacionesController>(EvaluacionesController);

    jest.clearAllMocks();
  });

  describe('POST /evaluaciones', () => {
    const createDto = {
      titulo: 'Nueva Evaluación',
      descripcion: 'Descripción de la evaluación',
      cursoId: 'curso-123',
      tiempoLimiteMin: 45,
      puntajeMinimo: 60,
      intentosMaximos: 2,
    };

    it('debería crear una evaluación y retornar mensaje de éxito', async () => {
      mockEvaluacionesService.crear.mockResolvedValue(mockEvaluacion);

      const result = await controller.crear(createDto, mockUser);

      expect(result).toEqual({
        evaluacion: mockEvaluacion,
        message: 'Evaluación creada exitosamente',
      });
      expect(mockEvaluacionesService.crear).toHaveBeenCalledWith(
        createDto,
        'educador-123'
      );
    });

    it('debería usar el ID del usuario autenticado', async () => {
      mockEvaluacionesService.crear.mockResolvedValue(mockEvaluacion);

      await controller.crear(createDto, mockUser);

      expect(mockEvaluacionesService.crear).toHaveBeenCalledWith(
        createDto,
        mockUser.id
      );
    });
  });

  describe('GET /cursos/:cursoId/evaluaciones', () => {
    it('debería retornar evaluaciones paginadas del curso', async () => {
      const mockResult = {
        evaluaciones: [mockEvaluacion],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      mockEvaluacionesService.listarPorCurso.mockResolvedValue(mockResult);

      const result = await controller.listarPorCurso(
        'curso-123',
        { page: 1, limit: 10 },
        mockUser
      );

      expect(result).toEqual(mockResult);
      expect(mockEvaluacionesService.listarPorCurso).toHaveBeenCalledWith(
        'curso-123',
        { page: 1, limit: 10 },
        'educador-123'
      );
    });

    it('debería usar el ID del usuario autenticado', async () => {
      mockEvaluacionesService.listarPorCurso.mockResolvedValue({
        evaluaciones: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      await controller.listarPorCurso(
        'curso-123',
        { page: 1, limit: 10 },
        mockUser
      );

      expect(mockEvaluacionesService.listarPorCurso).toHaveBeenCalledWith(
        'curso-123',
        { page: 1, limit: 10 },
        mockUser.id
      );
    });
  });

  describe('GET /evaluaciones/:id', () => {
    it('debería retornar una evaluación con mensaje de éxito', async () => {
      mockEvaluacionesService.obtenerDetalle.mockResolvedValue(mockEvaluacion);

      const result = await controller.obtenerDetalle(
        'evaluacion-123',
        mockUser
      );

      expect(result).toEqual({
        evaluacion: mockEvaluacion,
        message: 'Evaluación obtenida exitosamente',
      });
      expect(mockEvaluacionesService.obtenerDetalle).toHaveBeenCalledWith(
        'evaluacion-123',
        'educador-123'
      );
    });

    it('debería usar el ID del usuario autenticado', async () => {
      mockEvaluacionesService.obtenerDetalle.mockResolvedValue(mockEvaluacion);

      await controller.obtenerDetalle('evaluacion-123', mockUser);

      expect(mockEvaluacionesService.obtenerDetalle).toHaveBeenCalledWith(
        'evaluacion-123',
        mockUser.id
      );
    });
  });

  describe('PATCH /evaluaciones/:id/publicar', () => {
    it('debería publicar una evaluación', async () => {
      mockEvaluacionesService.cambiarEstadoPublicacion.mockResolvedValue({
        ...mockEvaluacion,
        publicada: true,
        publicadoEn: new Date(),
      });

      const result = await controller.cambiarEstadoPublicacion(
        'evaluacion-123',
        { publicar: true },
        mockUser
      );

      expect(result).toEqual({
        evaluacion: expect.objectContaining({ publicada: true }),
        message: 'Evaluación publicada exitosamente',
      });
      expect(
        mockEvaluacionesService.cambiarEstadoPublicacion
      ).toHaveBeenCalledWith(
        'evaluacion-123',
        { publicar: true },
        'educador-123'
      );
    });

    it('debería despublicar una evaluación', async () => {
      mockEvaluacionesService.cambiarEstadoPublicacion.mockResolvedValue({
        ...mockEvaluacion,
        publicada: false,
        publicadoEn: null,
      });

      const result = await controller.cambiarEstadoPublicacion(
        'evaluacion-123',
        { publicar: false },
        mockUser
      );

      expect(result).toEqual({
        evaluacion: expect.objectContaining({ publicada: false }),
        message: 'Evaluación despublicada',
      });
      expect(
        mockEvaluacionesService.cambiarEstadoPublicacion
      ).toHaveBeenCalledWith(
        'evaluacion-123',
        { publicar: false },
        mockUser.id
      );
    });
  });
});
