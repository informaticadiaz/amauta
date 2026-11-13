import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { MatriculasService } from './matriculas.service';

describe('MatriculasService', () => {
  const prisma = {
    usuario: { findUnique: jest.fn() },
    institucion: { findUnique: jest.fn(), findFirst: jest.fn() },
    periodoAcademico: { findUnique: jest.fn() },
    matricula: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
  } as any;
  let service: MatriculasService;
  const admin = { rol: 'ADMIN_ESCUELA', perfil: { institucion: 'Escuela' } };
  const estudiante = {
    id: 'ckr0000000000000000000001',
    rol: 'ESTUDIANTE',
    activo: true,
  };

  beforeEach(() => {
    jest.resetAllMocks();
    service = new MatriculasService(prisma);
    prisma.usuario.findUnique.mockResolvedValue(admin);
    prisma.institucion.findFirst.mockResolvedValue({
      id: 'inst-1',
      nombre: 'Escuela',
    });
  });

  it('crea una matrícula válida y conserva observaciones', async () => {
    prisma.usuario.findUnique
      .mockResolvedValueOnce(admin)
      .mockResolvedValueOnce(estudiante);
    prisma.periodoAcademico.findUnique.mockResolvedValue({
      id: 'ckr0000000000000000000002',
      institucionId: 'inst-1',
    });
    prisma.matricula.findUnique.mockResolvedValue(null);
    prisma.matricula.create.mockResolvedValue({ id: 'mat-1' });

    await service.crear(
      'inst-1',
      {
        estudianteId: estudiante.id,
        periodoAcademicoId: 'ckr0000000000000000000002',
        observaciones: 'Ingreso',
      },
      'admin-1'
    );
    expect(prisma.matricula.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          institucionId: 'inst-1',
          observaciones: 'Ingreso',
        }),
      })
    );
  });

  it('rechaza usuario no estudiante, inactivo, período cruzado y duplicado', async () => {
    prisma.usuario.findUnique
      .mockResolvedValueOnce(admin)
      .mockResolvedValueOnce({ ...estudiante, rol: 'EDUCADOR' });
    await expect(
      service.crear(
        'inst-1',
        {
          estudianteId: estudiante.id,
          periodoAcademicoId: 'ckr0000000000000000000002',
        },
        'admin-1'
      )
    ).rejects.toThrow(BadRequestException);

    prisma.usuario.findUnique
      .mockResolvedValueOnce(admin)
      .mockResolvedValueOnce({ ...estudiante, activo: false });
    await expect(
      service.crear(
        'inst-1',
        {
          estudianteId: estudiante.id,
          periodoAcademicoId: 'ckr0000000000000000000002',
        },
        'admin-1'
      )
    ).rejects.toThrow(BadRequestException);

    prisma.usuario.findUnique
      .mockResolvedValueOnce(admin)
      .mockResolvedValueOnce(estudiante);
    prisma.periodoAcademico.findUnique.mockResolvedValue({
      institucionId: 'inst-2',
    });
    await expect(
      service.crear(
        'inst-1',
        {
          estudianteId: estudiante.id,
          periodoAcademicoId: 'ckr0000000000000000000002',
        },
        'admin-1'
      )
    ).rejects.toThrow(BadRequestException);

    prisma.usuario.findUnique
      .mockResolvedValueOnce(admin)
      .mockResolvedValueOnce(estudiante);
    prisma.periodoAcademico.findUnique.mockResolvedValue({
      institucionId: 'inst-1',
    });
    prisma.matricula.findUnique.mockResolvedValue({ id: 'mat-1' });
    await expect(
      service.crear(
        'inst-1',
        {
          estudianteId: estudiante.id,
          periodoAcademicoId: 'ckr0000000000000000000002',
        },
        'admin-1'
      )
    ).rejects.toThrow(ConflictException);
  });

  it('rechaza alcance de administrador sobre otra institución', async () => {
    prisma.institucion.findFirst.mockResolvedValue({
      id: 'inst-1',
      nombre: 'Escuela',
    });
    await expect(service.listar('inst-2', {}, 'admin-1')).rejects.toThrow(
      ForbiddenException
    );
  });

  it('lista con paginación y filtros y actualiza estado', async () => {
    prisma.matricula.findMany.mockResolvedValue([]);
    prisma.matricula.count.mockResolvedValue(0);
    await expect(
      service.listar(
        'inst-1',
        { page: 2, limit: 5, estado: 'ACTIVA', buscar: 'ana' },
        'admin-1'
      )
    ).resolves.toEqual({
      matriculas: [],
      total: 0,
      page: 2,
      limit: 5,
      totalPages: 0,
    });

    prisma.matricula.findUnique.mockResolvedValue({
      id: 'mat-1',
      institucionId: 'inst-1',
    });
    prisma.matricula.update.mockResolvedValue({ id: 'mat-1', estado: 'BAJA' });
    await service.actualizar(
      'mat-1',
      { estado: 'BAJA', observaciones: 'Traslado' },
      'admin-1'
    );
    expect(prisma.matricula.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { estado: 'BAJA', observaciones: 'Traslado' },
      })
    );
  });
});
