/**
 * Unit Tests - GruposService
 *
 * Criterios de aceptación testeados:
 * - [x] CRUD de grupos con estado activo/inactivo
 * - [x] Filtro por ciclo lectivo y estado
 * - [x] Validación de pertenencia a institución
 */

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
}));

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GruposService } from './grupos.service';
import { PrismaService } from '../prisma/prisma.service';

describe('GruposService', () => {
  let service: GruposService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;

  const mockPrisma = {
    usuario: {
      findUnique: jest.fn(),
    },
    institucion: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    periodoAcademico: {
      findUnique: jest.fn(),
    },
    grupo: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const adminUser = {
    rol: 'ADMIN_ESCUELA',
    perfil: { institucion: 'Escuela Belgrano' },
  };

  const institucion = { id: 'inst-1', nombre: 'Escuela Belgrano' };

  const educador = {
    rol: 'EDUCADOR',
    perfil: { institucion: 'Escuela Belgrano' },
  };

  const periodo = { institucionId: 'inst-1' };

  const cuidGrupo = 'ckr0000000000000000000001';
  const cuidEducador = 'ckr0000000000000000000002';
  const cuidPeriodo = 'ckr0000000000000000000003';

  const grupo = {
    id: cuidGrupo,
    nombre: '1A',
    grado: '1',
    seccion: 'A',
    educadorId: cuidEducador,
    institucionId: 'inst-1',
    periodoAcademicoId: cuidPeriodo,
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GruposService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<GruposService>(GruposService);
    prisma = module.get(PrismaService);

    jest.resetAllMocks();
  });

  describe('crear', () => {
    const createDto = {
      nombre: '1A',
      grado: '1',
      seccion: 'A',
      educadorId: cuidEducador,
      periodoAcademicoId: cuidPeriodo,
    };

    it('debería crear un grupo con datos válidos', async () => {
      prisma.usuario.findUnique
        .mockResolvedValueOnce(adminUser)
        .mockResolvedValueOnce(educador);
      prisma.institucion.findFirst.mockResolvedValue({ id: 'inst-1' });
      prisma.institucion.findUnique.mockResolvedValue(institucion);
      prisma.periodoAcademico.findUnique.mockResolvedValue(periodo);
      prisma.grupo.create.mockResolvedValue(grupo);

      const result = await service.crear('inst-1', createDto, 'admin-1');

      expect(result).toEqual(grupo);
      expect(prisma.grupo.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          nombre: '1A',
          grado: '1',
          seccion: 'A',
          educadorId: cuidEducador,
          institucionId: 'inst-1',
          periodoAcademicoId: cuidPeriodo,
        }),
      });
    });

    it('debería lanzar error si el periodo no pertenece a la institución', async () => {
      prisma.usuario.findUnique
        .mockResolvedValueOnce(adminUser)
        .mockResolvedValueOnce(educador);
      prisma.institucion.findFirst.mockResolvedValue({ id: 'inst-1' });
      prisma.institucion.findUnique.mockResolvedValue(institucion);
      prisma.periodoAcademico.findUnique.mockResolvedValue({
        institucionId: 'otra-inst',
      });

      await expect(
        service.crear('inst-1', createDto, 'admin-1')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('listar', () => {
    it('debería filtrar por estado y periodo académico', async () => {
      prisma.usuario.findUnique.mockResolvedValue(adminUser);
      prisma.institucion.findFirst.mockResolvedValue({ id: 'inst-1' });
      prisma.grupo.findMany.mockResolvedValue([grupo]);
      prisma.grupo.count.mockResolvedValue(1);

      await service.listar(
        'inst-1',
        { page: 1, limit: 10, activo: false, periodoAcademicoId: cuidPeriodo },
        'admin-1'
      );

      expect(prisma.grupo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            institucionId: 'inst-1',
            activo: false,
            periodoAcademicoId: cuidPeriodo,
          }),
        })
      );
    });
  });

  describe('obtenerPorId', () => {
    it('debería lanzar NotFoundException si el grupo no existe', async () => {
      prisma.grupo.findUnique.mockResolvedValue(null);

      await expect(
        service.obtenerPorId('grupo-404', 'admin-1')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('actualizar', () => {
    it('debería lanzar NotFoundException si el grupo no existe', async () => {
      prisma.grupo.findUnique.mockResolvedValue(null);

      await expect(
        service.actualizar('grupo-404', { nombre: 'Nuevo' }, 'admin-1')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('eliminar', () => {
    it('debería desactivar un grupo', async () => {
      prisma.grupo.findUnique.mockResolvedValue(grupo);
      prisma.usuario.findUnique.mockResolvedValue(adminUser);
      prisma.institucion.findFirst.mockResolvedValue({ id: 'inst-1' });
      prisma.grupo.update.mockResolvedValue({ ...grupo, activo: false });

      await service.eliminar('grupo-1', 'admin-1');

      expect(prisma.grupo.update).toHaveBeenCalledWith({
        where: { id: 'grupo-1' },
        data: { activo: false },
      });
    });
  });
});
