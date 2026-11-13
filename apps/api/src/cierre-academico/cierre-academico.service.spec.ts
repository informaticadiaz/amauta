import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { CierreAcademicoService } from './cierre-academico.service';
import { PrismaService } from '../prisma/prisma.service';

const institucionId = `c${'a'.repeat(24)}`;
const periodoId = `c${'b'.repeat(24)}`;
const grupoId = `c${'c'.repeat(24)}`;
const estudianteId = `c${'d'.repeat(24)}`;
const materiaMatematicas = `c${'e'.repeat(24)}`;
const materiaLengua = `c${'f'.repeat(24)}`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createPrisma = (): any => ({
  usuario: { findUnique: jest.fn() },
  institucion: { findUnique: jest.fn(), findFirst: jest.fn() },
  periodoAcademico: { findUnique: jest.fn(), update: jest.fn() },
  escalaCalificacion: { findUnique: jest.fn() },
  grupo: { findMany: jest.fn() },
  calificacion: { findMany: jest.fn() },
  asistencia: { findMany: jest.fn() },
  estadoPromocion: { upsert: jest.fn() },
  $transaction: jest.fn(),
});

describe('CierreAcademicoService', () => {
  let service: CierreAcademicoService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;

  beforeEach(async () => {
    prisma = createPrisma();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CierreAcademicoService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(CierreAcademicoService);
    prisma.usuario.findUnique.mockResolvedValue({
      rol: 'ADMIN_ESCUELA',
      perfil: { institucion: 'Escuela Nacional' },
    });
    prisma.institucion.findFirst.mockResolvedValue({ id: institucionId });
    prisma.periodoAcademico.findUnique.mockResolvedValue({
      id: periodoId,
      institucionId,
      nombre: 'Primer trimestre',
      fechaInicio: new Date('2026-03-01'),
      fechaFin: new Date('2026-06-30'),
      estadoCierre: 'ABIERTO',
      porcentajeAsistenciaMinimo: 60,
      institucion: { id: institucionId, nombre: 'Escuela Nacional' },
    });
    prisma.escalaCalificacion.findUnique.mockResolvedValue({
      notaAprobacion: 6,
    });
    prisma.$transaction.mockImplementation(
      async (callback: (tx: typeof prisma) => Promise<unknown>) =>
        callback(prisma)
    );
  });

  const run = () => service.preview('admin-1', { institucionId, periodoId });

  it('promueve solo cuando todas las materias y la asistencia alcanzan el mínimo', async () => {
    prisma.grupo.findMany.mockResolvedValue([
      {
        id: grupoId,
        nombre: '3° A',
        materias: [
          { materiaId: materiaMatematicas, materia: { nombre: 'Matemáticas' } },
          { materiaId: materiaLengua, materia: { nombre: 'Lengua' } },
        ],
        estudiantes: [
          {
            estudianteId,
            estudiante: { nombre: 'Ana', apellido: 'García' },
          },
        ],
      },
    ]);
    prisma.calificacion.findMany.mockResolvedValue([
      { grupoId, estudianteId, materiaId: materiaMatematicas, nota: 6 },
      { grupoId, estudianteId, materiaId: materiaLengua, nota: 9 },
    ]);
    prisma.asistencia.findMany.mockResolvedValue([
      { grupoId, estudianteId, estado: 'PRESENTE' },
      { grupoId, estudianteId, estado: 'JUSTIFICADO' },
      { grupoId, estudianteId, estado: 'TARDANZA' },
    ]);

    const result = await run();

    expect(result.grupos[0]?.estudiantes[0]).toMatchObject({
      estado: 'PROMOVIDO',
      porcentajeAsistencia: 67,
      materiasTotales: 2,
      materiasAprobadas: 2,
      materiasSinCalificacion: 0,
    });
    expect(result.grupos[0]?.estudiantes[0]?.razones).toEqual([]);
  });

  it('clasifica REPITENTE con razón explícita ante nota faltante o insuficiente', async () => {
    prisma.grupo.findMany.mockResolvedValue([
      {
        id: grupoId,
        nombre: '3° A',
        materias: [
          { materiaId: materiaMatematicas, materia: { nombre: 'Matemáticas' } },
          { materiaId: materiaLengua, materia: { nombre: 'Lengua' } },
        ],
        estudiantes: [
          { estudianteId, estudiante: { nombre: 'Ana', apellido: 'García' } },
        ],
      },
    ]);
    prisma.calificacion.findMany.mockResolvedValue([
      { grupoId, estudianteId, materiaId: materiaMatematicas, nota: 5.9 },
    ]);
    prisma.asistencia.findMany.mockResolvedValue([]);

    const student = (await run()).grupos[0]?.estudiantes[0];

    expect(student).toMatchObject({
      estado: 'REPITENTE',
      porcentajeAsistencia: 0,
      materiasAprobadas: 0,
      materiasSinCalificacion: 1,
    });
    expect(student?.razones).toEqual([
      'Matemáticas no alcanza la nota mínima (5.9 < 6)',
      'Falta calificación en Lengua',
      'Asistencia insuficiente (0% < 60%)',
    ]);
  });

  it('incluye grupos activos vacíos y excluye grupos de otro período o inactivos por el scope', async () => {
    prisma.grupo.findMany.mockResolvedValue([
      { id: grupoId, nombre: '4° A', materias: [], estudiantes: [] },
    ]);
    prisma.calificacion.findMany.mockResolvedValue([]);
    prisma.asistencia.findMany.mockResolvedValue([]);

    const result = await run();

    expect(result.grupos).toEqual([
      { grupoId, nombre: '4° A', estudiantes: [] },
    ]);
    expect(prisma.grupo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { institucionId, periodoAcademicoId: periodoId, activo: true },
      })
    );
  });

  it('rechaza a un administrador de otra institución', async () => {
    prisma.institucion.findFirst.mockResolvedValue({
      id: `c${'z'.repeat(24)}`,
    });

    await expect(run()).rejects.toThrow(ForbiddenException);
    expect(prisma.periodoAcademico.findUnique).not.toHaveBeenCalled();
  });

  it('confirma, persiste métricas y cierra el período usando el estado recalculado', async () => {
    prisma.grupo.findMany.mockResolvedValue([
      {
        id: grupoId,
        nombre: '3° A',
        materias: [
          { materiaId: materiaMatematicas, materia: { nombre: 'Matemáticas' } },
        ],
        estudiantes: [
          { estudianteId, estudiante: { nombre: 'Ana', apellido: 'García' } },
        ],
      },
    ]);
    prisma.calificacion.findMany.mockResolvedValue([
      { grupoId, estudianteId, materiaId: materiaMatematicas, nota: 8 },
    ]);
    prisma.asistencia.findMany.mockResolvedValue([
      { grupoId, estudianteId, estado: 'PRESENTE' },
    ]);
    prisma.estadoPromocion.upsert.mockResolvedValue({});
    prisma.periodoAcademico.update.mockResolvedValue({
      cerradoEn: new Date('2026-07-01'),
    });

    const result = await service.confirmar(
      'admin-1',
      { institucionId, periodoId },
      {}
    );

    expect(result.registrosPersistidos).toBe(1);
    expect(result.periodo.estadoCierre).toBe('CERRADO');
    expect(prisma.estadoPromocion.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          estado: 'PROMOVIDO',
          estadoCalculado: 'PROMOVIDO',
        }),
      })
    );
    expect(prisma.periodoAcademico.update).toHaveBeenCalled();
  });

  it('exige justificación y conserva auditoría al sobrescribir el estado', async () => {
    prisma.grupo.findMany.mockResolvedValue([
      {
        id: grupoId,
        nombre: '3° A',
        materias: [],
        estudiantes: [
          { estudianteId, estudiante: { nombre: 'Ana', apellido: 'García' } },
        ],
      },
    ]);
    prisma.calificacion.findMany.mockResolvedValue([]);
    prisma.asistencia.findMany.mockResolvedValue([]);
    prisma.estadoPromocion.upsert.mockResolvedValue({});
    prisma.periodoAcademico.update.mockResolvedValue({ cerradoEn: new Date() });

    await expect(
      service.confirmar(
        'admin-1',
        { institucionId, periodoId },
        {
          sobrescrituras: [{ grupoId, estudianteId, estado: 'PROMOVIDO' }],
        }
      )
    ).rejects.toThrow(BadRequestException);

    await service.confirmar(
      'admin-1',
      { institucionId, periodoId },
      {
        sobrescrituras: [
          {
            grupoId,
            estudianteId,
            estado: 'PROMOVIDO',
            justificacion: 'Revisión administrativa',
          },
        ],
      }
    );
    expect(prisma.estadoPromocion.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          sobrescritoPorId: 'admin-1',
          justificacionSobrescritura: 'Revisión administrativa',
        }),
      })
    );
  });

  it('rechaza confirmar un período ya cerrado sin escribir registros', async () => {
    prisma.periodoAcademico.findUnique.mockResolvedValue({
      estadoCierre: 'CERRADO',
      institucionId,
    });
    await expect(
      service.confirmar('admin-1', { institucionId, periodoId }, {})
    ).rejects.toThrow(ConflictException);
    expect(prisma.estadoPromocion.upsert).not.toHaveBeenCalled();
  });

  it('rechaza descargar el acta mientras el período permanece abierto', async () => {
    await expect(
      service.descargarActa('admin-1', { institucionId, periodoId })
    ).rejects.toThrow(ConflictException);
    expect(prisma.periodoAcademico.findUnique).toHaveBeenCalled();
  });

  it('genera un PDF institucional para un período cerrado', async () => {
    prisma.periodoAcademico.findUnique.mockResolvedValue({
      id: periodoId,
      nombre: 'Primer trimestre',
      fechaInicio: new Date('2026-03-01'),
      fechaFin: new Date('2026-06-30'),
      estadoCierre: 'CERRADO',
      cerradoEn: new Date('2026-07-01'),
      institucion: { id: institucionId, nombre: 'Escuela Nacional' },
      estadosPromocion: [
        {
          estado: 'PROMOVIDO',
          estadoCalculado: 'REPITENTE',
          notaAprobacion: 6,
          porcentajeAsistencia: 80,
          porcentajeAsistenciaMinimo: 75,
          materiasTotales: 4,
          materiasAprobadas: 3,
          materiasSinCalificacion: 0,
          justificacionSobrescritura: 'Revisión administrativa',
          grupo: { nombre: '3° A' },
          estudiante: { nombre: 'Ana', apellido: 'García' },
        },
      ],
    });

    const result = await service.descargarActa('admin-1', {
      institucionId,
      periodoId,
    });

    expect(result.filename).toBe(
      `acta-cierre-${institucionId}-${periodoId}.pdf`
    );
    expect(result.content.subarray(0, 8).toString()).toBe('%PDF-1.4');
  });

  it('rechaza un período perteneciente a otra institución', async () => {
    prisma.periodoAcademico.findUnique.mockResolvedValue({
      id: periodoId,
      institucion: { id: `c${'z'.repeat(24)}`, nombre: 'Otra' },
    });

    await expect(run()).rejects.toThrow(ForbiddenException);
  });
});
