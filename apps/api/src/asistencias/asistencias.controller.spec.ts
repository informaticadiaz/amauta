import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AsistenciasController } from './asistencias.controller';
import { AsistenciasService } from './asistencias.service';
import type { RequestUser } from '../common/guards';

describe('AsistenciasController', () => {
  let controller: AsistenciasController;

  const mockAsistenciasService = {
    obtenerNominaDelDia: jest.fn(),
    obtenerResumenMensual: jest.fn(),
    registrarAsistenciasDelDia: jest.fn(),
  };

  const mockAdminUser: RequestUser = {
    id: 'ckr0000000000000000000110',
    email: 'admin1@amauta.test',
    nombre: 'María',
    apellido: 'García',
    rol: 'ADMIN_ESCUELA',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AsistenciasController],
      providers: [
        { provide: AsistenciasService, useValue: mockAsistenciasService },
      ],
    }).compile();

    controller = module.get<AsistenciasController>(AsistenciasController);
    jest.resetAllMocks();
  });

  describe('GET /grupos/:grupoId/asistencias', () => {
    it('debería devolver la nómina del día', async () => {
      const response = {
        grupoId: 'grupo-1',
        fecha: '2026-03-29',
        estudiantes: [],
      };
      mockAsistenciasService.obtenerNominaDelDia.mockResolvedValue(response);

      const result = await controller.obtenerNominaDelDia(
        'grupo-1',
        { fecha: '2026-03-29' },
        mockAdminUser
      );

      expect(result).toEqual(response);
      expect(mockAsistenciasService.obtenerNominaDelDia).toHaveBeenCalledWith(
        'grupo-1',
        { fecha: '2026-03-29' },
        mockAdminUser.id
      );
    });
  });

  describe('GET /grupos/:grupoId/asistencias/resumen-mensual', () => {
    it('debería devolver el resumen mensual del grupo', async () => {
      const response = {
        grupoId: 'grupo-1',
        mes: 3,
        anio: 2026,
        estudiantes: [],
        resumenGrupo: {
          totalRegistros: 0,
          presentes: 0,
          ausencias: 0,
          tardanzas: 0,
          justificados: 0,
        },
      };

      mockAsistenciasService.obtenerResumenMensual.mockResolvedValue(response);

      const result = await controller.obtenerResumenMensual(
        'grupo-1',
        { mes: 3, anio: 2026 },
        mockAdminUser
      );

      expect(result).toEqual(response);
      expect(mockAsistenciasService.obtenerResumenMensual).toHaveBeenCalledWith(
        'grupo-1',
        { mes: 3, anio: 2026 },
        mockAdminUser.id
      );
    });
  });

  describe('PUT /grupos/:grupoId/asistencias', () => {
    it('debería registrar asistencias y devolver mensaje de éxito', async () => {
      const response = {
        grupoId: 'grupo-1',
        fecha: '2026-03-29',
        procesadas: 2,
        creadas: 1,
        actualizadas: 1,
      };
      const dto = {
        fecha: '2026-03-29',
        asistencias: [
          { estudianteId: 'est-1', estado: 'PRESENTE' as const },
          { estudianteId: 'est-2', estado: 'AUSENTE' as const },
        ],
      };

      mockAsistenciasService.registrarAsistenciasDelDia.mockResolvedValue(
        response
      );

      const result = await controller.registrarAsistenciasDelDia(
        'grupo-1',
        dto,
        mockAdminUser
      );

      expect(result).toEqual({
        resultado: response,
        message: 'Asistencias registradas exitosamente',
      });
      expect(
        mockAsistenciasService.registrarAsistenciasDelDia
      ).toHaveBeenCalledWith('grupo-1', dto, mockAdminUser.id);
    });
  });
});
