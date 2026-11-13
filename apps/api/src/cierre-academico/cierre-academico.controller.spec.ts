import { Reflector } from '@nestjs/core';
import { CierreAcademicoController } from './cierre-academico.controller';
import { ROLES_KEY } from '../common/decorators/roles.decorator';
import { CierreAcademicoService } from './cierre-academico.service';

describe('CierreAcademicoController', () => {
  it('descarga el acta como PDF y delega institución y período', async () => {
    const service = {
      descargarActa: jest.fn().mockResolvedValue({
        filename: 'acta-cierre-inst-periodo.pdf',
        content: Buffer.from('%PDF-1.4'),
      }),
    } as unknown as CierreAcademicoService;
    const controller = new CierreAcademicoController(service);
    const response = {
      header: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await controller.acta(
      'inst-1',
      'periodo-1',
      { id: 'admin-1' } as never,
      response as never
    );

    expect(service.descargarActa).toHaveBeenCalledWith('admin-1', {
      institucionId: 'inst-1',
      periodoId: 'periodo-1',
    });
    expect(response.header).toHaveBeenCalledWith(
      'Content-Type',
      'application/pdf'
    );
    expect(response.send).toHaveBeenCalledWith(Buffer.from('%PDF-1.4'));
  });

  it('expone el preview solo para administradores y delega los parámetros', async () => {
    const preview = { grupos: [] };
    const service = {
      preview: jest.fn().mockResolvedValue(preview),
    } as unknown as CierreAcademicoService;
    const controller = new CierreAcademicoController(service);

    await expect(
      controller.preview('cinstitucion', 'cperiodo', {
        id: 'admin-1',
        email: 'admin@example.test',
        nombre: 'Admin',
        apellido: 'Escuela',
        rol: 'ADMIN_ESCUELA',
      })
    ).resolves.toBe(preview);

    expect(service.preview).toHaveBeenCalledWith('admin-1', {
      institucionId: 'cinstitucion',
      periodoId: 'cperiodo',
    });
    expect(new Reflector().get(ROLES_KEY, controller.preview)).toEqual([
      'ADMIN_ESCUELA',
      'SUPER_ADMIN',
    ]);
  });
});
