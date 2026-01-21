/**
 * Integration Tests - LeccionesController
 *
 * Criterios de aceptación testeados:
 * - [x] CRUD completo funcionando
 * - [x] Solo propietario puede modificar lecciones
 * - [x] Reordenamiento de lecciones
 * - [x] Manejo correcto de errores
 */

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { LeccionesController } from './lecciones.controller';
import { LeccionesService } from './lecciones.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { RequestUser } from '../common/guards';

describe('LeccionesController', () => {
  let controller: LeccionesController;

  // Mock del servicio
  const mockLeccionesService = {
    listarPorCurso: jest.fn(),
    obtenerPorId: jest.fn(),
    crear: jest.fn(),
    actualizar: jest.fn(),
    eliminar: jest.fn(),
    reordenar: jest.fn(),
  };

  // Usuario mock para tests
  const mockUser: RequestUser = {
    id: 'educador-123',
    email: 'educador@test.com',
    nombre: 'Juan',
    apellido: 'Pérez',
    rol: 'EDUCADOR',
  };

  const mockLeccion = {
    id: 'leccion-123',
    titulo: 'Lección de Prueba',
    descripcion: 'Descripción de la lección',
    orden: 0,
    tipo: 'TEXTO',
    duracion: 15,
    contenido: { texto: 'Contenido de prueba' },
    publicada: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    cursoId: 'curso-123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeccionesController],
      providers: [
        { provide: LeccionesService, useValue: mockLeccionesService },
      ],
    }).compile();

    controller = module.get<LeccionesController>(LeccionesController);

    jest.clearAllMocks();
  });

  describe('GET /cursos/:cursoId/lecciones', () => {
    it('debería retornar lista de lecciones del curso', async () => {
      mockLeccionesService.listarPorCurso.mockResolvedValue([mockLeccion]);

      const result = await controller.listar('curso-123', {});

      expect(result).toEqual({
        lecciones: [mockLeccion],
        total: 1,
      });
      expect(mockLeccionesService.listarPorCurso).toHaveBeenCalledWith(
        'curso-123',
        undefined
      );
    });

    it('debería filtrar solo publicadas cuando se indica', async () => {
      mockLeccionesService.listarPorCurso.mockResolvedValue([]);

      await controller.listar('curso-123', { publicadas: true });

      expect(mockLeccionesService.listarPorCurso).toHaveBeenCalledWith(
        'curso-123',
        true
      );
    });

    it('debería retornar lista vacía si no hay lecciones', async () => {
      mockLeccionesService.listarPorCurso.mockResolvedValue([]);

      const result = await controller.listar('curso-123', {});

      expect(result).toEqual({
        lecciones: [],
        total: 0,
      });
    });
  });

  describe('GET /lecciones/:id', () => {
    it('debería retornar una lección por ID', async () => {
      mockLeccionesService.obtenerPorId.mockResolvedValue(mockLeccion);

      const result = await controller.obtenerPorId('leccion-123');

      expect(result).toEqual({
        leccion: mockLeccion,
        message: 'Lección obtenida exitosamente',
      });
      expect(mockLeccionesService.obtenerPorId).toHaveBeenCalledWith(
        'leccion-123'
      );
    });

    it('debería propagar NotFoundException del servicio', async () => {
      mockLeccionesService.obtenerPorId.mockRejectedValue(
        new NotFoundException('Lección no encontrada')
      );

      await expect(controller.obtenerPorId('inexistente')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('POST /cursos/:cursoId/lecciones', () => {
    const createDto = {
      titulo: 'Nueva Lección',
      descripcion: 'Descripción de la nueva lección',
      tipo: 'TEXTO' as const,
      contenido: { texto: 'Contenido de la lección' },
      publicada: false,
    };

    it('debería crear una lección y retornar mensaje de éxito', async () => {
      mockLeccionesService.crear.mockResolvedValue(mockLeccion);

      const result = await controller.crear('curso-123', createDto, mockUser);

      expect(result).toEqual({
        leccion: mockLeccion,
        message: 'Lección creada exitosamente',
      });
      expect(mockLeccionesService.crear).toHaveBeenCalledWith(
        'curso-123',
        createDto,
        'educador-123'
      );
    });

    it('debería usar el ID del usuario autenticado', async () => {
      mockLeccionesService.crear.mockResolvedValue(mockLeccion);

      await controller.crear('curso-123', createDto, mockUser);

      expect(mockLeccionesService.crear).toHaveBeenCalledWith(
        'curso-123',
        createDto,
        mockUser.id
      );
    });

    it('debería propagar ForbiddenException si no es propietario', async () => {
      mockLeccionesService.crear.mockRejectedValue(
        new ForbiddenException('No tienes permiso')
      );

      await expect(
        controller.crear('curso-123', createDto, mockUser)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('PATCH /lecciones/:id', () => {
    const updateDto = {
      titulo: 'Título Actualizado',
    };

    it('debería actualizar una lección', async () => {
      const leccionActualizada = {
        ...mockLeccion,
        titulo: 'Título Actualizado',
      };
      mockLeccionesService.actualizar.mockResolvedValue(leccionActualizada);

      const result = await controller.actualizar(
        'leccion-123',
        updateDto,
        mockUser
      );

      expect(result).toEqual({
        leccion: leccionActualizada,
        message: 'Lección actualizada exitosamente',
      });
      expect(mockLeccionesService.actualizar).toHaveBeenCalledWith(
        'leccion-123',
        updateDto,
        'educador-123'
      );
    });

    it('debería propagar ForbiddenException si no es propietario', async () => {
      mockLeccionesService.actualizar.mockRejectedValue(
        new ForbiddenException('No tienes permiso')
      );

      await expect(
        controller.actualizar('leccion-123', updateDto, mockUser)
      ).rejects.toThrow(ForbiddenException);
    });

    it('debería propagar NotFoundException si la lección no existe', async () => {
      mockLeccionesService.actualizar.mockRejectedValue(
        new NotFoundException('Lección no encontrada')
      );

      await expect(
        controller.actualizar('inexistente', updateDto, mockUser)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('DELETE /lecciones/:id', () => {
    it('debería eliminar una lección', async () => {
      mockLeccionesService.eliminar.mockResolvedValue(undefined);

      await controller.eliminar('leccion-123', mockUser);

      expect(mockLeccionesService.eliminar).toHaveBeenCalledWith(
        'leccion-123',
        'educador-123'
      );
    });

    it('debería propagar NotFoundException si la lección no existe', async () => {
      mockLeccionesService.eliminar.mockRejectedValue(
        new NotFoundException('Lección no encontrada')
      );

      await expect(
        controller.eliminar('inexistente', mockUser)
      ).rejects.toThrow(NotFoundException);
    });

    it('debería propagar ForbiddenException si no es propietario', async () => {
      mockLeccionesService.eliminar.mockRejectedValue(
        new ForbiddenException('No tienes permiso')
      );

      await expect(
        controller.eliminar('leccion-123', mockUser)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('PATCH /cursos/:cursoId/lecciones/reordenar', () => {
    const reordenarDto = {
      lecciones: [
        { id: 'leccion-1', orden: 0 },
        { id: 'leccion-2', orden: 1 },
        { id: 'leccion-3', orden: 2 },
      ],
    };

    it('debería reordenar las lecciones', async () => {
      const leccionesReordenadas = [
        { ...mockLeccion, id: 'leccion-1', orden: 0 },
        { ...mockLeccion, id: 'leccion-2', orden: 1 },
        { ...mockLeccion, id: 'leccion-3', orden: 2 },
      ];
      mockLeccionesService.reordenar.mockResolvedValue(leccionesReordenadas);

      const result = await controller.reordenar(
        'curso-123',
        reordenarDto,
        mockUser
      );

      expect(result).toEqual({
        lecciones: leccionesReordenadas,
        total: 3,
      });
      expect(mockLeccionesService.reordenar).toHaveBeenCalledWith(
        'curso-123',
        reordenarDto,
        'educador-123'
      );
    });

    it('debería propagar ForbiddenException si no es propietario', async () => {
      mockLeccionesService.reordenar.mockRejectedValue(
        new ForbiddenException('No tienes permiso')
      );

      await expect(
        controller.reordenar('curso-123', reordenarDto, mockUser)
      ).rejects.toThrow(ForbiddenException);
    });

    it('debería propagar NotFoundException si el curso no existe', async () => {
      mockLeccionesService.reordenar.mockRejectedValue(
        new NotFoundException('Curso no encontrado')
      );

      await expect(
        controller.reordenar('inexistente', reordenarDto, mockUser)
      ).rejects.toThrow(NotFoundException);
    });
  });
});
