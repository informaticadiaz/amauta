jest.mock('@prisma/client', () => ({ PrismaClient: jest.fn() }));

import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { MateriasService } from './materias.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MateriasService', () => {
  const institucionId = 'ckr0000000000000000000007';
  const otraInstitucionId = 'ckr0000000000000000000009';
  const adminId = 'ckr0000000000000000000002';
  const educatorId = 'ckr0000000000000000000003';
  const materiaId = 'ckr0000000000000000000008';
  const grupoId = 'ckr0000000000000000000001';
  let service: MateriasService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      usuario: { findUnique: jest.fn() },
      institucion: { findFirst: jest.fn() },
      materia: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      grupo: { findUnique: jest.fn() },
      grupoEducador: { findUnique: jest.fn() },
      grupoMateria: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
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

  it('rechaza datos inválidos con BadRequestException', async () => {
    await expect(
      service.crear(institucionId, { nombre: '   ' }, adminId)
    ).rejects.toThrow(BadRequestException);
    expect(prisma.usuario.findUnique).not.toHaveBeenCalled();
  });

  it('rechaza crear para otra institución', async () => {
    await expect(
      service.crear(otraInstitucionId, { nombre: 'Historia' }, adminId)
    ).rejects.toThrow(ForbiddenException);
    expect(prisma.materia.create).not.toHaveBeenCalled();
  });

  it('maneja nombres duplicados sin modificar datos', async () => {
    prisma.materia.create.mockRejectedValue({ code: 'P2002' });

    await expect(
      service.crear(institucionId, { nombre: 'Matemática' }, adminId)
    ).rejects.toThrow(ConflictException);
    expect(prisma.materia.update).not.toHaveBeenCalled();
  });

  it('lista solo materias activas por defecto y permite incluir inactivas', async () => {
    prisma.materia.findMany.mockResolvedValue([]);

    await service.listar(institucionId, adminId);
    expect(prisma.materia.findMany).toHaveBeenCalledWith({
      where: { institucionId, activo: true },
      orderBy: { nombre: 'asc' },
    });

    await service.listar(institucionId, adminId, true);
    expect(prisma.materia.findMany).toHaveBeenLastCalledWith({
      where: { institucionId },
      orderBy: { nombre: 'asc' },
    });
  });

  it('desactiva y permite reactivar una materia mediante actualización', async () => {
    prisma.materia.findUnique.mockResolvedValue({ institucionId });
    prisma.materia.update.mockResolvedValue({ id: materiaId, activo: false });

    await service.desactivar(materiaId, adminId);
    expect(prisma.materia.update).toHaveBeenCalledWith({
      where: { id: materiaId },
      data: { activo: false },
    });

    prisma.materia.update.mockResolvedValue({ id: materiaId, activo: true });
    await service.actualizar(materiaId, { activo: true }, adminId);
    expect(prisma.materia.update).toHaveBeenLastCalledWith({
      where: { id: materiaId },
      data: { activo: true },
    });
  });

  it('rechaza actualización vacía y materia inexistente', async () => {
    await expect(service.actualizar(materiaId, {}, adminId)).rejects.toThrow(
      BadRequestException
    );
    prisma.materia.findUnique.mockResolvedValue(null);
    await expect(
      service.actualizar(materiaId, { nombre: 'Nueva' }, adminId)
    ).rejects.toThrow(NotFoundException);
  });

  it('maneja duplicado al actualizar el nombre', async () => {
    prisma.materia.findUnique.mockResolvedValue({ institucionId });
    prisma.materia.update.mockRejectedValue({ code: 'P2002' });

    await expect(
      service.actualizar(materiaId, { nombre: 'Matemática' }, adminId)
    ).rejects.toThrow(ConflictException);
  });

  it('asigna una materia y reactiva una asignación existente', async () => {
    prisma.grupo.findUnique.mockResolvedValue({ id: grupoId, institucionId });
    prisma.materia.findUnique.mockResolvedValue({
      id: materiaId,
      institucionId,
      activo: true,
    });
    prisma.grupoMateria.upsert.mockResolvedValue({
      grupoId,
      materiaId,
      activo: true,
    });

    await expect(
      service.asignarAGrupo(grupoId, materiaId, adminId)
    ).resolves.toMatchObject({ activo: true });
    expect(prisma.grupoMateria.upsert).toHaveBeenCalledWith({
      where: { grupoId_materiaId: { grupoId, materiaId } },
      create: { grupoId, materiaId },
      update: { activo: true },
    });
  });

  it('rechaza asignar materia inexistente, inactiva o de otra institución', async () => {
    prisma.grupo.findUnique.mockResolvedValue({ id: grupoId, institucionId });
    prisma.materia.findUnique.mockResolvedValue(null);
    await expect(
      service.asignarAGrupo(grupoId, materiaId, adminId)
    ).rejects.toThrow(NotFoundException);

    prisma.materia.findUnique.mockResolvedValue({
      id: materiaId,
      institucionId: otraInstitucionId,
      activo: true,
    });
    await expect(
      service.asignarAGrupo(grupoId, materiaId, adminId)
    ).rejects.toThrow(BadRequestException);
  });

  it('remueve una asignación mediante soft delete', async () => {
    prisma.grupo.findUnique.mockResolvedValue({ institucionId });
    prisma.grupoMateria.findUnique.mockResolvedValue({
      grupoId,
      materiaId,
      activo: true,
    });
    prisma.grupoMateria.update.mockResolvedValue({
      grupoId,
      materiaId,
      activo: false,
    });

    await expect(
      service.removerDeGrupo(grupoId, materiaId, adminId)
    ).resolves.toMatchObject({ activo: false });
    expect(prisma.grupoMateria.update).toHaveBeenCalledWith({
      where: { grupoId_materiaId: { grupoId, materiaId } },
      data: { activo: false },
    });
  });

  it('permite listar al educador asignado y rechaza al no asignado', async () => {
    prisma.grupo.findUnique.mockResolvedValue({ institucionId });
    prisma.usuario.findUnique.mockResolvedValue({ rol: 'EDUCADOR' });
    prisma.grupoEducador.findUnique.mockResolvedValue({ activo: true });
    prisma.grupoMateria.findMany.mockResolvedValue([
      { materia: { id: materiaId, nombre: 'Matemática' } },
    ]);
    await expect(service.listarPorGrupo(grupoId, educatorId)).resolves.toEqual([
      { id: materiaId, nombre: 'Matemática' },
    ]);

    prisma.grupoEducador.findUnique.mockResolvedValue({ activo: false });
    await expect(service.listarPorGrupo(grupoId, educatorId)).rejects.toThrow(
      ForbiddenException
    );
  });
});
