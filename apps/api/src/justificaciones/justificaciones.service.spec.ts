jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
  Prisma: {
    PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {},
  },
}));

import { Test, type TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { JustificacionesService } from './justificaciones.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrivateUploadService } from '../uploads/private-upload.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

const USER = { id: 'student-1', rol: 'ESTUDIANTE' as const };
const FILE = {
  mimetype: 'application/pdf',
  filename: 'certificado.pdf',
} as never;

function prismaMock() {
  const prisma = {
    asistencia: { findUnique: jest.fn(), updateMany: jest.fn() },
    justificacionAusencia: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn((callback: (tx: typeof prisma) => unknown) =>
      callback(prisma)
    ),
    tutorEstudiante: { findFirst: jest.fn() },
    usuario: { findUnique: jest.fn() },
    institucion: { findFirst: jest.fn() },
  };
  return prisma;
}

describe('JustificacionesService', () => {
  let service: JustificacionesService;
  let prisma: ReturnType<typeof prismaMock>;
  let upload: { save: jest.Mock; read: jest.Mock };
  let notifications: { crearNotificacionResultadoJustificacion: jest.Mock };

  beforeEach(async () => {
    prisma = prismaMock();
    upload = { save: jest.fn(), read: jest.fn() };
    notifications = { crearNotificacionResultadoJustificacion: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JustificacionesService,
        { provide: PrismaService, useValue: prisma },
        { provide: PrivateUploadService, useValue: upload },
        { provide: NotificacionesService, useValue: notifications },
      ],
    }).compile();
    service = module.get(JustificacionesService);
  });

  it('rechaza solicitudes para asistencias que no están AUSENTE sin guardar el archivo', async () => {
    prisma.asistencia.findUnique.mockResolvedValue({
      estado: 'PRESENTE',
      estudianteId: USER.id,
      grupo: {
        institucionId: 'institution-1',
        periodoAcademico: { estadoCierre: 'ABIERTO' },
      },
    });

    await expect(
      service.crear('attendance-1', 'Motivo', FILE, USER)
    ).rejects.toThrow(BadRequestException);
    expect(upload.save).not.toHaveBeenCalled();
  });

  it('rechaza una segunda solicitud pendiente para la misma ausencia', async () => {
    prisma.asistencia.findUnique.mockResolvedValue({
      estado: 'AUSENTE',
      estudianteId: USER.id,
      grupo: {
        institucionId: 'institution-1',
        periodoAcademico: { estadoCierre: 'ABIERTO' },
      },
    });
    upload.save.mockResolvedValue({
      storageKey: 'justificaciones/file.pdf',
      originalName: 'certificado.pdf',
      mimeType: 'application/pdf',
      size: 10,
    });
    prisma.justificacionAusencia.findFirst.mockResolvedValue({
      id: 'existing',
    });

    await expect(
      service.crear('attendance-1', 'Motivo', FILE, USER)
    ).rejects.toThrow(ConflictException);
    expect(prisma.justificacionAusencia.create).not.toHaveBeenCalled();
  });

  it('exige motivo para rechazar y aprueba cambiando la asistencia y notificando', async () => {
    await expect(
      service.resolver(
        'justification-1',
        { estado: 'RECHAZADA' },
        { id: 'educator-1', rol: 'EDUCADOR' }
      )
    ).rejects.toThrow(BadRequestException);

    prisma.justificacionAusencia.findUnique.mockResolvedValue({
      id: 'justification-1',
      estado: 'PENDIENTE',
      asistenciaId: 'attendance-1',
      solicitanteId: USER.id,
      asistencia: {
        grupo: {
          institucionId: 'institution-1',
          educadorId: 'educator-1',
          educadores: [],
          institucion: {},
        },
      },
    });
    prisma.justificacionAusencia.update.mockResolvedValue({
      id: 'justification-1',
      estado: 'APROBADA',
    });

    await service.resolver(
      'justification-1',
      { estado: 'APROBADA' },
      { id: 'educator-1', rol: 'EDUCADOR' }
    );

    expect(prisma.asistencia.updateMany).toHaveBeenCalledWith({
      where: { id: 'attendance-1', estado: 'AUSENTE' },
      data: { estado: 'JUSTIFICADO' },
    });
    expect(
      notifications.crearNotificacionResultadoJustificacion
    ).toHaveBeenCalledWith(
      { destinatarioId: USER.id, justificacionAusenciaId: 'justification-1' },
      prisma
    );
  });
});
