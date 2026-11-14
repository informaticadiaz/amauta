import { EstadoAlertaAcademica, TipoAlertaAcademica } from '@prisma/client';
import { AlertasService } from './alertas.service';

const periodo = {
  id: 'periodo-1',
  nombre: '2026',
  fechaInicio: new Date('2026-03-01'),
  fechaFin: new Date('2026-12-01'),
  porcentajeAsistenciaMinimo: 75,
};

function createGroup() {
  return {
    id: 'grupo-1',
    nombre: '1° A',
    institucionId: 'institucion-1',
    educadorId: 'educador-1',
    periodoAcademico: periodo,
    institucion: {
      nombre: 'Escuela Belgrano',
      escalaCalificacion: { notaAlertaMinima: 4 },
    },
    estudiantes: [
      {
        estudianteId: 'estudiante-1',
        activo: true,
        estudiante: {
          id: 'estudiante-1',
          nombre: 'Ana',
          apellido: 'Pérez',
          activo: true,
        },
      },
    ],
    educadores: [],
    educador: { id: 'educador-1', activo: true },
  };
}

describe('AlertasService', () => {
  it('crea una alerta de asistencia y notifica cuando el porcentaje cae bajo el umbral', async () => {
    const grupo = createGroup();
    const prisma = {
      usuario: {
        findUnique: jest.fn().mockResolvedValue({
          rol: 'EDUCADOR',
          perfil: { institucion: 'Escuela Belgrano' },
        }),
        findMany: jest.fn().mockResolvedValue([]),
      },
      grupo: { findMany: jest.fn().mockResolvedValue([grupo]) },
      asistencia: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ estado: 'PRESENTE' }, { estado: 'AUSENTE' }]),
      },
      calificacion: { findMany: jest.fn().mockResolvedValue([]) },
      alertaAcademica: {
        findUnique: jest.fn().mockResolvedValue(null),
        upsert: jest.fn().mockResolvedValue({
          id: 'alerta-1',
          tipo: TipoAlertaAcademica.ASISTENCIA_BAJA,
          estado: EstadoAlertaAcademica.ACTIVA,
        }),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    const notificacionesService = {
      crearNotificacionAlerta: jest.fn().mockResolvedValue(null),
    };
    const service = new AlertasService(
      prisma as never,
      notificacionesService as never
    );

    const result = await service.detectar('educador-1');

    expect(result.creadas).toBe(1);
    expect(prisma.alertaAcademica.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          tipo: TipoAlertaAcademica.ASISTENCIA_BAJA,
          valorActual: 50,
          umbral: 75,
        }),
      })
    );
    expect(notificacionesService.crearNotificacionAlerta).toHaveBeenCalledWith(
      expect.objectContaining({
        alertaId: 'alerta-1',
        tipo: 'ALERTA_ASISTENCIA_BAJA',
      })
    );
  });

  it('resuelve alertas activas cuando el estudiante recupera ambos umbrales', async () => {
    const grupo = createGroup();
    const prisma = {
      usuario: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ rol: 'EDUCADOR', perfil: null }),
        findMany: jest.fn().mockResolvedValue([]),
      },
      grupo: { findMany: jest.fn().mockResolvedValue([grupo]) },
      asistencia: {
        findMany: jest.fn().mockResolvedValue([{ estado: 'PRESENTE' }]),
      },
      calificacion: { findMany: jest.fn().mockResolvedValue([{ nota: 8 }]) },
      alertaAcademica: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'alerta-1',
            tipo: TipoAlertaAcademica.ASISTENCIA_BAJA,
            grupoId: 'grupo-1',
            estudianteId: 'estudiante-1',
            periodoAcademicoId: 'periodo-1',
            estado: EstadoAlertaAcademica.ACTIVA,
          },
        ]),
        update: jest.fn().mockResolvedValue({}),
      },
    };
    const service = new AlertasService(
      prisma as never,
      { crearNotificacionAlerta: jest.fn() } as never
    );

    const result = await service.detectar('educador-1');

    expect(result.resueltas).toBe(1);
    expect(prisma.alertaAcademica.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'alerta-1' },
        data: expect.objectContaining({
          estado: EstadoAlertaAcademica.RESUELTA,
        }),
      })
    );
  });
});
