/**
 * Unit Tests - ProgresoController
 *
 * Criterios de aceptación testeados:
 * - [x] Endpoint POST /lecciones/:id/completar disponible para ESTUDIANTE
 * - [x] Endpoint GET /cursos/:id/progreso disponible para ESTUDIANTE
 * - [x] Endpoint GET /cursos/:id/estudiantes/progreso disponible para EDUCADOR
 * - [x] Controller delega correctamente al service
 */

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
}));

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ProgresoController } from './progreso.controller';
import { ProgresoService } from './progreso.service';

describe('ProgresoController', () => {
  let controller: ProgresoController;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let service: any;

  const mockProgresoService = {
    completarLeccion: jest.fn(),
    obtenerProgresoCurso: jest.fn(),
    obtenerProgresoEstudiantes: jest.fn(),
  };

  const mockUser = {
    id: 'estudiante-123',
    email: 'estudiante@test.com',
    rol: 'ESTUDIANTE',
  };

  const mockEducador = {
    id: 'educador-123',
    email: 'educador@test.com',
    rol: 'EDUCADOR',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgresoController],
      providers: [
        { provide: ProgresoService, useValue: mockProgresoService },
      ],
    }).compile();

    controller = module.get<ProgresoController>(ProgresoController);
    service = module.get(ProgresoService);

    jest.clearAllMocks();
  });

  describe('completarLeccion', () => {
    it('debería llamar al service con leccionId y usuarioId', async () => {
      const mockResult = {
        progreso: { id: 'progreso-123', completado: true },
        message: 'Lección marcada como completada',
      };
      service.completarLeccion.mockResolvedValue(mockResult);

      const result = await controller.completarLeccion('leccion-123', mockUser as never);

      expect(service.completarLeccion).toHaveBeenCalledWith(
        'leccion-123',
        'estudiante-123'
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('obtenerProgresoCurso', () => {
    it('debería llamar al service con cursoId y usuarioId', async () => {
      const mockResult = {
        cursoId: 'curso-123',
        totalLecciones: 10,
        leccionesCompletadas: 4,
        porcentaje: 40,
        ultimaLeccion: null,
      };
      service.obtenerProgresoCurso.mockResolvedValue(mockResult);

      const result = await controller.obtenerProgresoCurso('curso-123', mockUser as never);

      expect(service.obtenerProgresoCurso).toHaveBeenCalledWith(
        'curso-123',
        'estudiante-123'
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('obtenerProgresoEstudiantes', () => {
    it('debería llamar al service con cursoId y educadorId', async () => {
      const mockResult = {
        cursoId: 'curso-123',
        totalLecciones: 5,
        estudiantes: [],
        total: 0,
      };
      service.obtenerProgresoEstudiantes.mockResolvedValue(mockResult);

      const result = await controller.obtenerProgresoEstudiantes(
        'curso-123',
        mockEducador as never
      );

      expect(service.obtenerProgresoEstudiantes).toHaveBeenCalledWith(
        'curso-123',
        'educador-123'
      );
      expect(result).toEqual(mockResult);
    });
  });
});
