jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
}));

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CalificacionesService } from './calificaciones.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CalificacionesService', () => {
  let service: CalificacionesService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;

  const createMockPrisma = () => ({
    usuario: { findUnique: jest.fn() },
    institucion: { findFirst: jest.fn() },
    grupo: { findUnique: jest.fn() },
    grupoEducador: { findUnique: jest.fn() },
    grupoEstudiante: { findMany: jest.fn() },
    periodoAcademico: { findUnique: jest.fn() },
    escalaCalificacion: { findUnique: jest.fn() },
    calificacion: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
    $transaction: jest.fn(),
  });

  const GRUPO_ID = 'ckr0000000000000000000001';
  const ADMIN_ID = 'ckr0000000000000000000002';
  const EDUCADOR_ID = 'ckr0000000000000000000003';
  const ESTUDIANTE_1_ID = 'ckr0000000000000000000004';
  const ESTUDIANTE_2_ID = 'ckr0000000000000000000005';
  const PERIODO_ID = 'ckr0000000000000000000006';
  const INSTITUCION_ID = 'ckr0000000000000000000007';

  const grupo = {
    id: GRUPO_ID,
    institucionId: INSTITUCION_ID,
    activo: true,
  };

  const adminUser = {
    rol: 'ADMIN_ESCUELA',
    perfil: { institucion: 'Escuela Belgrano' },
  };

  const educadorAsignado = {
    rol: 'EDUCADOR',
    perfil: { institucion: 'Escuela Belgrano' },
  };

  const institucion = { id: INSTITUCION_ID };

  const escala = {
    notaMinima: 1,
    notaMaxima: 10,
    notaAprobacion: 6,
  };

  const periodo = {
    id: PERIODO_ID,
    institucionId: INSTITUCION_ID,
  };

  const nomina = [
    {
      estudianteId: ESTUDIANTE_1_ID,
      estudiante: {
        id: ESTUDIANTE_1_ID,
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
    prisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalificacionesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CalificacionesService>(CalificacionesService);
    jest.resetAllMocks();
  });

  // ─── listarCalificaciones ─────────────────────────────────────────────────

  describe('listarCalificaciones', () => {
    const query = { periodoAcademicoId: PERIODO_ID, materia: 'Matemática' };

    function setupAccesoAdmin() {
      prisma.grupo.findUnique.mockResolvedValue(grupo);
      prisma.usuario.findUnique.mockResolvedValue(adminUser);
      prisma.institucion.findFirst.mockResolvedValue(institucion);
    }

    it('debería retornar nómina con notas existentes y null para los que no tienen', async () => {
      setupAccesoAdmin();
      prisma.grupoEstudiante.findMany.mockResolvedValue(nomina);
      prisma.calificacion.findMany.mockResolvedValue([
        {
          estudianteId: ESTUDIANTE_1_ID,
          nota: 8,
          observaciones: 'Buen trabajo',
          updatedAt: new Date(),
        },
      ]);

      const result = await service.listarCalificaciones(
        GRUPO_ID,
        query,
        ADMIN_ID
      );

      expect(result.estudiantes).toHaveLength(2);
      expect(result.estudiantes[0].nota).toBe(8);
      expect(result.estudiantes[0].observaciones).toBe('Buen trabajo');
      expect(result.estudiantes[1].nota).toBeNull();
    });

    it('debería lanzar NotFoundException si el grupo no existe', async () => {
      prisma.grupo.findUnique.mockResolvedValue(null);

      await expect(
        service.listarCalificaciones(GRUPO_ID, query, ADMIN_ID)
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar ForbiddenException si el educador no está asignado al grupo', async () => {
      prisma.grupo.findUnique.mockResolvedValue(grupo);
      prisma.usuario.findUnique.mockResolvedValue(educadorAsignado);
      prisma.grupoEducador.findUnique.mockResolvedValue(null); // no asignado

      await expect(
        service.listarCalificaciones(GRUPO_ID, query, EDUCADOR_ID)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── cargarCalificaciones ─────────────────────────────────────────────────

  describe('cargarCalificaciones', () => {
    const dto = {
      periodoAcademicoId: PERIODO_ID,
      materia: 'Matemática',
      calificaciones: [
        { estudianteId: ESTUDIANTE_1_ID, nota: 8, observaciones: null },
        { estudianteId: ESTUDIANTE_2_ID, nota: 7, observaciones: null },
      ],
    };

    function setupCargaAdmin() {
      prisma.grupo.findUnique.mockResolvedValue(grupo);
      prisma.usuario.findUnique.mockResolvedValue(adminUser);
      prisma.institucion.findFirst.mockResolvedValue(institucion);
      prisma.grupoEstudiante.findMany.mockResolvedValue(nomina);
      prisma.periodoAcademico.findUnique.mockResolvedValue(periodo);
      prisma.escalaCalificacion.findUnique.mockResolvedValue(escala);
      prisma.$transaction.mockResolvedValue([]);
    }

    it('debería ejecutar upsert masivo y retornar cantidad de registros procesados', async () => {
      setupCargaAdmin();

      const result = await service.cargarCalificaciones(
        GRUPO_ID,
        dto,
        ADMIN_ID
      );

      expect(result.procesadas).toBe(2);
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it('debería lanzar BadRequestException si una nota excede el máximo de la escala', async () => {
      setupCargaAdmin();
      const dtoConNotaAlta = {
        ...dto,
        calificaciones: [
          { estudianteId: ESTUDIANTE_1_ID, nota: 11, observaciones: null }, // > notaMaxima=10
        ],
      };

      await expect(
        service.cargarCalificaciones(GRUPO_ID, dtoConNotaAlta, ADMIN_ID)
      ).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar BadRequestException si una nota es menor al mínimo de la escala', async () => {
      setupCargaAdmin();
      const dtoConNotaBaja = {
        ...dto,
        calificaciones: [
          { estudianteId: ESTUDIANTE_1_ID, nota: 0, observaciones: null }, // < notaMinima=1
        ],
      };

      await expect(
        service.cargarCalificaciones(GRUPO_ID, dtoConNotaBaja, ADMIN_ID)
      ).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar BadRequestException si un estudiante no pertenece al grupo', async () => {
      setupCargaAdmin();
      const estudianteForaneo = 'ckr0000000000000000000099';
      const dtoConEstudianteForaneo = {
        ...dto,
        calificaciones: [
          { estudianteId: estudianteForaneo, nota: 8, observaciones: null },
        ],
      };

      await expect(
        service.cargarCalificaciones(
          GRUPO_ID,
          dtoConEstudianteForaneo,
          ADMIN_ID
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar BadRequestException si el período académico pertenece a otra institución', async () => {
      prisma.grupo.findUnique.mockResolvedValue(grupo);
      prisma.usuario.findUnique.mockResolvedValue(adminUser);
      prisma.institucion.findFirst.mockResolvedValue(institucion);
      prisma.grupoEstudiante.findMany.mockResolvedValue(nomina);
      prisma.periodoAcademico.findUnique.mockResolvedValue({
        id: PERIODO_ID,
        institucionId: 'otra-institucion-id', // institución diferente
      });
      prisma.escalaCalificacion.findUnique.mockResolvedValue(escala);

      await expect(
        service.cargarCalificaciones(GRUPO_ID, dto, ADMIN_ID)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getMisCalificaciones', () => {
    const calMock = [
      {
        materia: 'Matemáticas',
        nota: 8.5,
        observaciones: null,
        updatedAt: new Date('2026-03-01'),
        grupo: { nombre: '3°A' },
        periodoAcademico: { id: PERIODO_ID, nombre: '1er Bimestre' },
      },
    ];

    it('debería devolver las calificaciones del estudiante autenticado', async () => {
      prisma.calificacion.findMany.mockResolvedValue(calMock);

      const result = await service.getMisCalificaciones(ESTUDIANTE_1_ID);

      expect(result.calificaciones).toHaveLength(1);
      expect(result.calificaciones[0].materia).toBe('Matemáticas');
      expect(prisma.calificacion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ estudianteId: ESTUDIANTE_1_ID }),
        })
      );
    });

    it('debería filtrar por periodoAcademicoId cuando se provee', async () => {
      prisma.calificacion.findMany.mockResolvedValue(calMock);

      await service.getMisCalificaciones(ESTUDIANTE_1_ID, PERIODO_ID);

      expect(prisma.calificacion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            estudianteId: ESTUDIANTE_1_ID,
            periodoAcademicoId: PERIODO_ID,
          }),
        })
      );
    });

    it('debería devolver lista vacía si el estudiante no tiene calificaciones', async () => {
      prisma.calificacion.findMany.mockResolvedValue([]);

      const result = await service.getMisCalificaciones(ESTUDIANTE_1_ID);

      expect(result.calificaciones).toHaveLength(0);
    });
  });
});
