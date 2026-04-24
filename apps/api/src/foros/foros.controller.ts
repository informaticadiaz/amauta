import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser, Roles } from '../common/decorators';
import type { RequestUser } from '../common/guards';
import {
  ForosService,
  type ForoPostDetalleResponse,
  type ForoPostListItem,
  type ForoRespuestaItem,
  type ListaForoPostsResponse,
} from './foros.service';
import type {
  CreateForoPostDto,
  CreateForoRespuestaDto,
  QueryForosDto,
} from './dto';

interface ForoPostWrapper {
  post: ForoPostListItem;
  message: string;
}

interface ForoDetalleWrapper {
  post: ForoPostDetalleResponse;
  message: string;
}

interface ForoRespuestaWrapper {
  respuesta: ForoRespuestaItem;
  message: string;
}

@Controller()
export class ForosController {
  constructor(
    @Inject(ForosService)
    private readonly forosService: ForosService
  ) {}

  @Get('cursos/:id/foros')
  @Roles('ESTUDIANTE', 'EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async listarPosts(
    @Param('id') cursoId: string,
    @Query() query: QueryForosDto,
    @CurrentUser() user: RequestUser
  ): Promise<ListaForoPostsResponse> {
    return this.forosService.listarPosts(cursoId, query, user.id);
  }

  @Post('cursos/:id/foros')
  @Roles('ESTUDIANTE', 'EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async crearPost(
    @Param('id') cursoId: string,
    @Body() dto: CreateForoPostDto,
    @CurrentUser() user: RequestUser
  ): Promise<ForoPostWrapper> {
    const post = await this.forosService.crearPost(cursoId, dto, user.id);
    return {
      post,
      message: 'Post creado exitosamente',
    };
  }

  @Get('cursos/:id/foros/:postId')
  @Roles('ESTUDIANTE', 'EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async obtenerDetallePost(
    @Param('id') cursoId: string,
    @Param('postId') postId: string,
    @CurrentUser() user: RequestUser
  ): Promise<ForoDetalleWrapper> {
    const post = await this.forosService.obtenerDetallePost(
      cursoId,
      postId,
      user.id
    );

    return {
      post,
      message: 'Post obtenido exitosamente',
    };
  }

  @Post('cursos/:id/foros/:postId/respuestas')
  @Roles('ESTUDIANTE', 'EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async responderPost(
    @Param('id') cursoId: string,
    @Param('postId') postId: string,
    @Body() dto: CreateForoRespuestaDto,
    @CurrentUser() user: RequestUser
  ): Promise<ForoRespuestaWrapper> {
    const respuesta = await this.forosService.responderPost(
      cursoId,
      postId,
      dto,
      user.id
    );

    return {
      respuesta,
      message: 'Respuesta creada exitosamente',
    };
  }

  @Post('foros/respuestas/:respuestaId/solucion')
  @Roles('ESTUDIANTE', 'EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async marcarRespuestaComoSolucion(
    @Param('respuestaId') respuestaId: string,
    @CurrentUser() user: RequestUser
  ): Promise<ForoRespuestaWrapper> {
    const respuesta = await this.forosService.marcarRespuestaComoSolucion(
      respuestaId,
      user.id
    );

    return {
      respuesta,
      message: 'Respuesta marcada como solución exitosamente',
    };
  }

  @Post('foros/respuestas/:respuestaId/util')
  @Roles('ESTUDIANTE', 'EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async marcarRespuestaComoUtil(
    @Param('respuestaId') respuestaId: string,
    @CurrentUser() user: RequestUser
  ): Promise<ForoRespuestaWrapper> {
    const respuesta = await this.forosService.marcarRespuestaComoUtil(
      respuestaId,
      user.id
    );

    return {
      respuesta,
      message: 'Respuesta marcada como útil exitosamente',
    };
  }

  @Delete('cursos/:id/foros/:postId')
  @Roles('ESTUDIANTE', 'EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminarPost(
    @Param('id') cursoId: string,
    @Param('postId') postId: string,
    @CurrentUser() user: RequestUser
  ): Promise<void> {
    await this.forosService.eliminarPost(cursoId, postId, user.id);
  }

  @Delete('cursos/:id/foros/:postId/respuestas/:respuestaId')
  @Roles('ESTUDIANTE', 'EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminarRespuesta(
    @Param('id') cursoId: string,
    @Param('postId') postId: string,
    @Param('respuestaId') respuestaId: string,
    @CurrentUser() user: RequestUser
  ): Promise<void> {
    await this.forosService.eliminarRespuesta(
      cursoId,
      postId,
      respuestaId,
      user.id
    );
  }

  @Post('cursos/:id/foros/:postId/cerrar')
  @Roles('ESTUDIANTE', 'EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async cerrarPost(
    @Param('id') cursoId: string,
    @Param('postId') postId: string,
    @CurrentUser() user: RequestUser
  ): Promise<ForoPostWrapper> {
    const post = await this.forosService.cerrarPost(cursoId, postId, user.id);

    return {
      post,
      message: 'Thread cerrado exitosamente',
    };
  }
}
