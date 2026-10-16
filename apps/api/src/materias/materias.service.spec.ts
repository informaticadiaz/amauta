jest.mock('@prisma/client', () => ({ PrismaClient: jest.fn() }));

import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { MateriasService } from './materias.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MateriasService', () => {
  const institucionId = 'ckr0000000000000000000007';
  const adminId = 'ckr0000000000000000000002';
  const materiaId = 'ckr0000000000000000000008';
  let service: MateriasService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      usuario: { findUnique: jest.fn() },
      institucion: { findFirst: jest.fn(), findUnique: jest.fn() },
      materia: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      grupo: { findUnique: jest.fn() },
      grupoMateria: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
    };
    const module = await Test.createTestingModule({
      providers: [
        MateriasService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(MateriasService);
    prisma.usuario.findUnique.mockResolvedValue({
      rol: 'ADMIN_ESCUELA',
      perfil: { institucion: 'Escuela Demo' },
    });
    prisma.institucion.findFirst.mockResolvedValue({ id: institucionId });
  });

  it('crea una materia de la institución del administrador', async () => {
    prisma.materia.create.mockResolvedValue({
      id: materiaId,
      nombre: 'Matemática',
      institucionId,
    });
    await expect(
      service.crear(institucionId, { nombre: 'Matemática' }, adminId)
    ).resolves.toMatchObject({ id: materiaId });
    expect(prisma.materia.create).toHaveBeenCalledWith({
      data: { nombre: 'Matemática', descripcion: null, institucionId },
    });
  });

  it('no asigna a un grupo una materia de otra institución', async () => {
    prisma.grupo.findUnique.mockResolvedValue({
      id: 'ckr0000000000000000000001',
      institucionId,
    });
    prisma.materia.findUnique.mockResolvedValue({
      id: materiaId,
      institucionId: 'otra',
      activo: true,
    });
    await expect(
      service.asignarAGrupo('ckr0000000000000000000001', materiaId, adminId)
    ).rejects.toThrow(BadRequestException);
  });
});
