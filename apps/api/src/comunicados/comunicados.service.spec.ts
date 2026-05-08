/**
 * Unit Tests - ComunicadosService
 *
 * Criterios de aceptación testeados:
 * - [x] Crear comunicado con validación de institución
 * - [x] Validación de datos de entrada (safeParse)
 * - [x] Listar filtrado por institución y no archivados
 * - [x] Detalle lanza NotFoundException si no existe
 * - [x] Soft delete (archivado) solo por ADMIN_ESCUELA
 * - [x] Actualizar solo por autor o ADMIN_ESCUELA
 */

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
  TipoComunicado: {
    GENERAL: 'GENERAL',
    ACADEMICO: 'ACADEMICO',
    ADMINISTRATIVO: 'ADMINISTRATIVO',
    EVENTO: 'EVENTO',
    URGENTE: 'URGENTE',
  },
  Prioridad: {
    BAJA: 'BAJA',
    NORMAL: 'NORMAL',
    ALTA: 'ALTA',
    URGENTE: 'URGENTE',
  },
  Rol: {
    ESTUDIANTE: 'ESTUDIANTE',
    EDUCADOR: 'EDUCADOR',
    ADMIN_ESCUELA: 'ADMIN_ESCUELA',
    SUPER_ADMIN: 'SUPER_ADMIN',
  },
}));

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ComunicadosService } from './comunicados.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ComunicadosService', () => {
  let service: ComunicadosService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;

  const INSTITUCION_ID = 'cjld2cjxh0000qzrmn831i7rn';
  const AUTOR_ID = 'clh3zqxkv0001l308g5z3x1y3';
  const COMUNICADO_ID = 'clh3zqxkv0002l308g5z3x1y4';

  const mockInstitucion = { id: INSTITUCION_ID, nombre: 'Escuela Test' };

  const mockComunicado = {
    id: COMUNICADO_ID,
    institucionId: INSTITUCION_ID,
    autorId: AUTOR_ID,
    titulo: 'Comunicado de prueba',
    contenido: 'Contenido del comunicado',
    tipo: 'GENERAL',
    prioridad: 'NORMAL',
    archivado: false,
    publicadoEn: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    autor: { id: AUTOR_ID, nombre: 'Juan', apellido: 'Pérez' },
  };

  const createMockPrisma = () => ({
    institucion: {
      findUnique: jest.fn(),
    },
    comunicado: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  });

  beforeEach(async () => {
    prisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComunicadosService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ComunicadosService>(ComunicadosService);
    jest.resetAllMocks();
  });

  describe('crear', () => {
    it('debería crear un comunicado con datos válidos', async () => {
      prisma.institucion.findUnique.mockResolvedValueOnce(mockInstitucion);
      prisma.comunicado.create.mockResolvedValueOnce(mockComunicado);

      const result = await service.crear(
        INSTITUCION_ID,
        {
          titulo: 'Comunicado de prueba',
          contenido: 'Contenido del comunicado',
          tipo: 'GENERAL',
          prioridad: 'NORMAL',
        },
        AUTOR_ID
      );

      expect(result.comunicado).toBeDefined();
      expect(prisma.comunicado.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            titulo: 'Comunicado de prueba',
            institucionId: INSTITUCION_ID,
            autorId: AUTOR_ID,
          }),
        })
      );
    });

    it('debería lanzar BadRequestException con datos inválidos', async () => {
      await expect(
        service.crear(INSTITUCION_ID, { titulo: 'a' }, AUTOR_ID)
      ).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar NotFoundException si la institución no existe', async () => {
      prisma.institucion.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.crear(
          INSTITUCION_ID,
          {
            titulo: 'Comunicado de prueba',
            contenido: 'Contenido del comunicado',
            tipo: 'GENERAL',
          },
          AUTOR_ID
        )
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('listar', () => {
    it('debería listar comunicados no archivados de la institución', async () => {
      prisma.comunicado.findMany.mockResolvedValueOnce([mockComunicado]);
      prisma.comunicado.count.mockResolvedValueOnce(1);

      const result = await service.listar(INSTITUCION_ID, {});

      expect(result.comunicados).toHaveLength(1);
      expect(prisma.comunicado.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            institucionId: INSTITUCION_ID,
            archivado: false,
          }),
        })
      );
    });

    it('debería filtrar por tipo cuando se proporciona', async () => {
      prisma.comunicado.findMany.mockResolvedValueOnce([]);
      prisma.comunicado.count.mockResolvedValueOnce(0);

      await service.listar(INSTITUCION_ID, { tipo: 'ACADEMICO' });

      expect(prisma.comunicado.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tipo: 'ACADEMICO',
          }),
        })
      );
    });
  });

  describe('obtener', () => {
    it('debería lanzar NotFoundException si el comunicado no existe', async () => {
      prisma.comunicado.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.obtener(INSTITUCION_ID, 'id-inexistente')
      ).rejects.toThrow(NotFoundException);
    });

    it('debería retornar el comunicado si existe en la institución', async () => {
      prisma.comunicado.findUnique.mockResolvedValueOnce(mockComunicado);

      const result = await service.obtener(INSTITUCION_ID, COMUNICADO_ID);

      expect(result.comunicado).toBeDefined();
    });
  });

  describe('actualizar', () => {
    it('debería lanzar ForbiddenException si el usuario no es el autor ni ADMIN_ESCUELA', async () => {
      prisma.comunicado.findUnique.mockResolvedValueOnce(mockComunicado);

      await expect(
        service.actualizar(
          INSTITUCION_ID,
          COMUNICADO_ID,
          { titulo: 'Nuevo' },
          {
            id: 'otro-usuario-id',
            rol: 'EDUCADOR',
          }
        )
      ).rejects.toThrow(ForbiddenException);
    });

    it('debería actualizar si el usuario es el autor', async () => {
      prisma.comunicado.findUnique.mockResolvedValueOnce(mockComunicado);
      prisma.comunicado.update.mockResolvedValueOnce({
        ...mockComunicado,
        titulo: 'Nuevo título',
      });

      const result = await service.actualizar(
        INSTITUCION_ID,
        COMUNICADO_ID,
        { titulo: 'Nuevo título' },
        { id: AUTOR_ID, rol: 'EDUCADOR' }
      );

      expect(result.comunicado.titulo).toBe('Nuevo título');
    });
  });

  describe('archivar', () => {
    it('debería archivar el comunicado (soft delete) como ADMIN_ESCUELA', async () => {
      prisma.comunicado.findUnique.mockResolvedValueOnce(mockComunicado);
      prisma.comunicado.update.mockResolvedValueOnce({
        ...mockComunicado,
        archivado: true,
      });

      await service.archivar(INSTITUCION_ID, COMUNICADO_ID, {
        id: 'admin-id',
        rol: 'ADMIN_ESCUELA',
      });

      expect(prisma.comunicado.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { archivado: true },
        })
      );
    });

    it('debería lanzar NotFoundException si el comunicado no existe', async () => {
      prisma.comunicado.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.archivar(INSTITUCION_ID, 'inexistente', {
          id: 'admin-id',
          rol: 'ADMIN_ESCUELA',
        })
      ).rejects.toThrow(NotFoundException);
    });
  });
});
