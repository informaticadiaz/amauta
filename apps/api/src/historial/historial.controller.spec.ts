import { HistorialController } from './historial.controller';

describe('HistorialController', () => {
  it('usa la identidad autenticada para el historial propio', async () => {
    const service = { getHistorial: jest.fn().mockResolvedValue({}) } as any;
    const controller = new HistorialController(service);

    await controller.getMiHistorial({ id: 'student-1' } as any);

    expect(service.getHistorial).toHaveBeenCalledWith('student-1');
  });

  it('envía institución, estudiante y administrador a la vista administrativa', async () => {
    const service = {
      getHistorialAdministrativo: jest.fn().mockResolvedValue({}),
    } as any;
    const controller = new HistorialController(service);

    await controller.getHistorialEstudiante('institution-1', 'student-1', {
      id: 'admin-1',
    } as any);

    expect(service.getHistorialAdministrativo).toHaveBeenCalledWith(
      'institution-1',
      'student-1',
      'admin-1'
    );
  });
});
