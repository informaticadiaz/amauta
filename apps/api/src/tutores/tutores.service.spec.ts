import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { TutoresService } from './tutores.service';

describe('TutoresService', () => {
  const prisma = {
    usuario: { findUnique: jest.fn() },
    institucion: { findUnique: jest.fn(), findFirst: jest.fn() },
    matricula: { findFirst: jest.fn() },
    tutorEstudiante: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  const service = new TutoresService(prisma as never);

  beforeEach(() => jest.clearAllMocks());

  it('rechaza que un admin opere sobre otra institución', async () => {
    prisma.usuario.findUnique.mockResolvedValue({
      rol: 'ADMIN_ESCUELA',
      perfil: { institucion: 'Escuela Norte' },
    });
    prisma.institucion.findFirst.mockResolvedValue({
      id: 'inst-norte',
      nombre: 'Escuela Norte',
    });

    await expect(
      service.listar('inst-sur', {}, 'admin-1')
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.tutorEstudiante.findMany).not.toHaveBeenCalled();
  });

  it('exige tutor, estudiante activos y matrícula activa institucional al crear', async () => {
    prisma.usuario.findUnique
      .mockResolvedValueOnce({ rol: 'SUPER_ADMIN' })
      .mockResolvedValueOnce({ id: 'tutor-1', rol: 'TUTOR', activo: true })
      .mockResolvedValueOnce({
        id: 'student-1',
        rol: 'ESTUDIANTE',
        activo: true,
      });
    prisma.institucion.findUnique.mockResolvedValue({
      id: 'inst-1',
      nombre: 'Escuela',
    });
    prisma.matricula.findFirst.mockResolvedValue(null);

    await expect(
      service.crear(
        'inst-1',
        { tutorId: 'tutor-1', estudianteId: 'student-1', relacion: 'PADRE' },
        'super-1'
      )
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.tutorEstudiante.create).not.toHaveBeenCalled();
  });

  it('desactiva un vínculo sin eliminarlo', async () => {
    prisma.usuario.findUnique.mockResolvedValue({ rol: 'SUPER_ADMIN' });
    prisma.institucion.findUnique.mockResolvedValue({
      id: 'inst-1',
      nombre: 'Escuela',
    });
    prisma.tutorEstudiante.findUnique.mockResolvedValue({
      id: 'link-1',
      activo: true,
      estudiante: { matriculas: [{ id: 'mat-1' }] },
    });

    await service.desactivar('inst-1', 'link-1', 'super-1');

    expect(prisma.tutorEstudiante.update).toHaveBeenCalledWith({
      where: { id: 'link-1' },
      data: { activo: false },
    });
  });
});
