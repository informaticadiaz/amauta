import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { HorariosService } from './horarios.service';

describe('HorariosService', () => {
  const prisma = {
    grupo: { findUnique: jest.fn() },
    usuario: { findUnique: jest.fn() },
    institucion: { findFirst: jest.fn() },
    grupoMateria: { findUnique: jest.fn() },
    grupoEducador: { findUnique: jest.fn() },
    grupoEstudiante: { findUnique: jest.fn() },
    franjaHoraria: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };
  let service: HorariosService;
  const grupo = {
    id: 'cgrupo00000000000000000001',
    institucionId: 'cinst000000000000000000001',
    activo: true,
  };
  const dto = {
    materiaId: 'cmateria000000000000000001',
    educadorId: 'ceducador000000000000000001',
    diaSemana: 'LUN' as const,
    horaInicio: '08:00',
    horaFin: '09:00',
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    service = await Test.createTestingModule({
      providers: [
        HorariosService,
        { provide: PrismaService, useValue: prisma },
      ],
    })
      .compile()
      .then((module) => module.get(HorariosService));
  });

  function prepareAdmin() {
    prisma.usuario.findUnique.mockResolvedValue({ rol: 'SUPER_ADMIN' });
    prisma.grupo.findUnique.mockResolvedValue(grupo);
    prisma.grupoMateria.findUnique.mockResolvedValue({
      activo: true,
      materia: { activo: true },
    });
    prisma.grupoEducador.findUnique.mockResolvedValue({
      activo: true,
      educador: { activo: true, rol: 'EDUCADOR' },
    });
    prisma.franjaHoraria.findFirst.mockResolvedValue(null);
    prisma.franjaHoraria.create.mockResolvedValue({
      id: 'horario-1',
      ...grupo,
      ...dto,
    });
  }

  it('rechaza horas con formato inválido o inicio no menor al fin', async () => {
    await expect(
      service.crear(grupo.id, { ...dto, horaInicio: '8:00' }, 'admin')
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.crear(
        grupo.id,
        { ...dto, horaInicio: '09:00', horaFin: '09:00' },
        'admin'
      )
    ).rejects.toThrow(BadRequestException);
  });

  it('crea solo con materia y educador activos asignados al grupo', async () => {
    prepareAdmin();
    prisma.grupoMateria.findUnique.mockResolvedValueOnce({
      activo: false,
      materia: { activo: true },
    });
    await expect(service.crear(grupo.id, dto, 'admin')).rejects.toThrow(
      'materia no está asignada'
    );

    prepareAdmin();
    prisma.grupoEducador.findUnique.mockResolvedValueOnce({
      activo: false,
      educador: { activo: true, rol: 'EDUCADOR' },
    });
    await expect(service.crear(grupo.id, dto, 'admin')).rejects.toThrow(
      'asignación activa'
    );
  });

  it('bloquea solapamientos activos del grupo o del educador', async () => {
    prepareAdmin();
    prisma.franjaHoraria.findFirst.mockResolvedValue({
      grupoId: grupo.id,
      educadorId: dto.educadorId,
    });
    await expect(service.crear(grupo.id, dto, 'admin')).rejects.toThrow(
      ConflictException
    );
    expect(prisma.franjaHoraria.create).not.toHaveBeenCalled();
  });

  it('lee el horario del estudiante únicamente mediante asignación activa', async () => {
    prisma.franjaHoraria.findMany.mockResolvedValue([]);
    const result = await service.listarMisHorariosEstudiante(
      'estudiante-1',
      {}
    );
    expect(result).toEqual({ horarios: [] });
    expect(prisma.franjaHoraria.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          grupo: expect.objectContaining({
            estudiantes: {
              some: { estudianteId: 'estudiante-1', activo: true },
            },
          }),
        }),
      })
    );
  });
});
