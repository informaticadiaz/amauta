/**
 * Unit Tests - EvaluacionesController
 *
 * Criterios de aceptación testeados:
 * - [ ] Endpoint POST /evaluaciones
 * - [ ] Usa ID del educador autenticado
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
});
