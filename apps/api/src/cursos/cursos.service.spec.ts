/**
 * Unit Tests - CursosService
 *
 * Criterios de aceptación testeados:
 * - [x] CRUD completo funcionando
 * - [x] Validación de datos de entrada
 * - [x] Solo propietario puede modificar sus cursos
 * - [x] Paginación funcionando (limit, offset)
 * - [x] Filtro por categoría y estado
 */

// Mock @prisma/client ANTES de cualquier import que lo use
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
  Rol: {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN_ESCUELA: 'ADMIN_ESCUELA',
    EDUCADOR: 'EDUCADOR',
    ESTUDIANTE: 'ESTUDIANTE',
  },
  Nivel: {
    PRINCIPIANTE: 'PRINCIPIANTE',
    INTERMEDIO: 'INTERMEDIO',
    AVANZADO: 'AVANZADO',
  },
  EstadoCurso: {
    BORRADOR: 'BORRADOR',
    REVISION: 'REVISION',
    PUBLICADO: 'PUBLICADO',
    ARCHIVADO: 'ARCHIVADO',
  },
}));

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CursosService } from './cursos.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CursosService', () => {
  let service: CursosService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;

  // Mock de Prisma
  const mockPrisma = {
    curso: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    categoria: {
      findUnique: jest.fn(),
    },
  };

  // Datos de prueba
  const mockEducador = {
    id: 'educador-123',
    nombre: 'Juan',
    apellido: 'Pérez',
    avatar: null,
  };

  const mockCategoria = {
    id: 'categoria-123',
    nombre: 'Matemáticas',
    slug: 'matematicas',
  };

  const mockCurso = {
    id: 'curso-123',
    titulo: 'Curso de Prueba',
    descripcion: 'Descripción del curso de prueba',
    slug: 'curso-de-prueba',
    imagen: null,
    nivel: 'PRINCIPIANTE',
    estado: 'BORRADOR',
    duracion: 60,
    idioma: 'es',
    publicadoEn: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    educadorId: 'educador-123',
    categoriaId: 'categoria-123',
    educador: mockEducador,
    categoria: mockCategoria,
    _count: {
      lecciones: 5,
      inscripciones: 10,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CursosService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CursosService>(CursosService);
    prisma = module.get(PrismaService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('crear', () => {
    const createCursoDto = {
      titulo: 'Nuevo Curso',
      descripcion: 'Descripción del nuevo curso de prueba',
      categoriaId: 'categoria-123',
      nivel: 'PRINCIPIANTE' as const,
      idioma: 'es',
    };

    it('debería crear un curso con datos válidos', async () => {
      prisma.categoria.findUnique.mockResolvedValue(mockCategoria);
      prisma.curso.findUnique.mockResolvedValue(null); // No existe slug
      prisma.curso.create.mockResolvedValue({
        ...mockCurso,
        titulo: createCursoDto.titulo,
        descripcion: createCursoDto.descripcion,
      });

      const result = await service.crear(createCursoDto, 'educador-123');

      expect(result.titulo).toBe(createCursoDto.titulo);
      expect(prisma.curso.create).toHaveBeenCalled();
    });

    it('debería generar un slug único automáticamente', async () => {
      prisma.categoria.findUnique.mockResolvedValue(mockCategoria);
      prisma.curso.findUnique.mockResolvedValue(null);
      prisma.curso.create.mockResolvedValue(mockCurso);

      await service.crear(createCursoDto, 'educador-123');

      expect(prisma.curso.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            slug: expect.any(String),
          }),
        })
      );
    });

    it('debería lanzar BadRequestException si la categoría no existe', async () => {
      prisma.categoria.findUnique.mockResolvedValue(null);

      await expect(
        service.crear(createCursoDto, 'educador-123')
      ).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar BadRequestException con título muy corto', async () => {
      const dtoInvalido = { ...createCursoDto, titulo: 'AB' };

      await expect(service.crear(dtoInvalido, 'educador-123')).rejects.toThrow(
        BadRequestException
      );
    });

    it('debería lanzar BadRequestException con descripción muy corta', async () => {
      const dtoInvalido = { ...createCursoDto, descripcion: 'Corta' };

      await expect(service.crear(dtoInvalido, 'educador-123')).rejects.toThrow(
        BadRequestException
      );
    });

    it('debería lanzar BadRequestException con nivel inválido', async () => {
      const dtoInvalido = { ...createCursoDto, nivel: 'INVALIDO' as never };

      await expect(service.crear(dtoInvalido, 'educador-123')).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('listar', () => {
    it('debería retornar lista paginada de cursos publicados', async () => {
      prisma.curso.findMany.mockResolvedValue([mockCurso]);
      prisma.curso.count.mockResolvedValue(1);

      const result = await service.listar({ page: 1, limit: 10 });

      expect(result.cursos).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('debería aplicar paginación correctamente', async () => {
      prisma.curso.findMany.mockResolvedValue([]);
      prisma.curso.count.mockResolvedValue(25);

      const result = await service.listar({ page: 2, limit: 10 });

      expect(result.page).toBe(2);
      expect(result.totalPages).toBe(3);
      expect(prisma.curso.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10, // (page - 1) * limit = (2 - 1) * 10 = 10
          take: 10,
        })
      );
    });

    it('debería filtrar por categoría cuando se proporciona', async () => {
      prisma.curso.findMany.mockResolvedValue([]);
      prisma.curso.count.mockResolvedValue(0);

      await service.listar({
        page: 1,
        limit: 10,
        categoriaId: 'categoria-123',
      });

      expect(prisma.curso.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoriaId: 'categoria-123',
          }),
        })
      );
    });

    it('debería filtrar por nivel cuando se proporciona', async () => {
      prisma.curso.findMany.mockResolvedValue([]);
      prisma.curso.count.mockResolvedValue(0);

      await service.listar({ page: 1, limit: 10, nivel: 'AVANZADO' });

      expect(prisma.curso.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            nivel: 'AVANZADO',
          }),
        })
      );
    });

    it('debería filtrar por estado cuando se proporciona', async () => {
      prisma.curso.findMany.mockResolvedValue([]);
      prisma.curso.count.mockResolvedValue(0);

      await service.listar({ page: 1, limit: 10, estado: 'BORRADOR' });

      expect(prisma.curso.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            estado: 'BORRADOR',
          }),
        })
      );
    });

    it('debería buscar por texto en título y descripción', async () => {
      prisma.curso.findMany.mockResolvedValue([]);
      prisma.curso.count.mockResolvedValue(0);

      await service.listar({ page: 1, limit: 10, buscar: 'matemáticas' });

      expect(prisma.curso.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                titulo: { contains: 'matemáticas', mode: 'insensitive' },
              }),
              expect.objectContaining({
                descripcion: { contains: 'matemáticas', mode: 'insensitive' },
              }),
            ]),
          }),
        })
      );
    });

    it('debería ordenar por campo especificado', async () => {
      prisma.curso.findMany.mockResolvedValue([]);
      prisma.curso.count.mockResolvedValue(0);

      await service.listar({
        page: 1,
        limit: 10,
        ordenarPor: 'titulo',
        orden: 'asc',
      });

      expect(prisma.curso.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { titulo: 'asc' },
        })
      );
    });
  });

  describe('listarMisCursos', () => {
    it('debería retornar solo los cursos del educador', async () => {
      prisma.curso.findMany.mockResolvedValue([mockCurso]);
      prisma.curso.count.mockResolvedValue(1);

      const result = await service.listarMisCursos('educador-123', {
        page: 1,
        limit: 10,
      });

      expect(prisma.curso.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            educadorId: 'educador-123',
          }),
        })
      );
      expect(result.cursos).toHaveLength(1);
    });

    it('debería incluir cursos en cualquier estado para el educador', async () => {
      prisma.curso.findMany.mockResolvedValue([]);
      prisma.curso.count.mockResolvedValue(0);

      await service.listarMisCursos('educador-123', { page: 1, limit: 10 });

      // Verificar que se filtra por educadorId
      const call = prisma.curso.findMany.mock.calls[0][0];
      expect(call.where.educadorId).toBe('educador-123');
    });
  });

  describe('obtenerPorId', () => {
    it('debería retornar un curso por ID', async () => {
      prisma.curso.findUnique.mockResolvedValue(mockCurso);

      const result = await service.obtenerPorId('curso-123');

      expect(result).toEqual(mockCurso);
      expect(prisma.curso.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'curso-123' },
        })
      );
    });

    it('debería lanzar NotFoundException si el curso no existe', async () => {
      prisma.curso.findUnique.mockResolvedValue(null);

      await expect(service.obtenerPorId('inexistente')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('obtenerPorSlug', () => {
    it('debería retornar un curso por slug', async () => {
      prisma.curso.findUnique.mockResolvedValue(mockCurso);

      const result = await service.obtenerPorSlug('curso-de-prueba');

      expect(result).toEqual(mockCurso);
      expect(prisma.curso.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { slug: 'curso-de-prueba' },
        })
      );
    });

    it('debería lanzar NotFoundException si el slug no existe', async () => {
      prisma.curso.findUnique.mockResolvedValue(null);

      await expect(service.obtenerPorSlug('slug-inexistente')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('actualizar', () => {
    const updateCursoDto = {
      titulo: 'Título Actualizado',
      descripcion: 'Descripción actualizada del curso',
    };

    it('debería actualizar un curso con datos válidos', async () => {
      prisma.curso.findUnique.mockResolvedValue({
        educadorId: 'educador-123',
        titulo: 'Título Original',
        slug: 'titulo-original',
      });
      prisma.curso.update.mockResolvedValue({
        ...mockCurso,
        ...updateCursoDto,
      });

      const result = await service.actualizar(
        'curso-123',
        updateCursoDto,
        'educador-123'
      );

      expect(result.titulo).toBe(updateCursoDto.titulo);
      expect(prisma.curso.update).toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si el curso no existe', async () => {
      prisma.curso.findUnique.mockResolvedValue(null);

      await expect(
        service.actualizar('inexistente', updateCursoDto, 'educador-123')
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar ForbiddenException si no es el propietario', async () => {
      prisma.curso.findUnique.mockResolvedValue({
        educadorId: 'otro-educador',
        titulo: 'Título Original',
        slug: 'titulo-original',
      });

      await expect(
        service.actualizar('curso-123', updateCursoDto, 'educador-123')
      ).rejects.toThrow(ForbiddenException);
    });

    it('debería regenerar slug si cambia el título', async () => {
      prisma.curso.findUnique
        .mockResolvedValueOnce({
          educadorId: 'educador-123',
          titulo: 'Título Original',
          slug: 'titulo-original',
        })
        .mockResolvedValueOnce(null); // Nuevo slug no existe
      prisma.curso.update.mockResolvedValue({
        ...mockCurso,
        titulo: 'Nuevo Título',
        slug: 'nuevo-titulo',
      });

      await service.actualizar(
        'curso-123',
        { titulo: 'Nuevo Título' },
        'educador-123'
      );

      expect(prisma.curso.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            titulo: 'Nuevo Título',
            slug: expect.any(String),
          }),
        })
      );
    });
  });

  describe('cambiarEstadoPublicacion', () => {
    it('debería publicar un curso', async () => {
      prisma.curso.findUnique.mockResolvedValue({
        educadorId: 'educador-123',
        estado: 'BORRADOR',
      });
      prisma.curso.update.mockResolvedValue({
        ...mockCurso,
        estado: 'PUBLICADO',
        publicadoEn: new Date(),
      });

      const result = await service.cambiarEstadoPublicacion(
        'curso-123',
        { publicar: true },
        'educador-123'
      );

      expect(result.estado).toBe('PUBLICADO');
      expect(prisma.curso.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            estado: 'PUBLICADO',
            publicadoEn: expect.any(Date),
          }),
        })
      );
    });

    it('debería despublicar un curso', async () => {
      prisma.curso.findUnique.mockResolvedValue({
        educadorId: 'educador-123',
        estado: 'PUBLICADO',
      });
      prisma.curso.update.mockResolvedValue({
        ...mockCurso,
        estado: 'BORRADOR',
        publicadoEn: null,
      });

      const result = await service.cambiarEstadoPublicacion(
        'curso-123',
        { publicar: false },
        'educador-123'
      );

      expect(result.estado).toBe('BORRADOR');
      expect(prisma.curso.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            estado: 'BORRADOR',
            publicadoEn: null,
          }),
        })
      );
    });

    it('debería lanzar ForbiddenException si no es el propietario', async () => {
      prisma.curso.findUnique.mockResolvedValue({
        educadorId: 'otro-educador',
        estado: 'BORRADOR',
      });

      await expect(
        service.cambiarEstadoPublicacion(
          'curso-123',
          { publicar: true },
          'educador-123'
        )
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('eliminar', () => {
    it('debería hacer soft delete (cambiar a ARCHIVADO)', async () => {
      prisma.curso.findUnique.mockResolvedValue({
        educadorId: 'educador-123',
      });
      prisma.curso.update.mockResolvedValue({
        ...mockCurso,
        estado: 'ARCHIVADO',
      });

      await service.eliminar('curso-123', 'educador-123');

      expect(prisma.curso.update).toHaveBeenCalledWith({
        where: { id: 'curso-123' },
        data: { estado: 'ARCHIVADO' },
      });
    });

    it('debería lanzar NotFoundException si el curso no existe', async () => {
      prisma.curso.findUnique.mockResolvedValue(null);

      await expect(
        service.eliminar('inexistente', 'educador-123')
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar ForbiddenException si no es el propietario', async () => {
      prisma.curso.findUnique.mockResolvedValue({
        educadorId: 'otro-educador',
      });

      await expect(
        service.eliminar('curso-123', 'educador-123')
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
