import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { HistorialService } from './historial.service';

describe('HistorialService', () => {
  const prisma = {
    usuario: { findUnique: jest.fn() },
    institucion: { findUnique: jest.fn(), findFirst: jest.fn() },
    matricula: { findFirst: jest.fn() },
    calificacion: { findMany: jest.fn() },
  } as any;
  let service: HistorialService;

  const studentId = 'student-1';
  const institutionId = 'institution-1';
  const adminId = 'admin-1';

  beforeEach(() => {
    jest.resetAllMocks();
    service = new HistorialService(prisma);
  });

  it('agrupa calificaciones por período y materia y calcula promedios y evolución', async () => {
    prisma.calificacion.findMany.mockResolvedValue([
      {
        nota: 8,
        observaciones: null,
        materia: { id: 'math', nombre: 'Matemática' },
        periodoAcademico: { id: 'p1', nombre: 'Primer período', orden: 1 },
        grupo: { nombre: '1°A' },
      },
      {
        nota: 10,
        observaciones: 'Muy bien',
        materia: { id: 'math', nombre: 'Matemática' },
        periodoAcademico: { id: 'p2', nombre: 'Segundo período', orden: 2 },
        grupo: { nombre: '1°A' },
      },
      {
        nota: 6,
        observaciones: null,
        materia: { id: 'lang', nombre: 'Lengua' },
        periodoAcademico: { id: 'p1', nombre: 'Primer período', orden: 1 },
        grupo: { nombre: '1°A' },
      },
    ]);

    const result = await service.getHistorial(studentId);

    expect(result).toMatchObject({
      estudianteId: studentId,
      periodos: [
        expect.objectContaining({ id: 'p1', promedio: 7 }),
        expect.objectContaining({ id: 'p2', promedio: 10 }),
      ],
      promedioAcumulado: 8,
      evolucionPorMateria: [
        {
          materia: { id: 'lang', nombre: 'Lengua' },
          periodos: [
            { periodoId: 'p1', periodo: 'Primer período', promedio: 6 },
          ],
        },
        {
          materia: { id: 'math', nombre: 'Matemática' },
          periodos: [
            { periodoId: 'p1', periodo: 'Primer período', promedio: 8 },
            { periodoId: 'p2', periodo: 'Segundo período', promedio: 10 },
          ],
        },
      ],
    });
    expect(result.estadoPromocion).toBeNull();
  });

  it('retorna una estructura vacía cuando no hay calificaciones', async () => {
    prisma.calificacion.findMany.mockResolvedValue([]);

    await expect(service.getHistorial(studentId)).resolves.toEqual({
      estudianteId: studentId,
      periodos: [],
      promedioAcumulado: null,
      evolucionPorMateria: [],
      estadoPromocion: null,
    });
  });

  it('redondea los promedios a dos decimales', async () => {
    prisma.calificacion.findMany.mockResolvedValue([
      {
        nota: 7.33,
        observaciones: null,
        materia: { id: 'math', nombre: 'Matemática' },
        periodoAcademico: { id: 'p1', nombre: 'Primer período', orden: 1 },
        grupo: { nombre: '1°A' },
      },
      {
        nota: 7.34,
        observaciones: null,
        materia: { id: 'math', nombre: 'Matemática' },
        periodoAcademico: { id: 'p1', nombre: 'Primer período', orden: 1 },
        grupo: { nombre: '1°A' },
      },
    ]);

    const result = await service.getHistorial(studentId);

    expect(result.promedioAcumulado).toBe(7.34);
    expect(result.periodos[0]?.promedio).toBe(7.34);
    expect(result.evolucionPorMateria[0]?.periodos[0]?.promedio).toBe(7.34);
  });

  it('rechaza al estudiante no matriculado en la institución', async () => {
    prisma.usuario.findUnique
      .mockResolvedValueOnce({ rol: 'SUPER_ADMIN', perfil: null })
      .mockResolvedValueOnce({ id: studentId, rol: 'ESTUDIANTE' });
    prisma.institucion.findUnique.mockResolvedValue({ id: institutionId });
    prisma.matricula.findFirst.mockResolvedValue(null);

    await expect(
      service.getHistorialAdministrativo(institutionId, studentId, adminId)
    ).rejects.toThrow('Estudiante no matriculado en la institución');
    expect(prisma.calificacion.findMany).not.toHaveBeenCalled();
  });

  it('restringe la vista administrativa a la institución del administrador', async () => {
    prisma.usuario.findUnique
      .mockResolvedValueOnce({
        rol: 'ADMIN_ESCUELA',
        perfil: { institucion: 'Escuela Norte' },
      })
      .mockResolvedValueOnce({ id: studentId, rol: 'ESTUDIANTE' });
    prisma.institucion.findFirst.mockResolvedValue({ id: institutionId });
    prisma.matricula.findFirst.mockResolvedValue({ id: 'mat-1' });
    prisma.calificacion.findMany.mockResolvedValue([]);

    await service.getHistorialAdministrativo(institutionId, studentId, adminId);

    expect(prisma.calificacion.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          estudianteId: studentId,
          grupo: { institucionId: institutionId },
        }),
      })
    );
  });

  it('rechaza acceso administrativo cruzado', async () => {
    prisma.usuario.findUnique.mockResolvedValue({
      rol: 'ADMIN_ESCUELA',
      perfil: { institucion: 'Escuela Norte' },
    });
    prisma.institucion.findFirst.mockResolvedValue({ id: 'other-institution' });

    await expect(
      service.getHistorialAdministrativo(institutionId, studentId, adminId)
    ).rejects.toThrow(ForbiddenException);
  });

  it('rechaza estudiante inexistente en la vista administrativa', async () => {
    prisma.usuario.findUnique
      .mockResolvedValueOnce({ rol: 'SUPER_ADMIN' })
      .mockResolvedValueOnce(null);
    prisma.institucion.findUnique.mockResolvedValue({ id: institutionId });

    await expect(
      service.getHistorialAdministrativo(institutionId, studentId, adminId)
    ).rejects.toThrow(NotFoundException);
  });
});
