/**
 * Unit Tests - GruposController
 *
 * Criterios de aceptación testeados:
 * - [x] CRUD de grupos con estado activo/inactivo
 * - [x] Filtro por ciclo lectivo y estado
 * - [x] Asignación masiva de estudiantes (F4-007)
 * - [x] Listado de estudiantes de un grupo
 * - [x] Remoción de estudiantes de un grupo
 */

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { GruposController } from './grupos.controller';
import { GruposService } from './grupos.service';
import type { RequestUser } from '../common/guards';

describe('GruposController', () => {
  let controller: GruposController;

  const mockGruposService = {
    crear: jest.fn(),
    listar: jest.fn(),
    obtenerPorId: jest.fn(),
    actualizar: jest.fn(),
    eliminar: jest.fn(),
    asignarEstudiantes: jest.fn(),
    listarEstudiantes: jest.fn(),
    removerEstudiante: jest.fn(),
  };

  const mockUser: RequestUser = {
    id: 'admin-1',
    email: 'admin1@amauta.test',
    nombre: 'María',
    apellido: 'García',
    rol: 'ADMIN_ESCUELA',
  };

  const cuidGrupo = 'ckr0000000000000000000011';
  const cuidEducador = 'ckr0000000000000000000012';
  const cuidPeriodo = 'ckr0000000000000000000013';
  const cuidEstudiante1 = 'ckr0000000000000000000014';
  const cuidEstudiante2 = 'ckr0000000000000000000015';

  const mockGrupo = {
    id: cuidGrupo,
    nombre: '1A',
    grado: '1',
    seccion: 'A',
    educadorId: cuidEducador,
    institucionId: 'inst-1',
    periodoAcademicoId: cuidPeriodo,
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GruposController],
      providers: [{ provide: GruposService, useValue: mockGruposService }],
    }).compile();

    controller = module.get<GruposController>(GruposController);
    jest.clearAllMocks();
  });

  describe('POST /instituciones/:institucionId/grupos', () => {
    const createDto = {
      nombre: '1A',
      grado: '1',
      seccion: 'A',
      educadorId: cuidEducador,
      periodoAcademicoId: cuidPeriodo,
    };

    it('debería crear un grupo', async () => {
      mockGruposService.crear.mockResolvedValue(mockGrupo);

      const result = await controller.crear('inst-1', createDto, mockUser);

      expect(result).toEqual({
        grupo: mockGrupo,
        message: 'Grupo creado exitosamente',
      });
      expect(mockGruposService.crear).toHaveBeenCalledWith(
        'inst-1',
        createDto,
        mockUser.id
      );
    });
  });

  describe('GET /instituciones/:institucionId/grupos', () => {
    it('debería listar grupos con filtros', async () => {
      const mockResult = {
        grupos: [mockGrupo],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      mockGruposService.listar.mockResolvedValue(mockResult);

      const result = await controller.listar(
        'inst-1',
        { page: 1, limit: 10, activo: true, periodoAcademicoId: cuidPeriodo },
        mockUser
      );

      expect(result).toEqual(mockResult);
      expect(mockGruposService.listar).toHaveBeenCalledWith(
        'inst-1',
        { page: 1, limit: 10, activo: true, periodoAcademicoId: cuidPeriodo },
        mockUser.id
      );
    });
  });

  describe('GET /grupos/:id', () => {
    it('debería obtener un grupo', async () => {
      mockGruposService.obtenerPorId.mockResolvedValue(mockGrupo);

      const result = await controller.obtenerPorId('grupo-1', mockUser);

      expect(result).toEqual({
        grupo: mockGrupo,
        message: 'Grupo obtenido exitosamente',
      });
      expect(mockGruposService.obtenerPorId).toHaveBeenCalledWith(
        'grupo-1',
        mockUser.id
      );
    });
  });

  describe('PATCH /grupos/:id', () => {
    it('debería actualizar un grupo', async () => {
      const updateDto = { nombre: '2A' };
      mockGruposService.actualizar.mockResolvedValue({
        ...mockGrupo,
        ...updateDto,
      });

      const result = await controller.actualizar(
        'grupo-1',
        updateDto,
        mockUser
      );

      expect(result).toEqual({
        grupo: expect.objectContaining(updateDto),
        message: 'Grupo actualizado exitosamente',
      });
      expect(mockGruposService.actualizar).toHaveBeenCalledWith(
        'grupo-1',
        updateDto,
        mockUser.id
      );
    });
  });

  describe('DELETE /grupos/:id', () => {
    it('debería desactivar un grupo', async () => {
      mockGruposService.eliminar.mockResolvedValue(undefined);

      const result = await controller.eliminar('grupo-1', mockUser);

      expect(result).toBeUndefined();
      expect(mockGruposService.eliminar).toHaveBeenCalledWith(
        'grupo-1',
        mockUser.id
      );
    });
  });

  // =========================================
  // Tests de Asignación de Estudiantes (F4-007)
  // =========================================

  describe('POST /grupos/:id/estudiantes', () => {
    const asignarDto = {
      estudiantesIds: [cuidEstudiante1, cuidEstudiante2],
    };

    it('debería asignar estudiantes y retornar resumen', async () => {
      const mockResult = {
        agregados: [cuidEstudiante1, cuidEstudiante2],
        duplicados: [],
        errores: [],
      };
      mockGruposService.asignarEstudiantes.mockResolvedValue(mockResult);

      const result = await controller.asignarEstudiantes(
        cuidGrupo,
        asignarDto,
        mockUser
      );

      expect(result).toEqual({
        resultado: mockResult,
        message: 'Asignación de estudiantes completada',
      });
      expect(mockGruposService.asignarEstudiantes).toHaveBeenCalledWith(
        cuidGrupo,
        asignarDto,
        mockUser.id
      );
    });
  });

  describe('GET /grupos/:id/estudiantes', () => {
    const mockEstudiante = {
      id: cuidEstudiante1,
      email: 'estudiante1@amauta.test',
      nombre: 'Juan',
      apellido: 'Pérez',
      inscritoEn: new Date(),
    };

    it('debería listar estudiantes del grupo', async () => {
      const mockResult = {
        estudiantes: [mockEstudiante],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      mockGruposService.listarEstudiantes.mockResolvedValue(mockResult);

      const result = await controller.listarEstudiantes(
        cuidGrupo,
        { page: 1, limit: 10 },
        mockUser
      );

      expect(result).toEqual(mockResult);
      expect(mockGruposService.listarEstudiantes).toHaveBeenCalledWith(
        cuidGrupo,
        { page: 1, limit: 10 },
        mockUser.id
      );
    });
  });

  describe('DELETE /grupos/:id/estudiantes/:estudianteId', () => {
    it('debería remover un estudiante del grupo', async () => {
      mockGruposService.removerEstudiante.mockResolvedValue(undefined);

      const result = await controller.removerEstudiante(
        cuidGrupo,
        cuidEstudiante1,
        mockUser
      );

      expect(result).toBeUndefined();
      expect(mockGruposService.removerEstudiante).toHaveBeenCalledWith(
        cuidGrupo,
        cuidEstudiante1,
        mockUser.id
      );
    });
  });
});
