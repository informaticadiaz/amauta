/**
 * Unit Tests - InscripcionesController
 *
 * Criterios de aceptación testeados:
 * - [x] POST /cursos/:id/inscribir → inscripción exitosa
 * - [x] DELETE /cursos/:id/inscribir → cancelación exitosa
 * - [x] GET /cursos/:id/inscripcion → estado de inscripción
 * - [x] GET /mis-cursos → lista paginada de inscripciones
 */

// Mock @prisma/client ANTES de cualquier import
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
import { InscripcionesController } from './inscripciones.controller';
import { InscripcionesService } from './inscripciones.service';
import type { RequestUser } from '../common/guards';

describe('InscripcionesController', () => {
  let controller: InscripcionesController;

  const mockInscripcionesService = {
    inscribirse: jest.fn(),
    cancelarInscripcion: jest.fn(),
    obtenerEstadoInscripcion: jest.fn(),
    listarMisInscripciones: jest.fn(),
  };

  const mockUser: RequestUser = {
    id: 'usuario-123',
    email: 'estudiante@test.com',
    rol: 'ESTUDIANTE',
  };

  const mockInscripcion = {
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InscripcionesController],
      providers: [
        {
          provide: InscripcionesService,
          useValue: mockInscripcionesService,
        },
      ],
    }).compile();

    controller = module.get<InscripcionesController>(InscripcionesController);

    jest.clearAllMocks();
  });

  describe('inscribirse (POST /cursos/:id/inscribir)', () => {
    it('debería retornar inscripción con mensaje de éxito', async () => {
      mockInscripcionesService.inscribirse.mockResolvedValue(mockInscripcion);

      const result = await controller.inscribirse('curso-123', mockUser);

      expect(result.inscripcion).toEqual(mockInscripcion);
      expect(result.message).toBeDefined();
      expect(result.message).toContain('inscrito');
      expect(mockInscripcionesService.inscribirse).toHaveBeenCalledWith(
        'curso-123',
        mockUser.id
      );
    });

    it('debería pasar cursoId y usuarioId correctamente al service', async () => {
      mockInscripcionesService.inscribirse.mockResolvedValue(mockInscripcion);

      await controller.inscribirse('curso-456', mockUser);

      expect(mockInscripcionesService.inscribirse).toHaveBeenCalledWith(
        'curso-456',
        'usuario-123'
      );
    });
  });

  describe('cancelarInscripcion (DELETE /cursos/:id/inscribir)', () => {
    it('debería llamar al service con cursoId y usuarioId', async () => {
      mockInscripcionesService.cancelarInscripcion.mockResolvedValue(undefined);

      await controller.cancelarInscripcion('curso-123', mockUser);

      expect(mockInscripcionesService.cancelarInscripcion).toHaveBeenCalledWith(
        'curso-123',
        mockUser.id
      );
    });

    it('debería retornar void (204 No Content)', async () => {
      mockInscripcionesService.cancelarInscripcion.mockResolvedValue(undefined);

      const result = await controller.cancelarInscripcion(
        'curso-123',
        mockUser
      );

      expect(result).toBeUndefined();
    });
  });

  describe('obtenerEstadoInscripcion (GET /cursos/:id/inscripcion)', () => {
    it('debería retornar inscrito=true si tiene inscripción activa', async () => {
      mockInscripcionesService.obtenerEstadoInscripcion.mockResolvedValue(
        mockInscripcion
      );

      const result = await controller.obtenerEstadoInscripcion(
        'curso-123',
        mockUser
      );

      expect(result.inscrito).toBe(true);
      expect(result.inscripcion).toEqual(mockInscripcion);
    });

    it('debería retornar inscrito=false si no está inscrito', async () => {
      mockInscripcionesService.obtenerEstadoInscripcion.mockResolvedValue(null);

      const result = await controller.obtenerEstadoInscripcion(
        'curso-123',
        mockUser
      );

      expect(result.inscrito).toBe(false);
      expect(result.inscripcion).toBeNull();
    });

    it('debería retornar inscrito=false si la inscripción está abandonada', async () => {
      mockInscripcionesService.obtenerEstadoInscripcion.mockResolvedValue({
        ...mockInscripcion,
        estado: 'ABANDONADO',
      });

      const result = await controller.obtenerEstadoInscripcion(
        'curso-123',
        mockUser
      );

      expect(result.inscrito).toBe(false);
    });

    it('debería pasar cursoId y usuarioId correctamente al service', async () => {
      mockInscripcionesService.obtenerEstadoInscripcion.mockResolvedValue(null);

      await controller.obtenerEstadoInscripcion('curso-789', mockUser);

      expect(
        mockInscripcionesService.obtenerEstadoInscripcion
      ).toHaveBeenCalledWith('curso-789', 'usuario-123');
    });
  });

  describe('listarMisInscripciones (GET /mis-cursos)', () => {
    const mockListaResponse = {
      inscripciones: [mockInscripcion],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    it('debería retornar lista paginada de inscripciones del usuario', async () => {
      mockInscripcionesService.listarMisInscripciones.mockResolvedValue(
        mockListaResponse
      );

      const result = await controller.listarMisInscripciones(mockUser, {
        page: 1,
        limit: 10,
      });

      expect(result.inscripciones).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('debería llamar al service con el usuarioId correcto', async () => {
      mockInscripcionesService.listarMisInscripciones.mockResolvedValue(
        mockListaResponse
      );

      const query = { page: 1, limit: 10 };
      await controller.listarMisInscripciones(mockUser, query);

      expect(
        mockInscripcionesService.listarMisInscripciones
      ).toHaveBeenCalledWith(mockUser.id, query);
    });
  });
});
