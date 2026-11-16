import { TutoresController } from './tutores.controller';

describe('TutoresController', () => {
  const service = {
    crear: jest.fn(),
    listar: jest.fn(),
    desactivar: jest.fn(),
  };
  const readService = {
    listarEstudiantes: jest.fn(),
    obtenerBoletin: jest.fn(),
    obtenerAsistencias: jest.fn(),
    obtenerCalificaciones: jest.fn(),
    obtenerComunicados: jest.fn(),
  };
  const controller = new TutoresController(
    service as never,
    readService as never
  );
  const user = {
    id: 'admin-1',
    email: 'admin@test',
    nombre: 'Admin',
    apellido: 'Escuela',
    rol: 'ADMIN_ESCUELA' as const,
  };

  beforeEach(() => jest.clearAllMocks());

  it('delega el listado de estudiantes vinculados al tutor autenticado', async () => {
    readService.listarEstudiantes.mockResolvedValue({ estudiantes: [] });

    await expect(
      controller.listarEstudiantes({ ...user, rol: 'TUTOR' })
    ).resolves.toEqual({
      estudiantes: [],
    });
    expect(readService.listarEstudiantes).toHaveBeenCalledWith('admin-1');
  });

  it('delega la creación con institución y usuario autenticado', async () => {
    const dto = {
      tutorId: 'tutor-1',
      estudianteId: 'student-1',
      relacion: 'MADRE' as const,
    };
    service.crear.mockResolvedValue({ id: 'link-1' });

    await expect(controller.crear('inst-1', dto, user)).resolves.toEqual({
      vinculo: { id: 'link-1' },
      message: 'Vínculo tutor-estudiante creado exitosamente',
    });
    expect(service.crear).toHaveBeenCalledWith('inst-1', dto, 'admin-1');
  });

  it('delega la desactivación y no expone un cuerpo de respuesta', async () => {
    await expect(
      controller.desactivar('inst-1', 'link-1', user)
    ).resolves.toBeUndefined();
    expect(service.desactivar).toHaveBeenCalledWith(
      'inst-1',
      'link-1',
      'admin-1'
    );
  });
});
