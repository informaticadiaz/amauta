/**
 * Integration Tests - CursosController
 *
 * Criterios de aceptación testeados:
 * - [ ] CRUD completo funcionando
 * - [ ] Validación de datos de entrada
 * - [ ] Solo propietario puede modificar sus cursos
 * - [ ] Paginación funcionando (limit, offset)
 * - [ ] Filtro por categoría y estado
 */

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CursosController } from './cursos.controller';
import { CursosService } from './cursos.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { RequestUser } from '../common/guards';

describe('CursosController', () => {
  let controller: CursosController;

  // Mock del servicio
  const mockCursosService = {
    listar: jest.fn(),
    listarMisCursos: jest.fn(),
    obtenerPorId: jest.fn(),
    crear: jest.fn(),
    actualizar: jest.fn(),
    cambiarEstadoPublicacion: jest.fn(),
    eliminar: jest.fn(),
  };

  // Usuario mock para tests
  const mockUser: RequestUser = {
    id: 'educador-123',
    email: 'educador@test.com',
    nombre: 'Juan',
    apellido: 'Pérez',
    rol: 'EDUCADOR',
  };

  const mockCurso = {
    id: 'curso-123',
    titulo: 'Curso de Prueba',
    descripcion: 'Descripción del curso',
    slug: 'curso-de-prueba',
    imagen: null,
    nivel: 'PRINCIPIANTE',
    estado: 'PUBLICADO',
    duracion: 60,
    idioma: 'es',
    publicadoEn: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    educador: {
      id: 'educador-123',
      nombre: 'Juan',
      apellido: 'Pérez',
      avatar: null,
    },
    categoria: {
      id: 'categoria-123',
      nombre: 'Matemáticas',
      slug: 'matematicas',
    },
    _count: {
      lecciones: 5,
      inscripciones: 10,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CursosController],
      providers: [{ provide: CursosService, useValue: mockCursosService }],
    }).compile();

    controller = module.get<CursosController>(CursosController);

    jest.clearAllMocks();
  });

  describe('GET /cursos', () => {
    it('debería retornar lista paginada de cursos', async () => {
      const mockResponse = {
        cursos: [mockCurso],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      mockCursosService.listar.mockResolvedValue(mockResponse);

      const result = await controller.listar({ page: 1, limit: 10 });

      expect(result).toEqual(mockResponse);
      expect(mockCursosService.listar).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });

    it('debería pasar filtros al servicio', async () => {
      mockCursosService.listar.mockResolvedValue({
        cursos: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      await controller.listar({
        page: 1,
        limit: 10,
        categoriaId: 'cat-123',
        nivel: 'AVANZADO',
      });

      expect(mockCursosService.listar).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        categoriaId: 'cat-123',
        nivel: 'AVANZADO',
      });
    });

    it('debería pasar parámetros de búsqueda', async () => {
      mockCursosService.listar.mockResolvedValue({
        cursos: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      await controller.listar({
        page: 1,
        limit: 10,
        buscar: 'matemáticas',
      });

      expect(mockCursosService.listar).toHaveBeenCalledWith(
        expect.objectContaining({
          buscar: 'matemáticas',
        })
      );
    });
  });

  describe('GET /cursos/mis-cursos', () => {
    it('debería retornar cursos del educador autenticado', async () => {
      const mockResponse = {
        cursos: [mockCurso],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      mockCursosService.listarMisCursos.mockResolvedValue(mockResponse);

      const result = await controller.listarMisCursos(mockUser, {
        page: 1,
        limit: 10,
      });

      expect(result).toEqual(mockResponse);
      expect(mockCursosService.listarMisCursos).toHaveBeenCalledWith(
        'educador-123',
        { page: 1, limit: 10 }
      );
    });
  });

  describe('GET /cursos/:id', () => {
    it('debería retornar un curso por ID', async () => {
      mockCursosService.obtenerPorId.mockResolvedValue(mockCurso);

      const result = await controller.obtenerPorId('curso-123');

      expect(result).toEqual({
        curso: mockCurso,
        message: 'Curso obtenido exitosamente',
      });
      expect(mockCursosService.obtenerPorId).toHaveBeenCalledWith('curso-123');
    });

    it('debería propagar NotFoundException del servicio', async () => {
      mockCursosService.obtenerPorId.mockRejectedValue(
        new NotFoundException('Curso no encontrado')
      );

      await expect(controller.obtenerPorId('inexistente')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('POST /cursos', () => {
    const createDto = {
      titulo: 'Nuevo Curso',
      descripcion: 'Descripción del nuevo curso de prueba',
      categoriaId: 'categoria-123',
      nivel: 'PRINCIPIANTE' as const,
      idioma: 'es',
    };

    it('debería crear un curso y retornar mensaje de éxito', async () => {
      mockCursosService.crear.mockResolvedValue(mockCurso);

      const result = await controller.crear(createDto, mockUser);

      expect(result).toEqual({
        curso: mockCurso,
        message: 'Curso creado exitosamente',
      });
      expect(mockCursosService.crear).toHaveBeenCalledWith(
        createDto,
        'educador-123'
      );
    });

    it('debería usar el ID del usuario autenticado', async () => {
      mockCursosService.crear.mockResolvedValue(mockCurso);

      await controller.crear(createDto, mockUser);

      expect(mockCursosService.crear).toHaveBeenCalledWith(
        createDto,
        mockUser.id
      );
    });
  });

  describe('PATCH /cursos/:id', () => {
    const updateDto = {
      titulo: 'Título Actualizado',
    };

    it('debería actualizar un curso', async () => {
      const cursoActualizado = { ...mockCurso, titulo: 'Título Actualizado' };
      mockCursosService.actualizar.mockResolvedValue(cursoActualizado);

      const result = await controller.actualizar(
        'curso-123',
        updateDto,
        mockUser
      );

      expect(result).toEqual({
        curso: cursoActualizado,
        message: 'Curso actualizado exitosamente',
      });
      expect(mockCursosService.actualizar).toHaveBeenCalledWith(
        'curso-123',
        updateDto,
        'educador-123'
      );
    });

    it('debería propagar ForbiddenException si no es propietario', async () => {
      mockCursosService.actualizar.mockRejectedValue(
        new ForbiddenException('No tienes permiso')
      );

      await expect(
        controller.actualizar('curso-123', updateDto, mockUser)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('PATCH /cursos/:id/publicar', () => {
    it('debería publicar un curso', async () => {
      const cursoPublicado = { ...mockCurso, estado: 'PUBLICADO' };
      mockCursosService.cambiarEstadoPublicacion.mockResolvedValue(
        cursoPublicado
      );

      const result = await controller.cambiarEstadoPublicacion(
        'curso-123',
        { publicar: true },
        mockUser
      );

      expect(result).toEqual({
        curso: cursoPublicado,
        message: 'Curso publicado exitosamente',
      });
    });

    it('debería despublicar un curso', async () => {
      const cursoDespublicado = { ...mockCurso, estado: 'BORRADOR' };
      mockCursosService.cambiarEstadoPublicacion.mockResolvedValue(
        cursoDespublicado
      );

      const result = await controller.cambiarEstadoPublicacion(
        'curso-123',
        { publicar: false },
        mockUser
      );

      expect(result).toEqual({
        curso: cursoDespublicado,
        message: 'Curso despublicado',
      });
    });

    it('debería propagar ForbiddenException si no es propietario', async () => {
      mockCursosService.cambiarEstadoPublicacion.mockRejectedValue(
        new ForbiddenException('No tienes permiso')
      );

      await expect(
        controller.cambiarEstadoPublicacion(
          'curso-123',
          { publicar: true },
          mockUser
        )
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('DELETE /cursos/:id', () => {
    it('debería eliminar un curso (soft delete)', async () => {
      mockCursosService.eliminar.mockResolvedValue(undefined);

      await controller.eliminar('curso-123', mockUser);

      expect(mockCursosService.eliminar).toHaveBeenCalledWith(
        'curso-123',
        'educador-123'
      );
    });

    it('debería propagar NotFoundException si el curso no existe', async () => {
      mockCursosService.eliminar.mockRejectedValue(
        new NotFoundException('Curso no encontrado')
      );

      await expect(
        controller.eliminar('inexistente', mockUser)
      ).rejects.toThrow(NotFoundException);
    });

    it('debería propagar ForbiddenException si no es propietario', async () => {
      mockCursosService.eliminar.mockRejectedValue(
        new ForbiddenException('No tienes permiso')
      );

      await expect(controller.eliminar('curso-123', mockUser)).rejects.toThrow(
        ForbiddenException
      );
    });
  });
});
