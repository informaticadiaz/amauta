/**
 * Unit Tests - GruposService
 *
 * Criterios de aceptación testeados:
 * - [x] CRUD de grupos con estado activo/inactivo
 * - [x] Filtro por ciclo lectivo y estado
 * - [x] Validación de pertenencia a institución
 * - [x] Asignación masiva de estudiantes a grupos (F4-007)
 * - [x] Validación: estudiantes pertenecen a la institución
 * - [x] Validación: estudiantes tienen rol ESTUDIANTE
 * - [x] Detección de duplicados
 * - [x] Listado de estudiantes de un grupo
 * - [x] Remoción de estudiantes de un grupo
 * - [ ] Asignación de educadores a grupos (F4-008)
 * - [ ] Listado de educadores de un grupo
 * - [ ] Remoción de educadores de un grupo
 * - [ ] Listado de grupos del educador actual
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
      findMany: jest.fn(),
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
    grupoEstudiante: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    grupoEducador: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
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
  const cuidEstudiante1 = 'ckr0000000000000000000004';
  const cuidEstudiante2 = 'ckr0000000000000000000005';
  const cuidEstudiante3 = 'ckr0000000000000000000006';
  const cuidEducador2 = 'ckr0000000000000000000007';
  const cuidEducador3 = 'ckr0000000000000000000008';

  const estudiante1 = {
    id: cuidEstudiante1,
    email: 'estudiante1@amauta.test',
    nombre: 'Juan',
    apellido: 'Pérez',
    rol: 'ESTUDIANTE',
    perfil: { institucion: 'Escuela Belgrano' },
  };

  const estudiante2 = {
    id: cuidEstudiante2,
    email: 'estudiante2@amauta.test',
    nombre: 'María',
    apellido: 'García',
    rol: 'ESTUDIANTE',
    perfil: { institucion: 'Escuela Belgrano' },
  };

  const estudiante3OtraInst = {
    id: cuidEstudiante3,
    email: 'estudiante3@amauta.test',
    nombre: 'Pedro',
    apellido: 'López',
    rol: 'ESTUDIANTE',
    perfil: { institucion: 'Otra Escuela' },
  };

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

  const educador2 = {
    id: cuidEducador2,
    email: 'educador2@amauta.test',
    nombre: 'Ana',
    apellido: 'Suarez',
    rol: 'EDUCADOR',
    perfil: { institucion: 'Escuela Belgrano' },
  };

  const educadorOtraInst = {
    id: cuidEducador3,
    email: 'educador3@amauta.test',
    nombre: 'Luis',
    apellido: 'Diaz',
    rol: 'EDUCADOR',
    perfil: { institucion: 'Otra Escuela' },
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

  // =========================================
  // Tests de Asignación de Estudiantes (F4-007)
  // =========================================

  describe('asignarEstudiantes', () => {
    const asignarDto = {
      estudiantesIds: [cuidEstudiante1, cuidEstudiante2],
    };

    it('debería asignar estudiantes válidos a un grupo', async () => {
      prisma.grupo.findUnique.mockResolvedValue(grupo);
      prisma.usuario.findUnique.mockResolvedValue(adminUser);
      prisma.institucion.findFirst.mockResolvedValue({ id: 'inst-1' });
      prisma.institucion.findUnique.mockResolvedValue(institucion);
      prisma.usuario.findMany.mockResolvedValue([estudiante1, estudiante2]);
      prisma.grupoEstudiante.findMany.mockResolvedValue([]);
      prisma.$transaction.mockResolvedValue([]);
      prisma.grupoEstudiante.createMany.mockResolvedValue({ count: 2 });

      const result = await service.asignarEstudiantes(
        cuidGrupo,
        asignarDto,
        'admin-1'
      );

      expect(result.agregados).toHaveLength(2);
      expect(result.duplicados).toHaveLength(0);
      expect(result.errores).toHaveLength(0);
      expect(prisma.grupoEstudiante.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            grupoId: cuidGrupo,
            estudianteId: cuidEstudiante1,
            asignadoPorId: 'admin-1',
            activo: true,
          }),
          expect.objectContaining({
            grupoId: cuidGrupo,
            estudianteId: cuidEstudiante2,
            asignadoPorId: 'admin-1',
            activo: true,
          }),
        ]),
      });
    });

    it('debería detectar duplicados y no asignarlos de nuevo', async () => {
      prisma.grupo.findUnique.mockResolvedValue(grupo);
      prisma.usuario.findUnique.mockResolvedValue(adminUser);
      prisma.institucion.findFirst.mockResolvedValue({ id: 'inst-1' });
      prisma.institucion.findUnique.mockResolvedValue(institucion);
      prisma.usuario.findMany.mockResolvedValue([estudiante1, estudiante2]);
      prisma.grupoEstudiante.findMany.mockResolvedValue([
        { estudianteId: cuidEstudiante1, activo: true },
      ]);
      prisma.$transaction.mockResolvedValue([]);
      prisma.grupoEstudiante.createMany.mockResolvedValue({ count: 1 });

      const result = await service.asignarEstudiantes(
        cuidGrupo,
        asignarDto,
        'admin-1'
      );

      expect(result.agregados).toHaveLength(1);
      expect(result.duplicados).toHaveLength(1);
      expect(result.duplicados[0]).toBe(cuidEstudiante1);
    });

    it('debería reactivar una asignación inactiva', async () => {
      prisma.grupo.findUnique.mockResolvedValue(grupo);
      prisma.usuario.findUnique.mockResolvedValue(adminUser);
      prisma.institucion.findFirst.mockResolvedValue({ id: 'inst-1' });
      prisma.institucion.findUnique.mockResolvedValue(institucion);
      prisma.usuario.findMany.mockResolvedValue([estudiante1]);
      prisma.grupoEstudiante.findMany.mockResolvedValue([
        { estudianteId: cuidEstudiante1, activo: false },
      ]);
      prisma.grupoEstudiante.update.mockResolvedValue({});
      prisma.$transaction.mockResolvedValue([]);

      const result = await service.asignarEstudiantes(
        cuidGrupo,
        { estudiantesIds: [cuidEstudiante1] },
        'admin-1'
      );

      expect(result.agregados).toEqual([cuidEstudiante1]);
      expect(result.duplicados).toEqual([]);
      expect(result.errores).toEqual([]);
      expect(prisma.grupoEstudiante.update).toHaveBeenCalledWith({
        where: {
          grupoId_estudianteId: {
            grupoId: cuidGrupo,
            estudianteId: cuidEstudiante1,
          },
        },
        data: expect.objectContaining({
          activo: true,
          asignadoPorId: 'admin-1',
          removidoEn: null,
          removidoPorId: null,
        }),
      });
    });

    it('debería reportar error si el estudiante no tiene rol ESTUDIANTE', async () => {
      const noEstudiante = {
        ...estudiante1,
        rol: 'EDUCADOR',
      };

      prisma.grupo.findUnique.mockResolvedValue(grupo);
      prisma.usuario.findUnique.mockResolvedValue(adminUser);
      prisma.institucion.findFirst.mockResolvedValue({ id: 'inst-1' });
      prisma.institucion.findUnique.mockResolvedValue(institucion);
      prisma.usuario.findMany.mockResolvedValue([noEstudiante]);
      prisma.grupoEstudiante.findMany.mockResolvedValue([]);

      const result = await service.asignarEstudiantes(
        cuidGrupo,
        { estudiantesIds: [cuidEstudiante1] },
        'admin-1'
      );

      expect(result.agregados).toHaveLength(0);
      expect(result.errores).toHaveLength(1);
      expect(result.errores[0].razon).toContain('no tiene rol ESTUDIANTE');
    });

    it('debería reportar error si el estudiante no pertenece a la institución', async () => {
      prisma.grupo.findUnique.mockResolvedValue(grupo);
      prisma.usuario.findUnique.mockResolvedValue(adminUser);
      prisma.institucion.findFirst.mockResolvedValue({ id: 'inst-1' });
      prisma.institucion.findUnique.mockResolvedValue(institucion);
      prisma.usuario.findMany.mockResolvedValue([estudiante3OtraInst]);
      prisma.grupoEstudiante.findMany.mockResolvedValue([]);

      const result = await service.asignarEstudiantes(
        cuidGrupo,
        { estudiantesIds: [cuidEstudiante3] },
        'admin-1'
      );

      expect(result.agregados).toHaveLength(0);
      expect(result.errores).toHaveLength(1);
      expect(result.errores[0].razon).toContain(
        'no pertenece a la institución'
      );
    });

    it('debería reportar error si el estudiante no existe', async () => {
      prisma.grupo.findUnique.mockResolvedValue(grupo);
      prisma.usuario.findUnique.mockResolvedValue(adminUser);
      prisma.institucion.findFirst.mockResolvedValue({ id: 'inst-1' });
      prisma.institucion.findUnique.mockResolvedValue(institucion);
      prisma.usuario.findMany.mockResolvedValue([]);
      prisma.grupoEstudiante.findMany.mockResolvedValue([]);

      const result = await service.asignarEstudiantes(
        cuidGrupo,
        { estudiantesIds: ['ckr0000000000000000000099'] },
        'admin-1'
      );

      expect(result.agregados).toHaveLength(0);
      expect(result.errores).toHaveLength(1);
      expect(result.errores[0].razon).toContain('no encontrado');
    });

    it('debería lanzar NotFoundException si el grupo no existe', async () => {
      prisma.grupo.findUnique.mockResolvedValue(null);

      await expect(
        service.asignarEstudiantes(cuidGrupo, asignarDto, 'admin-1')
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar BadRequestException si la lista está vacía', async () => {
      await expect(
        service.asignarEstudiantes(cuidGrupo, { estudiantesIds: [] }, 'admin-1')
      ).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar BadRequestException si el grupo está inactivo', async () => {
      prisma.grupo.findUnique.mockResolvedValue({ ...grupo, activo: false });
      prisma.usuario.findUnique.mockResolvedValue(adminUser);
      prisma.institucion.findFirst.mockResolvedValue({ id: 'inst-1' });

      await expect(
        service.asignarEstudiantes(cuidGrupo, asignarDto, 'admin-1')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('listarEstudiantes', () => {
    const grupoEstudianteData = [
      {
        grupoId: cuidGrupo,
        estudianteId: cuidEstudiante1,
        inscritoEn: new Date(),
        estudiante: estudiante1,
      },
      {
        grupoId: cuidGrupo,
        estudianteId: cuidEstudiante2,
        inscritoEn: new Date(),
        estudiante: estudiante2,
      },
    ];

    it('debería listar estudiantes de un grupo con paginación', async () => {
      prisma.grupo.findUnique.mockResolvedValue(grupo);
      prisma.usuario.findUnique.mockResolvedValue(adminUser);
      prisma.institucion.findFirst.mockResolvedValue({ id: 'inst-1' });
      prisma.grupoEstudiante.findMany.mockResolvedValue(grupoEstudianteData);
      prisma.grupoEstudiante.count.mockResolvedValue(2);

      const result = await service.listarEstudiantes(
        cuidGrupo,
        { page: 1, limit: 10 },
        'admin-1'
      );

      expect(result.estudiantes).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('debería lanzar NotFoundException si el grupo no existe', async () => {
      prisma.grupo.findUnique.mockResolvedValue(null);

      await expect(
        service.listarEstudiantes(
          'grupo-404',
          { page: 1, limit: 10 },
          'admin-1'
        )
      ).rejects.toThrow(NotFoundException);
    });

    it('debería paginar correctamente', async () => {
      prisma.grupo.findUnique.mockResolvedValue(grupo);
      prisma.usuario.findUnique.mockResolvedValue(adminUser);
      prisma.institucion.findFirst.mockResolvedValue({ id: 'inst-1' });
      prisma.grupoEstudiante.findMany.mockResolvedValue([
        grupoEstudianteData[0],
      ]);
      prisma.grupoEstudiante.count.mockResolvedValue(2);

      const result = await service.listarEstudiantes(
        cuidGrupo,
        { page: 1, limit: 1 },
        'admin-1'
      );

      expect(result.estudiantes).toHaveLength(1);
      expect(result.total).toBe(2);
      expect(result.totalPages).toBe(2);

      expect(prisma.grupoEstudiante.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            grupoId: cuidGrupo,
            activo: true,
          },
          skip: 0,
          take: 1,
        })
      );
    });
  });

  describe('removerEstudiante', () => {
    it('debería remover un estudiante del grupo', async () => {
      prisma.grupo.findUnique.mockResolvedValue(grupo);
      prisma.usuario.findUnique.mockResolvedValue(adminUser);
      prisma.institucion.findFirst.mockResolvedValue({ id: 'inst-1' });
      prisma.grupoEstudiante.findUnique.mockResolvedValue({
        grupoId: cuidGrupo,
        estudianteId: cuidEstudiante1,
        activo: true,
      });
      prisma.grupoEstudiante.update.mockResolvedValue({});

      await service.removerEstudiante(cuidGrupo, cuidEstudiante1, 'admin-1');

      expect(prisma.grupoEstudiante.update).toHaveBeenCalledWith({
        where: {
          grupoId_estudianteId: {
            grupoId: cuidGrupo,
            estudianteId: cuidEstudiante1,
          },
        },
        data: expect.objectContaining({
          activo: false,
          removidoPorId: 'admin-1',
        }),
      });
    });

    it('debería lanzar NotFoundException si el grupo no existe', async () => {
      prisma.grupo.findUnique.mockResolvedValue(null);

      await expect(
        service.removerEstudiante('grupo-404', cuidEstudiante1, 'admin-1')
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar NotFoundException si la asignación no existe', async () => {
      prisma.grupo.findUnique.mockResolvedValue(grupo);
      prisma.usuario.findUnique.mockResolvedValue(adminUser);
      prisma.institucion.findFirst.mockResolvedValue({ id: 'inst-1' });
      prisma.grupoEstudiante.findUnique.mockResolvedValue(null);

      await expect(
        service.removerEstudiante(
          cuidGrupo,
          'estudiante-no-asignado',
          'admin-1'
        )
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('asignarEducador', () => {
    const asignarDto = {
      educadorId: cuidEducador2,
      rol: 'TITULAR' as const,
    };

    it('debería asignar un educador válido al grupo', async () => {
      prisma.grupo.findUnique.mockResolvedValue(grupo);
      prisma.usuario.findUnique
        .mockResolvedValueOnce(adminUser)
        .mockResolvedValueOnce(educador2);
      prisma.institucion.findFirst.mockResolvedValue({ id: 'inst-1' });
      prisma.institucion.findUnique.mockResolvedValue(institucion);
      prisma.grupoEducador.findUnique.mockResolvedValue(null);
      prisma.grupoEducador.create.mockResolvedValue({
        grupoId: cuidGrupo,
        educadorId: cuidEducador2,
        rol: 'TITULAR',
        activo: true,
        asignadoEn: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.asignarEducador(
        cuidGrupo,
        asignarDto,
        'admin-1'
      );

      expect(result.educadorId).toBe(cuidEducador2);
      expect(prisma.grupoEducador.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          grupoId: cuidGrupo,
          educadorId: cuidEducador2,
          rol: 'TITULAR',
          asignadoPorId: 'admin-1',
          activo: true,
        }),
      });
    });

    it('debería reactivar una asignación inactiva', async () => {
      prisma.grupo.findUnique.mockResolvedValue(grupo);
      prisma.usuario.findUnique
        .mockResolvedValueOnce(adminUser)
        .mockResolvedValueOnce(educador2);
      prisma.institucion.findFirst.mockResolvedValue({ id: 'inst-1' });
      prisma.institucion.findUnique.mockResolvedValue(institucion);
      prisma.grupoEducador.findUnique.mockResolvedValue({
        grupoId: cuidGrupo,
        educadorId: cuidEducador2,
        activo: false,
      });
      prisma.grupoEducador.update.mockResolvedValue({
        grupoId: cuidGrupo,
        educadorId: cuidEducador2,
        rol: 'SUPLENTE',
        activo: true,
      });

      const result = await service.asignarEducador(
        cuidGrupo,
        { educadorId: cuidEducador2, rol: 'SUPLENTE' },
        'admin-1'
      );

      expect(result.rol).toBe('SUPLENTE');
      expect(prisma.grupoEducador.update).toHaveBeenCalledWith({
        where: {
          grupoId_educadorId: {
            grupoId: cuidGrupo,
            educadorId: cuidEducador2,
          },
        },
        data: expect.objectContaining({
          rol: 'SUPLENTE',
          activo: true,
          asignadoPorId: 'admin-1',
          removidoEn: null,
          removidoPorId: null,
        }),
      });
    });

    it('debería lanzar error si el educador es de otra institución', async () => {
      prisma.grupo.findUnique.mockResolvedValue(grupo);
      prisma.usuario.findUnique
        .mockResolvedValueOnce(adminUser)
        .mockResolvedValueOnce(educadorOtraInst);
      prisma.institucion.findFirst.mockResolvedValue({ id: 'inst-1' });
      prisma.institucion.findUnique.mockResolvedValue(institucion);

      await expect(
        service.asignarEducador(cuidGrupo, asignarDto, 'admin-1')
      ).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar error si el usuario no es educador', async () => {
      prisma.grupo.findUnique.mockResolvedValue(grupo);
      prisma.usuario.findUnique
        .mockResolvedValueOnce(adminUser)
        .mockResolvedValueOnce({ ...educador2, rol: 'ESTUDIANTE' });
      prisma.institucion.findFirst.mockResolvedValue({ id: 'inst-1' });
      prisma.institucion.findUnique.mockResolvedValue(institucion);

      await expect(
        service.asignarEducador(cuidGrupo, asignarDto, 'admin-1')
      ).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar error si la asignación ya existe activa', async () => {
      prisma.grupo.findUnique.mockResolvedValue(grupo);
      prisma.usuario.findUnique
        .mockResolvedValueOnce(adminUser)
        .mockResolvedValueOnce(educador2);
      prisma.institucion.findFirst.mockResolvedValue({ id: 'inst-1' });
      prisma.institucion.findUnique.mockResolvedValue(institucion);
      prisma.grupoEducador.findUnique.mockResolvedValue({
        grupoId: cuidGrupo,
        educadorId: cuidEducador2,
        activo: true,
      });

      await expect(
        service.asignarEducador(cuidGrupo, asignarDto, 'admin-1')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('listarEducadores', () => {
    it('debería listar educadores asignados al grupo', async () => {
      prisma.grupo.findUnique.mockResolvedValue(grupo);
      prisma.usuario.findUnique.mockResolvedValue(adminUser);
      prisma.institucion.findFirst.mockResolvedValue({ id: 'inst-1' });
      prisma.grupoEducador.findMany.mockResolvedValue([
        {
          rol: 'TITULAR',
          asignadoEn: new Date(),
          educador: {
            id: cuidEducador2,
            email: 'educador2@amauta.test',
            nombre: 'Ana',
            apellido: 'Suarez',
          },
        },
      ]);
      prisma.grupoEducador.count.mockResolvedValue(1);

      const result = await service.listarEducadores(
        cuidGrupo,
        { page: 1, limit: 10 },
        'admin-1'
      );

      expect(result.educadores).toHaveLength(1);
      expect(result.educadores[0]).toEqual(
        expect.objectContaining({
          id: cuidEducador2,
          rol: 'TITULAR',
        })
      );
      expect(result.total).toBe(1);
    });
  });

  describe('removerEducador', () => {
    it('debería remover un educador asignado del grupo', async () => {
      prisma.grupo.findUnique.mockResolvedValue(grupo);
      prisma.usuario.findUnique.mockResolvedValue(adminUser);
      prisma.institucion.findFirst.mockResolvedValue({ id: 'inst-1' });
      prisma.grupoEducador.findUnique.mockResolvedValue({
        grupoId: cuidGrupo,
        educadorId: cuidEducador2,
        activo: true,
      });
      prisma.grupoEducador.update.mockResolvedValue({});

      await service.removerEducador(cuidGrupo, cuidEducador2, 'admin-1');

      expect(prisma.grupoEducador.update).toHaveBeenCalledWith({
        where: {
          grupoId_educadorId: {
            grupoId: cuidGrupo,
            educadorId: cuidEducador2,
          },
        },
        data: expect.objectContaining({
          activo: false,
          removidoPorId: 'admin-1',
        }),
      });
    });
  });

  describe('listarMisGruposComoEducador', () => {
    it('debería listar grupos asignados al educador actual', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        rol: 'EDUCADOR',
        perfil: { institucion: 'Escuela Belgrano' },
      });
      prisma.grupoEducador.findMany.mockResolvedValue([
        {
          rol: 'TITULAR',
          asignadoEn: new Date(),
          grupo,
        },
      ]);
      prisma.grupoEducador.count.mockResolvedValue(1);

      const result = await service.listarMisGruposComoEducador(
        { page: 1, limit: 10 },
        cuidEducador2
      );

      expect(result.grupos).toHaveLength(1);
      expect(result.grupos[0]).toEqual(
        expect.objectContaining({
          id: cuidGrupo,
          rol: 'TITULAR',
        })
      );
      expect(prisma.grupoEducador.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            educadorId: cuidEducador2,
            activo: true,
          },
        })
      );
    });

    it('debería rechazar usuarios que no son educadores', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        rol: 'ADMIN_ESCUELA',
        perfil: { institucion: 'Escuela Belgrano' },
      });

      await expect(
        service.listarMisGruposComoEducador({ page: 1, limit: 10 }, 'admin-1')
      ).rejects.toThrow(BadRequestException);
    });
  });
});
