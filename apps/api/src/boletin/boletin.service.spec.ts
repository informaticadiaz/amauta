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

import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BoletinService } from './boletin.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BoletinService', () => {
  let service: BoletinService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;

  const createMockPrisma = () => ({
    grupoEstudiante: {
      findUnique: jest.fn(),
    },
    grupo: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    periodoAcademico: {
      findUnique: jest.fn(),
    },
    usuario: {
      findUnique: jest.fn(),
    },
    calificacion: {
      findMany: jest.fn(),
    },
    asistencia: {
      findMany: jest.fn(),
    },
    escalaCalificacion: {
      findUnique: jest.fn(),
    },
  });

  beforeEach(async () => {
    prisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [BoletinService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<BoletinService>(BoletinService);
    jest.resetAllMocks();
  });

  describe('getBoletinEstudiante', () => {
    const usuarioId = 'estudiante-1';
    const grupoId = 'grupo-1';
    const periodoId = 'periodo-1';

    it('debería retornar el boletín completo del estudiante', async () => {
      prisma.grupoEstudiante.findUnique.mockResolvedValue({ activo: true });
      prisma.grupo.findUnique.mockResolvedValue({
        nombre: '3° A',
        institucion: {
          id: 'inst-1',
          nombre: 'Escuela Nacional',
        },
      });
      prisma.periodoAcademico.findUnique.mockResolvedValue({
        nombre: 'Primer Trimestre',
        fechaInicio: new Date('2026-03-01'),
        fechaFin: new Date('2026-06-30'),
      });
      prisma.usuario.findUnique.mockResolvedValue({
        nombre: 'Ana',
        apellido: 'García',
      });
      prisma.calificacion.findMany.mockResolvedValue([
        { materia: 'Matemáticas', nota: 8.5, observaciones: null },
        { materia: 'Lengua', nota: 9.0, observaciones: null },
      ]);
      prisma.asistencia.findMany.mockResolvedValue([
        { estado: 'PRESENTE' },
        { estado: 'PRESENTE' },
        { estado: 'AUSENTE' },
        { estado: 'TARDANZA' },
      ]);
      prisma.escalaCalificacion.findUnique.mockResolvedValue({
        notaMinima: 0,
        notaMaxima: 10,
        notaAprobacion: 6,
      });

      const result = await service.getBoletinEstudiante(
        usuarioId,
        periodoId,
        grupoId
      );

      expect(result.estudiante).toEqual({ nombre: 'Ana', apellido: 'García' });
      expect(result.institucion.nombre).toBe('Escuela Nacional');
      expect(result.periodo.nombre).toBe('Primer Trimestre');
      expect(result.grupo.nombre).toBe('3° A');
      expect(result.calificaciones).toHaveLength(2);
      expect(result.asistencia.total).toBe(4);
      expect(result.asistencia.presente).toBe(2);
      expect(result.asistencia.ausente).toBe(1);
      expect(result.asistencia.tardanza).toBe(1);
      expect(result.asistencia.porcentaje).toBe(50);
      expect(result.escala).toEqual({
        notaMinima: 0,
        notaMaxima: 10,
        notaAprobacion: 6,
      });
      expect(result.generadoEn).toBeInstanceOf(Date);
    });

    it('debería lanzar ForbiddenException si el estudiante no pertenece al grupo', async () => {
      prisma.grupoEstudiante.findUnique.mockResolvedValue(null);

      await expect(
        service.getBoletinEstudiante(usuarioId, periodoId, grupoId)
      ).rejects.toThrow(ForbiddenException);
    });

    it('debería lanzar ForbiddenException si el estudiante está inactivo en el grupo', async () => {
      prisma.grupoEstudiante.findUnique.mockResolvedValue({ activo: false });

      await expect(
        service.getBoletinEstudiante(usuarioId, periodoId, grupoId)
      ).rejects.toThrow(ForbiddenException);
    });

    it('debería lanzar NotFoundException si el grupo no existe', async () => {
      prisma.grupoEstudiante.findUnique.mockResolvedValue({ activo: true });
      prisma.grupo.findUnique.mockResolvedValue(null);

      await expect(
        service.getBoletinEstudiante(usuarioId, periodoId, grupoId)
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar NotFoundException si el período no existe', async () => {
      prisma.grupoEstudiante.findUnique.mockResolvedValue({ activo: true });
      prisma.grupo.findUnique.mockResolvedValue({
        nombre: '3° A',
        institucion: { id: 'inst-1', nombre: 'Escuela Nacional' },
      });
      prisma.periodoAcademico.findUnique.mockResolvedValue(null);

      await expect(
        service.getBoletinEstudiante(usuarioId, periodoId, grupoId)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getMisGrupos', () => {
    it('debería retornar los grupos activos del estudiante', async () => {
      prisma.grupo.findMany.mockResolvedValue([
        {
          id: 'grupo-1',
          nombre: '3° A',
          grado: '3°',
          seccion: 'A',
          institucion: { id: 'inst-1', nombre: 'Escuela Nacional' },
          periodoAcademico: { id: 'periodo-1', nombre: 'Primer Trimestre' },
        },
      ]);

      const result = await service.getMisGrupos('estudiante-1');

      expect(result.grupos).toHaveLength(1);
      expect(result.grupos[0].nombre).toBe('3° A');
    });
  });
});
