import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import type { RequestUser } from '../common/guards';
import { MateriasController } from './materias.controller';
import { MateriasService } from './materias.service';

describe('MateriasController', () => {
  let controller: MateriasController;
  const service = {
    crear: jest.fn(),
    listar: jest.fn(),
    actualizar: jest.fn(),
    desactivar: jest.fn(),
    listarPorGrupo: jest.fn(),
    asignarAGrupo: jest.fn(),
    removerDeGrupo: jest.fn(),
  };
  const user: RequestUser = {
    id: 'admin-1',
    email: 'admin@test.com',
    nombre: 'Admin',
    apellido: 'Demo',
    rol: 'ADMIN_ESCUELA',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MateriasController],
      providers: [{ provide: MateriasService, useValue: service }],
    }).compile();
    controller = module.get(MateriasController);
    jest.resetAllMocks();
  });

  it('crea una materia y conserva el contrato observable', async () => {
    const materia = { id: 'materia-1', nombre: 'Matemática' };
    service.crear.mockResolvedValue(materia);
    await expect(
      controller.crear('inst-1', { nombre: 'Matemática' }, user)
    ).resolves.toEqual({
      materia,
      message: 'Materia creada exitosamente',
    });
    expect(service.crear).toHaveBeenCalledWith(
      'inst-1',
      { nombre: 'Matemática' },
      user.id
    );
  });

  it('delega el listado y convierte incluirInactivas', async () => {
    service.listar.mockResolvedValue([]);
    await expect(controller.listar('inst-1', 'true', user)).resolves.toEqual({
      materias: [],
    });
    expect(service.listar).toHaveBeenCalledWith('inst-1', user.id, true);
    await controller.listar('inst-1', undefined, user);
    expect(service.listar).toHaveBeenLastCalledWith('inst-1', user.id, false);
  });

  it('delega actualizar y desactivar con sus mensajes', async () => {
    const materia = { id: 'materia-1', activo: true };
    service.actualizar.mockResolvedValue(materia);
    await expect(
      controller.actualizar('materia-1', { activo: true }, user)
    ).resolves.toEqual({
      materia,
      message: 'Materia actualizada exitosamente',
    });
    service.desactivar.mockResolvedValue({ ...materia, activo: false });
    await expect(controller.desactivar('materia-1', user)).resolves.toEqual({
      materia: { ...materia, activo: false },
      message: 'Materia desactivada exitosamente',
    });
  });

  it('propaga errores observables del servicio', async () => {
    service.crear.mockRejectedValue(new ConflictException('Materia duplicada'));
    await expect(
      controller.crear('inst-1', { nombre: 'Matemática' }, user)
    ).rejects.toThrow(ConflictException);
    service.actualizar.mockRejectedValue(
      new NotFoundException('Materia no encontrada')
    );
    await expect(
      controller.actualizar('materia-1', { nombre: 'Nueva' }, user)
    ).rejects.toThrow(NotFoundException);
  });

  it('lista materias del grupo', async () => {
    const materias = [{ id: 'materia-1' }];
    service.listarPorGrupo.mockResolvedValue(materias);
    await expect(controller.listarPorGrupo('grupo-1', user)).resolves.toEqual({
      materias,
    });
    expect(service.listarPorGrupo).toHaveBeenCalledWith('grupo-1', user.id);
  });

  it('asigna y remueve materias del grupo', async () => {
    const asignacion = {
      grupoId: 'grupo-1',
      materiaId: 'materia-1',
      activo: true,
    };
    service.asignarAGrupo.mockResolvedValue(asignacion);
    await expect(
      controller.asignar('grupo-1', 'materia-1', user)
    ).resolves.toEqual({
      asignacion,
      message: 'Materia asignada al grupo',
    });
    expect(service.asignarAGrupo).toHaveBeenCalledWith(
      'grupo-1',
      'materia-1',
      user.id
    );

    service.removerDeGrupo.mockResolvedValue(undefined);
    await expect(
      controller.remover('grupo-1', 'materia-1', user)
    ).resolves.toBeUndefined();
    expect(service.removerDeGrupo).toHaveBeenCalledWith(
      'grupo-1',
      'materia-1',
      user.id
    );
  });
});
