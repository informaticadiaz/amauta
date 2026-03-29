jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
  EstadoAsistencia: {
    PRESENTE: 'PRESENTE',
    AUSENTE: 'AUSENTE',
    TARDANZA: 'TARDANZA',
    JUSTIFICADO: 'JUSTIFICADO',
  },
}));

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { AsistenciasService } from './asistencias.service';
import { PrismaService } from '../prisma/prisma.service';

const formatDate = (date: Date): string => date.toISOString().slice(0, 10);

const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

describe('AsistenciasService', () => {
  let service: AsistenciasService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;

  const mockPrisma = {
    usuario: {
      findUnique: jest.fn(),
    },
    institucion: {
      findFirst: jest.fn(),
    },
    grupo: {
      findUnique: jest.fn(),
    },
    grupoEducador: {
      findUnique: jest.fn(),
    },
    grupoEstudiante: {
      findMany: jest.fn(),
    },
    asistencia: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const GRUPO_ID = 'ckr0000000000000000000101';
  const ADMIN_ID = 'ckr0000000000000000000102';
  const EDUCADOR_ID = 'ckr0000000000000000000103';
  const ESTUDIANTE_ID = 'ckr0000000000000000000104';
  const ESTUDIANTE_2_ID = 'ckr0000000000000000000105';
  const ESTUDIANTE_3_ID = 'ckr0000000000000000000106';

  const today = new Date();
  const todayStr = formatDate(today);
  const yesterdayStr = formatDate(addDays(today, -1));

  const adminUser = {
    rol: 'ADMIN_ESCUELA',
    perfil: { institucion: 'Escuela Belgrano' },
  };

  const assignedEducator = {
    rol: 'EDUCADOR',
    perfil: { institucion: 'Escuela Belgrano' },
  };

  const unassignedEducator = {
    rol: 'EDUCADOR',
    perfil: { institucion: 'Escuela Belgrano' },
  };

  const grupo = {
    id: GRUPO_ID,
    institucionId: 'inst-1',
    activo: true,
  };

  const roster = [
    {
      estudianteId: ESTUDIANTE_ID,
      estudiante: {
        id: ESTUDIANTE_ID,
        nombre: 'Ana',
        apellido: 'Alvarez',
        email: 'ana@amauta.test',
      },
    },
    {
      estudianteId: ESTUDIANTE_2_ID,
      estudiante: {
        id: ESTUDIANTE_2_ID,
        nombre: 'Bruno',
        apellido: 'Benitez',
        email: 'bruno@amauta.test',
      },
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AsistenciasService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AsistenciasService>(AsistenciasService);
    prisma = module.get(PrismaService);

    jest.resetAllMocks();
    prisma.$transaction.mockImplementation(async (operations: unknown[]) =>
      Promise.all(operations)
    );
  });

  describe('obtenerNominaDelDia', () => {
    it('debería devolver la nómina activa con asistencias existentes del día', async () => {
      prisma.grupo.findUnique.mockResolvedValue(grupo);
      prisma.usuario.findUnique.mockResolvedValue(adminUser);
      prisma.institucion.findFirst.mockResolvedValue({ id: 'inst-1' });
      prisma.grupoEstudiante.findMany.mockResolvedValue(roster);
      prisma.asistencia.findMany.mockResolvedValue([
        {
          estudianteId: ESTUDIANTE_ID,
          estado: 'PRESENTE',
          observaciones: null,
          updatedAt: today,
        },
      ]);

      const result = await service.obtenerNominaDelDia(
        GRUPO_ID,
        { fecha: todayStr },
        ADMIN_ID
      );

      expect(result).toEqual({
        grupoId: GRUPO_ID,
        fecha: todayStr,
        estudiantes: [
          expect.objectContaining({
            id: ESTUDIANTE_ID,
            asistencia: expect.objectContaining({
              estado: 'PRESENTE',
            }),
          }),
          expect.objectContaining({
            id: ESTUDIANTE_2_ID,
            asistencia: null,
          }),
        ],
      });
    });
  });

  describe('obtenerResumenMensual', () => {
    it('debería resumir las asistencias del mes por estudiante y por grupo', async () => {
      prisma.grupo.findUnique.mockResolvedValue(grupo);
      prisma.usuario.findUnique.mockResolvedValue(adminUser);
      prisma.institucion.findFirst.mockResolvedValue({ id: 'inst-1' });
      prisma.grupoEstudiante.findMany.mockResolvedValue(roster);
      prisma.asistencia.findMany.mockResolvedValue([
        {
          estudianteId: ESTUDIANTE_ID,
          estado: 'PRESENTE',
        },
        {
          estudianteId: ESTUDIANTE_ID,
          estado: 'AUSENTE',
        },
        {
          estudianteId: ESTUDIANTE_2_ID,
          estado: 'PRESENTE',
        },
        {
          estudianteId: ESTUDIANTE_2_ID,
          estado: 'TARDANZA',
        },
        {
          estudianteId: ESTUDIANTE_2_ID,
          estado: 'JUSTIFICADO',
        },
      ]);

      const result = await service.obtenerResumenMensual(
        GRUPO_ID,
        { mes: 3, anio: 2026 },
        ADMIN_ID
      );

      expect(result).toEqual({
        grupoId: GRUPO_ID,
        mes: 3,
        anio: 2026,
        estudiantes: [
          {
            estudianteId: ESTUDIANTE_ID,
            nombre: 'Ana',
            apellido: 'Alvarez',
            email: 'ana@amauta.test',
            presentes: 1,
            ausencias: 1,
            tardanzas: 0,
            justificados: 0,
            totalRegistros: 2,
            porcentajeAsistencia: 50,
          },
          {
            estudianteId: ESTUDIANTE_2_ID,
            nombre: 'Bruno',
            apellido: 'Benitez',
            email: 'bruno@amauta.test',
            presentes: 1,
            ausencias: 0,
            tardanzas: 1,
            justificados: 1,
            totalRegistros: 3,
            porcentajeAsistencia: 67,
          },
        ],
        resumenGrupo: {
          totalRegistros: 5,
          presentes: 2,
          ausencias: 1,
          tardanzas: 1,
          justificados: 1,
        },
      });
      expect(prisma.asistencia.findMany).toHaveBeenCalledWith({
        where: {
          grupoId: GRUPO_ID,
          fecha: {
            gte: new Date('2026-03-01T00:00:00.000Z'),
            lt: new Date('2026-04-01T00:00:00.000Z'),
          },
          estudianteId: {
            in: [ESTUDIANTE_ID, ESTUDIANTE_2_ID],
          },
        },
        select: {
          estudianteId: true,
          estado: true,
        },
      });
    });

    it('debería rechazar el acceso cuando el educador no está asignado al grupo', async () => {
      prisma.grupo.findUnique.mockResolvedValue(grupo);
      prisma.usuario.findUnique.mockResolvedValue(unassignedEducator);
      prisma.grupoEducador.findUnique.mockResolvedValue(null);

      await expect(
        service.obtenerResumenMensual(
          GRUPO_ID,
          { mes: 3, anio: 2026 },
          EDUCADOR_ID
        )
      ).rejects.toThrow(ForbiddenException);
    });

    it('debería devolver la nómina activa con métricas en cero cuando no hay asistencias del mes', async () => {
      prisma.grupo.findUnique.mockResolvedValue(grupo);
      prisma.usuario.findUnique.mockResolvedValue(adminUser);
      prisma.institucion.findFirst.mockResolvedValue({ id: 'inst-1' });
      prisma.grupoEstudiante.findMany.mockResolvedValue(roster);
      prisma.asistencia.findMany.mockResolvedValue([]);

      const result = await service.obtenerResumenMensual(
        GRUPO_ID,
        { mes: 3, anio: 2026 },
        ADMIN_ID
      );

      expect(result.resumenGrupo).toEqual({
        totalRegistros: 0,
        presentes: 0,
        ausencias: 0,
        tardanzas: 0,
        justificados: 0,
      });
      expect(result.estudiantes).toEqual([
        expect.objectContaining({
          estudianteId: ESTUDIANTE_ID,
          totalRegistros: 0,
          porcentajeAsistencia: 0,
        }),
        expect.objectContaining({
          estudianteId: ESTUDIANTE_2_ID,
          totalRegistros: 0,
          porcentajeAsistencia: 0,
        }),
      ]);
    });
  });

  describe('registrarAsistenciasDelDia', () => {
    it('debería crear y editar asistencias del mismo día para un educador asignado', async () => {
      prisma.grupo.findUnique.mockResolvedValue(grupo);
      prisma.usuario.findUnique.mockResolvedValue(assignedEducator);
      prisma.grupoEducador.findUnique.mockResolvedValue({
        grupoId: GRUPO_ID,
        educadorId: EDUCADOR_ID,
        activo: true,
      });
      prisma.grupoEstudiante.findMany.mockResolvedValue(roster);
      prisma.asistencia.findMany.mockResolvedValue([
        {
          id: 'asist-1',
          grupoId: GRUPO_ID,
          estudianteId: ESTUDIANTE_ID,
          fecha: new Date(`${todayStr}T00:00:00.000Z`),
          estado: 'AUSENTE',
          observaciones: null,
        },
      ]);
      prisma.asistencia.create.mockResolvedValue({ id: 'asist-2' });
      prisma.asistencia.update.mockResolvedValue({ id: 'asist-1' });

      const result = await service.registrarAsistenciasDelDia(
        GRUPO_ID,
        {
          fecha: todayStr,
          asistencias: [
            {
              estudianteId: ESTUDIANTE_ID,
              estado: 'PRESENTE',
              observaciones: 'Llegó luego de la revisión inicial',
            },
            {
              estudianteId: ESTUDIANTE_2_ID,
              estado: 'TARDANZA',
            },
          ],
        },
        EDUCADOR_ID
      );

      expect(result).toEqual({
        grupoId: GRUPO_ID,
        fecha: todayStr,
        procesadas: 2,
        creadas: 1,
        actualizadas: 1,
      });
      expect(prisma.asistencia.update).toHaveBeenCalledWith({
        where: { id: 'asist-1' },
        data: {
          estado: 'PRESENTE',
          observaciones: 'Llegó luego de la revisión inicial',
        },
      });
      expect(prisma.asistencia.create).toHaveBeenCalledWith({
        data: {
          grupoId: GRUPO_ID,
          estudianteId: ESTUDIANTE_2_ID,
          fecha: new Date(`${todayStr}T00:00:00.000Z`),
          estado: 'TARDANZA',
          observaciones: null,
        },
      });
    });

    it('debería rechazar edición del mismo día sin observación cuando cambia un registro existente', async () => {
      prisma.grupo.findUnique.mockResolvedValue(grupo);
      prisma.usuario.findUnique.mockResolvedValue(adminUser);
      prisma.institucion.findFirst.mockResolvedValue({ id: 'inst-1' });
      prisma.grupoEstudiante.findMany.mockResolvedValue(roster);
      prisma.asistencia.findMany.mockResolvedValue([
        {
          id: 'asist-1',
          grupoId: GRUPO_ID,
          estudianteId: ESTUDIANTE_ID,
          fecha: new Date(`${todayStr}T00:00:00.000Z`),
          estado: 'AUSENTE',
          observaciones: null,
        },
      ]);

      await expect(
        service.registrarAsistenciasDelDia(
          GRUPO_ID,
          {
            fecha: todayStr,
            asistencias: [
              {
                estudianteId: ESTUDIANTE_ID,
                estado: 'PRESENTE',
              },
            ],
          },
          ADMIN_ID
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('debería rechazar estudiantes que no estén activos en el grupo', async () => {
      prisma.grupo.findUnique.mockResolvedValue(grupo);
      prisma.usuario.findUnique.mockResolvedValue(adminUser);
      prisma.institucion.findFirst.mockResolvedValue({ id: 'inst-1' });
      prisma.grupoEstudiante.findMany.mockResolvedValue(roster);
      prisma.asistencia.findMany.mockResolvedValue([]);

      await expect(
        service.registrarAsistenciasDelDia(
          GRUPO_ID,
          {
            fecha: todayStr,
            asistencias: [
              {
                estudianteId: ESTUDIANTE_3_ID,
                estado: 'PRESENTE',
              },
            ],
          },
          ADMIN_ID
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('debería rechazar a un educador no asignado al grupo', async () => {
      prisma.grupo.findUnique.mockResolvedValue(grupo);
      prisma.usuario.findUnique.mockResolvedValue(assignedEducator);
      prisma.grupoEducador.findUnique.mockResolvedValue(null);

      await expect(
        service.registrarAsistenciasDelDia(
          GRUPO_ID,
          {
            fecha: todayStr,
            asistencias: [
              {
                estudianteId: ESTUDIANTE_ID,
                estado: 'PRESENTE',
              },
            ],
          },
          EDUCADOR_ID
        )
      ).rejects.toThrow(ForbiddenException);
    });

    it('debería bloquear la edición de asistencias de días anteriores', async () => {
      prisma.grupo.findUnique.mockResolvedValue(grupo);
      prisma.usuario.findUnique.mockResolvedValue(adminUser);
      prisma.institucion.findFirst.mockResolvedValue({ id: 'inst-1' });
      prisma.grupoEstudiante.findMany.mockResolvedValue(roster);
      prisma.asistencia.findMany.mockResolvedValue([
        {
          id: 'asist-1',
          grupoId: GRUPO_ID,
          estudianteId: ESTUDIANTE_ID,
          fecha: new Date(`${yesterdayStr}T00:00:00.000Z`),
          estado: 'AUSENTE',
          observaciones: null,
        },
      ]);

      await expect(
        service.registrarAsistenciasDelDia(
          GRUPO_ID,
          {
            fecha: yesterdayStr,
            asistencias: [
              {
                estudianteId: ESTUDIANTE_ID,
                estado: 'PRESENTE',
                observaciones: 'Corrección posterior',
              },
            ],
          },
          ADMIN_ID
        )
      ).rejects.toThrow(BadRequestException);
    });
  });
});
