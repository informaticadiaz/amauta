/**
 * Unit Tests - LeccionesService
 *
 * Criterios de aceptación testeados:
 * - [x] CRUD completo funcionando
 * - [x] Ordenamiento automático al crear
 * - [x] Reordenamiento funciona correctamente
 * - [x] Solo propietario del curso puede modificar
 * - [x] Validación de datos de entrada
 */

// Mock @prisma/client ANTES de cualquier import que lo use
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
  TipoLeccion: {
    VIDEO: 'VIDEO',
    TEXTO: 'TEXTO',
    QUIZ: 'QUIZ',
    INTERACTIVO: 'INTERACTIVO',
    DESCARGABLE: 'DESCARGABLE',
  },
}));

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { LeccionesService } from './lecciones.service';
import { PrismaService } from '../prisma/prisma.service';

describe('LeccionesService', () => {
  let service: LeccionesService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;

  // Mock de Prisma
  const mockPrisma = {
    leccion: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    curso: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  // Datos de prueba
  const mockCurso = {
    id: 'curso-123',
    educadorId: 'educador-123',
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
    estado: 'ACTIVO',
    createdAt: new Date(),
    updatedAt: new Date(),
    cursoId: 'curso-123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeccionesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<LeccionesService>(LeccionesService);
    prisma = module.get(PrismaService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('crear', () => {
    const createLeccionDto = {
      titulo: 'Nueva Lección',
      descripcion: 'Descripción de la nueva lección',
      tipo: 'TEXTO' as const,
      contenido: { texto: 'Contenido de la lección' },
      publicada: false,
    };

    it('debería crear una lección con datos válidos', async () => {
      prisma.curso.findUnique.mockResolvedValue(mockCurso);
      prisma.leccion.findFirst.mockResolvedValue(null); // No hay lecciones previas
      prisma.leccion.create.mockResolvedValue({
        ...mockLeccion,
        titulo: createLeccionDto.titulo,
      });

      const result = await service.crear(
        'curso-123',
        createLeccionDto,
        'educador-123'
      );

      expect(result.titulo).toBe(createLeccionDto.titulo);
      expect(prisma.leccion.create).toHaveBeenCalled();
    });

    it('debería asignar orden 0 a la primera lección', async () => {
      prisma.curso.findUnique.mockResolvedValue(mockCurso);
      prisma.leccion.findFirst.mockResolvedValue(null);
      prisma.leccion.create.mockResolvedValue({ ...mockLeccion, orden: 0 });

      await service.crear('curso-123', createLeccionDto, 'educador-123');

      expect(prisma.leccion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            orden: 0,
          }),
        })
      );
    });

    it('debería asignar orden correcto a lecciones subsecuentes', async () => {
      prisma.curso.findUnique.mockResolvedValue(mockCurso);
      prisma.leccion.findFirst.mockResolvedValue({ orden: 2 }); // Ya hay 3 lecciones (0, 1, 2)
      prisma.leccion.create.mockResolvedValue({ ...mockLeccion, orden: 3 });

      await service.crear('curso-123', createLeccionDto, 'educador-123');

      expect(prisma.leccion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            orden: 3,
          }),
        })
      );
    });

    it('debería lanzar NotFoundException si el curso no existe', async () => {
      prisma.curso.findUnique.mockResolvedValue(null);

      await expect(
        service.crear('curso-inexistente', createLeccionDto, 'educador-123')
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar ForbiddenException si no es propietario del curso', async () => {
      prisma.curso.findUnique.mockResolvedValue({
        ...mockCurso,
        educadorId: 'otro-educador',
      });

      await expect(
        service.crear('curso-123', createLeccionDto, 'educador-123')
      ).rejects.toThrow(ForbiddenException);
    });

    it('debería lanzar BadRequestException con título muy corto', async () => {
      const dtoInvalido = { ...createLeccionDto, titulo: 'AB' };

      await expect(
        service.crear('curso-123', dtoInvalido, 'educador-123')
      ).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar BadRequestException con tipo inválido', async () => {
      const dtoInvalido = { ...createLeccionDto, tipo: 'INVALIDO' as never };

      await expect(
        service.crear('curso-123', dtoInvalido, 'educador-123')
      ).rejects.toThrow(BadRequestException);
    });

    it('debería crear una lección VIDEO con media subida (storageKey, mimeType y size) sin perder datos', async () => {
      const dtoVideoSubido = {
        titulo: 'Lección con video subido',
        tipo: 'VIDEO' as const,
        contenido: {
          videoUrl: 'https://media.amauta.test/amauta-media/lecciones/abc.mp4',
          provider: 'local',
          storageKey: 'lecciones/abc.mp4',
          mimeType: 'video/mp4',
          size: 1024,
        },
        publicada: false,
      };

      prisma.curso.findUnique.mockResolvedValue(mockCurso);
      prisma.leccion.findFirst.mockResolvedValue(null);
      prisma.leccion.create.mockResolvedValue({
        ...mockLeccion,
        tipo: 'VIDEO',
        contenido: dtoVideoSubido.contenido,
      });

      await service.crear('curso-123', dtoVideoSubido, 'educador-123');

      expect(prisma.leccion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            contenido: expect.objectContaining({
              storageKey: 'lecciones/abc.mp4',
              mimeType: 'video/mp4',
              size: 1024,
            }),
          }),
        })
      );
    });

    it('debería crear una lección VIDEO de audio (mimeType audio/*) con media subida', async () => {
      const dtoAudioSubido = {
        titulo: 'Lección con audio subido',
        tipo: 'VIDEO' as const,
        contenido: {
          videoUrl:
            'https://media.amauta.test/amauta-media/lecciones/audio.mp3',
          provider: 'local',
          storageKey: 'lecciones/audio.mp3',
          mimeType: 'audio/mpeg',
          size: 2048,
        },
        publicada: false,
      };

      prisma.curso.findUnique.mockResolvedValue(mockCurso);
      prisma.leccion.findFirst.mockResolvedValue(null);
      prisma.leccion.create.mockResolvedValue({
        ...mockLeccion,
        tipo: 'VIDEO',
        contenido: dtoAudioSubido.contenido,
      });

      await service.crear('curso-123', dtoAudioSubido, 'educador-123');

      expect(prisma.leccion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            contenido: expect.objectContaining({
              mimeType: 'audio/mpeg',
            }),
          }),
        })
      );
    });

    it('debería crear una lección INTERACTIVO con h5pUrl de dominio permitido', async () => {
      const dtoH5P = {
        titulo: 'Lección interactiva',
        tipo: 'INTERACTIVO' as const,
        contenido: {
          h5pUrl: 'https://h5p.org/h5p/embed/123456',
          embedType: 'iframe' as const,
          title: 'Quiz sobre el sistema solar',
        },
        publicada: false,
      };

      prisma.curso.findUnique.mockResolvedValue(mockCurso);
      prisma.leccion.findFirst.mockResolvedValue(null);
      prisma.leccion.create.mockResolvedValue({
        ...mockLeccion,
        tipo: 'INTERACTIVO',
        contenido: dtoH5P.contenido,
      });

      const result = await service.crear('curso-123', dtoH5P, 'educador-123');

      expect(result.tipo).toBe('INTERACTIVO');
      expect(prisma.leccion.create).toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si el dominio de h5pUrl no está en la whitelist', async () => {
      const dtoH5PInvalido = {
        titulo: 'Lección interactiva',
        tipo: 'INTERACTIVO' as const,
        contenido: {
          h5pUrl: 'https://malicious-site.com/embed/123',
          embedType: 'iframe' as const,
        },
        publicada: false,
      };

      await expect(
        service.crear('curso-123', dtoH5PInvalido, 'educador-123')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('listarPorCurso', () => {
    it('debería retornar lista de lecciones ordenadas', async () => {
      prisma.curso.findUnique.mockResolvedValue(mockCurso);
      prisma.leccion.findMany.mockResolvedValue([
        { ...mockLeccion, orden: 0 },
        { ...mockLeccion, id: 'leccion-2', orden: 1 },
      ]);

      const result = await service.listarPorCurso('curso-123');

      expect(result).toHaveLength(2);
      expect(prisma.leccion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { orden: 'asc' },
        })
      );
    });

    it('debería filtrar solo publicadas cuando se indica', async () => {
      prisma.curso.findUnique.mockResolvedValue(mockCurso);
      prisma.leccion.findMany.mockResolvedValue([]);

      await service.listarPorCurso('curso-123', true);

      expect(prisma.leccion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            publicada: true,
          }),
        })
      );
    });

    it('debería excluir lecciones archivadas del listado', async () => {
      prisma.curso.findUnique.mockResolvedValue(mockCurso);
      prisma.leccion.findMany.mockResolvedValue([
        { ...mockLeccion, id: 'leccion-1', estado: 'ACTIVO' },
        { ...mockLeccion, id: 'leccion-2', estado: 'ACTIVO' },
      ]);

      const result = await service.listarPorCurso('curso-123');

      expect(prisma.leccion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            estado: { not: 'ARCHIVADO' },
          }),
        })
      );
      expect(result).toHaveLength(2);
      expect(result.every((l) => l.estado === 'ACTIVO')).toBe(true);
    });

    it('debería lanzar NotFoundException si el curso no existe', async () => {
      prisma.curso.findUnique.mockResolvedValue(null);

      await expect(service.listarPorCurso('curso-inexistente')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('obtenerPorId', () => {
    it('debería retornar una lección por ID', async () => {
      prisma.leccion.findUnique.mockResolvedValue(mockLeccion);

      const result = await service.obtenerPorId('leccion-123');

      expect(result).toEqual(mockLeccion);
      expect(prisma.leccion.findUnique).toHaveBeenCalledWith({
        where: { id: 'leccion-123' },
      });
    });

    it('debería lanzar NotFoundException si la lección no existe', async () => {
      prisma.leccion.findUnique.mockResolvedValue(null);

      await expect(service.obtenerPorId('leccion-inexistente')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('actualizar', () => {
    const updateLeccionDto = {
      titulo: 'Título Actualizado',
      descripcion: 'Descripción actualizada',
    };

    it('debería actualizar una lección con datos válidos', async () => {
      prisma.leccion.findUnique.mockResolvedValue({
        ...mockLeccion,
        curso: { educadorId: 'educador-123' },
      });
      prisma.leccion.update.mockResolvedValue({
        ...mockLeccion,
        ...updateLeccionDto,
      });

      const result = await service.actualizar(
        'leccion-123',
        updateLeccionDto,
        'educador-123'
      );

      expect(result.titulo).toBe(updateLeccionDto.titulo);
      expect(prisma.leccion.update).toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si la lección no existe', async () => {
      prisma.leccion.findUnique.mockResolvedValue(null);

      await expect(
        service.actualizar(
          'leccion-inexistente',
          updateLeccionDto,
          'educador-123'
        )
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar ForbiddenException si no es propietario del curso', async () => {
      prisma.leccion.findUnique.mockResolvedValue({
        ...mockLeccion,
        curso: { educadorId: 'otro-educador' },
      });

      await expect(
        service.actualizar('leccion-123', updateLeccionDto, 'educador-123')
      ).rejects.toThrow(ForbiddenException);
    });

    it('debería lanzar BadRequestException al actualizar contenido H5P con dominio fuera de la whitelist', async () => {
      prisma.leccion.findUnique.mockResolvedValue({
        ...mockLeccion,
        tipo: 'INTERACTIVO',
        curso: { educadorId: 'educador-123' },
      });

      const updateH5PInvalido = {
        contenido: {
          h5pUrl: 'https://malicious-site.com/embed/123',
          embedType: 'iframe' as const,
        },
      };

      await expect(
        service.actualizar('leccion-123', updateH5PInvalido, 'educador-123')
      ).rejects.toThrow(BadRequestException);
    });

    it('debería actualizar parcialmente (solo campos proporcionados)', async () => {
      prisma.leccion.findUnique.mockResolvedValue({
        ...mockLeccion,
        curso: { educadorId: 'educador-123' },
      });
      prisma.leccion.update.mockResolvedValue({
        ...mockLeccion,
        titulo: 'Nuevo Título',
      });

      await service.actualizar(
        'leccion-123',
        { titulo: 'Nuevo Título' },
        'educador-123'
      );

      expect(prisma.leccion.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            titulo: 'Nuevo Título',
          }),
        })
      );
    });
  });

  describe('eliminar', () => {
    it('debería hacer soft delete (marcar como ARCHIVADO)', async () => {
      prisma.leccion.findUnique.mockResolvedValue({
        ...mockLeccion,
        curso: { educadorId: 'educador-123' },
      });
      prisma.leccion.update.mockResolvedValue({
        ...mockLeccion,
        estado: 'ARCHIVADO',
      });
      prisma.leccion.findMany.mockResolvedValue([]); // Sin lecciones activas para reordenar
      prisma.$transaction.mockResolvedValue([]);

      await service.eliminar('leccion-123', 'educador-123');

      expect(prisma.leccion.update).toHaveBeenCalledWith({
        where: { id: 'leccion-123' },
        data: { estado: 'ARCHIVADO' },
      });
    });

    it('debería reordenar lecciones activas (excluyendo archivadas) después de eliminar', async () => {
      const leccionesActivas = [
        { ...mockLeccion, id: 'leccion-2', orden: 1 },
        { ...mockLeccion, id: 'leccion-3', orden: 2 },
      ];

      prisma.leccion.findUnique.mockResolvedValue({
        ...mockLeccion,
        orden: 0,
        curso: { educadorId: 'educador-123' },
      });
      prisma.leccion.update.mockResolvedValue({
        ...mockLeccion,
        estado: 'ARCHIVADO',
      });
      prisma.leccion.findMany.mockResolvedValue(leccionesActivas);
      prisma.$transaction.mockResolvedValue([]);

      await service.eliminar('leccion-123', 'educador-123');

      expect(prisma.leccion.findMany).toHaveBeenCalledWith({
        where: {
          cursoId: 'curso-123',
          estado: { not: 'ARCHIVADO' },
        },
        orderBy: { orden: 'asc' },
      });
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si la lección no existe', async () => {
      prisma.leccion.findUnique.mockResolvedValue(null);

      await expect(
        service.eliminar('leccion-inexistente', 'educador-123')
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar ForbiddenException si no es propietario', async () => {
      prisma.leccion.findUnique.mockResolvedValue({
        ...mockLeccion,
        curso: { educadorId: 'otro-educador' },
      });

      await expect(
        service.eliminar('leccion-123', 'educador-123')
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('reordenar', () => {
    // Usar CUIDs válidos para los tests
    const leccionId1 = 'clxxxxxxxxxxxxxxxxxx001';
    const leccionId2 = 'clxxxxxxxxxxxxxxxxxx002';
    const leccionId3 = 'clxxxxxxxxxxxxxxxxxx003';

    const reordenarDto = {
      lecciones: [
        { id: leccionId1, orden: 0 },
        { id: leccionId2, orden: 1 },
        { id: leccionId3, orden: 2 },
      ],
    };

    it('debería reordenar lecciones correctamente', async () => {
      prisma.curso.findUnique.mockResolvedValue(mockCurso);
      prisma.leccion.findMany.mockResolvedValue([
        { id: leccionId1 },
        { id: leccionId2 },
        { id: leccionId3 },
      ]);
      prisma.$transaction.mockResolvedValue([]);
      // Mock para listarPorCurso al final
      prisma.leccion.findMany.mockResolvedValue([
        { ...mockLeccion, id: leccionId1, orden: 0 },
        { ...mockLeccion, id: leccionId2, orden: 1 },
        { ...mockLeccion, id: leccionId3, orden: 2 },
      ]);

      const result = await service.reordenar(
        'curso-123',
        reordenarDto,
        'educador-123'
      );

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toHaveLength(3);
    });

    it('debería lanzar NotFoundException si el curso no existe', async () => {
      prisma.curso.findUnique.mockResolvedValue(null);

      await expect(
        service.reordenar('curso-inexistente', reordenarDto, 'educador-123')
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar ForbiddenException si no es propietario', async () => {
      prisma.curso.findUnique.mockResolvedValue({
        ...mockCurso,
        educadorId: 'otro-educador',
      });

      await expect(
        service.reordenar('curso-123', reordenarDto, 'educador-123')
      ).rejects.toThrow(ForbiddenException);
    });

    it('debería lanzar BadRequestException si lección no pertenece al curso', async () => {
      prisma.curso.findUnique.mockResolvedValue(mockCurso);
      prisma.leccion.findMany.mockResolvedValue([
        { id: leccionId1 },
        { id: leccionId2 },
        // leccionId3 no existe en el curso
      ]);

      await expect(
        service.reordenar('curso-123', reordenarDto, 'educador-123')
      ).rejects.toThrow(BadRequestException);
    });
  });
});
