import { ForbiddenException } from '@nestjs/common';
import { TutorAccessService } from '../common/tutor-access.service';
import { TutorReadService } from './tutor-read.service';

describe('TutorAccessService', () => {
  const prisma = {
    tutorEstudiante: { findUnique: jest.fn(), findMany: jest.fn() },
    matricula: { findFirst: jest.fn() },
  };
  const service = new TutorAccessService(prisma as never);

  beforeEach(() => jest.clearAllMocks());

  it('permite el acceso con vínculo y matrícula activa en período vigente', async () => {
    prisma.tutorEstudiante.findUnique.mockResolvedValue({ activo: true });
    prisma.matricula.findFirst.mockResolvedValue({
      institucionId: 'inst-1',
      periodoAcademico: {
        id: 'period-1',
        nombre: 'Actual',
        fechaInicio: new Date('2026-01-01'),
        fechaFin: new Date('2026-06-30'),
      },
    });

    await expect(
      service.verificarAcceso('tutor-1', 'student-1')
    ).resolves.toEqual(
      expect.objectContaining({
        estudianteId: 'student-1',
        institucionId: 'inst-1',
      })
    );
  });

  it('deniega el acceso cruzado y los vínculos inactivos', async () => {
    prisma.tutorEstudiante.findUnique.mockResolvedValue({ activo: false });

    await expect(
      service.verificarAcceso('tutor-1', 'other-student')
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.matricula.findFirst).not.toHaveBeenCalled();
  });

  it('deniega el acceso si no hay matrícula activa en período vigente', async () => {
    prisma.tutorEstudiante.findUnique.mockResolvedValue({ activo: true });
    prisma.matricula.findFirst.mockResolvedValue(null);

    await expect(
      service.verificarAcceso('tutor-1', 'student-1')
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});

describe('TutorReadService', () => {
  it('delega el boletín al servicio existente después de autorizar', async () => {
    const access = {
      verificarAcceso: jest.fn().mockResolvedValue({
        periodo: { id: 'period-1' },
      }),
      listarEstudiantes: jest.fn(),
    };
    const prisma = {
      grupo: { findFirst: jest.fn().mockResolvedValue({ id: 'group-1' }) },
    };
    const boletin = { getBoletinEstudiante: jest.fn().mockResolvedValue({}) };
    const service = new TutorReadService(
      prisma as never,
      access as never,
      boletin as never,
      {} as never,
      {} as never,
      {} as never
    );

    await service.obtenerBoletin('tutor-1', 'student-1');

    expect(boletin.getBoletinEstudiante).toHaveBeenCalledWith(
      'student-1',
      'period-1',
      'group-1'
    );
  });
});
