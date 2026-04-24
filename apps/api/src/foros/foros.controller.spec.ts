import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ForosController } from './foros.controller';
import { ForosService } from './foros.service';
import type { RequestUser } from '../common/guards';

describe('ForosController', () => {
  let controller: ForosController;

  const mockForosService = {
    listarPosts: jest.fn(),
    crearPost: jest.fn(),
    obtenerDetallePost: jest.fn(),
    responderPost: jest.fn(),
    marcarRespuestaComoSolucion: jest.fn(),
    marcarRespuestaComoUtil: jest.fn(),
    eliminarPost: jest.fn(),
    eliminarRespuesta: jest.fn(),
    cerrarPost: jest.fn(),
  };

  const mockUser: RequestUser = {
    id: 'ckr0000000000000000001201',
    email: 'estudiante1@amauta.test',
    nombre: 'Ana',
    apellido: 'Alvarez',
    rol: 'ESTUDIANTE',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForosController],
      providers: [{ provide: ForosService, useValue: mockForosService }],
    }).compile();

    controller = module.get<ForosController>(ForosController);
    jest.resetAllMocks();
  });

  it('debería delegar el listado de posts al service', async () => {
    const response = {
      posts: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    mockForosService.listarPosts.mockResolvedValue(response);

    const result = await controller.listarPosts(
      'curso-1',
      { page: 1, limit: 20 },
      mockUser
    );

    expect(result).toEqual(response);
    expect(mockForosService.listarPosts).toHaveBeenCalledWith(
      'curso-1',
      { page: 1, limit: 20 },
      mockUser.id
    );
  });

  it('debería crear un post y devolver mensaje de éxito', async () => {
    const post = { id: 'post-1', tipo: 'PREGUNTA' };
    const dto = {
      tipo: 'PREGUNTA' as const,
      titulo: 'Consulta',
      contenido: 'Necesito ayuda',
    };
    mockForosService.crearPost.mockResolvedValue(post);

    const result = await controller.crearPost('curso-1', dto, mockUser);

    expect(result).toEqual({
      post,
      message: 'Post creado exitosamente',
    });
    expect(mockForosService.crearPost).toHaveBeenCalledWith(
      'curso-1',
      dto,
      mockUser.id
    );
  });

  it('debería responder un post y devolver mensaje de éxito', async () => {
    const respuesta = { id: 'respuesta-1' };
    const dto = { contenido: 'Acá va la explicación' };
    mockForosService.responderPost.mockResolvedValue(respuesta);

    const result = await controller.responderPost(
      'curso-1',
      'post-1',
      dto,
      mockUser
    );

    expect(result).toEqual({
      respuesta,
      message: 'Respuesta creada exitosamente',
    });
    expect(mockForosService.responderPost).toHaveBeenCalledWith(
      'curso-1',
      'post-1',
      dto,
      mockUser.id
    );
  });

  it('debería marcar una respuesta como solución y devolver mensaje de éxito', async () => {
    const respuesta = {
      id: 'respuesta-1',
      esSolucion: true,
      esUtil: 2,
      marcoUtil: false,
    };
    mockForosService.marcarRespuestaComoSolucion.mockResolvedValue(respuesta);

    const result = await controller.marcarRespuestaComoSolucion(
      'respuesta-1',
      mockUser
    );

    expect(result).toEqual({
      respuesta,
      message: 'Respuesta marcada como solución exitosamente',
    });
    expect(mockForosService.marcarRespuestaComoSolucion).toHaveBeenCalledWith(
      'respuesta-1',
      mockUser.id
    );
  });

  it('debería marcar una respuesta como útil y devolver mensaje de éxito', async () => {
    const respuesta = {
      id: 'respuesta-1',
      esSolucion: false,
      esUtil: 4,
      marcoUtil: true,
    };
    mockForosService.marcarRespuestaComoUtil.mockResolvedValue(respuesta);

    const result = await controller.marcarRespuestaComoUtil(
      'respuesta-1',
      mockUser
    );

    expect(result).toEqual({
      respuesta,
      message: 'Respuesta marcada como útil exitosamente',
    });
    expect(mockForosService.marcarRespuestaComoUtil).toHaveBeenCalledWith(
      'respuesta-1',
      mockUser.id
    );
  });
});
