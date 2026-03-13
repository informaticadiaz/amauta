/**
 * Controller de Cursos
 *
 * Maneja los endpoints CRUD de cursos
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { CursosService, type CursoConEducador } from './cursos.service';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import {
  InscripcionesService,
  type InscripcionConCurso,
} from '../inscripciones/inscripciones.service';
import type { CreateCursoDto } from './dto/create-curso.dto';
import type { UpdateCursoDto, PublicarCursoDto } from './dto/update-curso.dto';
import type { QueryCursosDto } from './dto/query-cursos.dto';
import { Public, CurrentUser, Roles } from '../common/decorators';
import type { RequestUser } from '../common/guards';

interface CursoResponse {
  curso: CursoConEducador;
  message: string;
}

interface ListaCursosResponse {
  cursos: CursoConEducador[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface InscripcionResponse {
  inscripcion: InscripcionConCurso;
  message: string;
}

interface EstadoInscripcionResponse {
  inscripcion: InscripcionConCurso | null;
  inscrito: boolean;
}

@Controller('cursos')
export class CursosController {
  constructor(
    private readonly cursosService: CursosService,
    private readonly inscripcionesService: InscripcionesService
  ) {}

  /**
   * Listar cursos públicos
   *
   * GET /api/v1/cursos
   *
   * Query params:
   * - page: número de página (default: 1)
   * - limit: resultados por página (default: 10, max: 100)
   * - categoriaId: filtrar por categoría
   * - nivel: filtrar por nivel (PRINCIPIANTE, INTERMEDIO, AVANZADO)
   * - buscar: búsqueda por título/descripción
   * - ordenarPor: campo para ordenar (createdAt, titulo, publicadoEn)
   * - orden: dirección (asc, desc)
   */
  @Public()
  @Get()
  async listar(@Query() query: QueryCursosDto): Promise<ListaCursosResponse> {
    return this.cursosService.listar(query);
  }

  /**
   * Listar mis cursos (como educador)
   *
   * GET /api/v1/cursos/mis-cursos
   */
  @Get('mis-cursos')
  @Roles('EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async listarMisCursos(
    @CurrentUser() user: RequestUser,
    @Query() query: QueryCursosDto
  ): Promise<ListaCursosResponse> {
    return this.cursosService.listarMisCursos(user.id, query);
  }

  /**
   * Obtener curso por slug
   *
   * GET /api/v1/cursos/slug/:slug
   */
  @Public()
  @Get('slug/:slug')
  async obtenerPorSlug(@Param('slug') slug: string): Promise<CursoResponse> {
    const curso = await this.cursosService.obtenerPorSlug(slug);
    return {
      curso,
      message: 'Curso obtenido exitosamente',
    };
  }

  /**
   * Inscribirse en un curso
   *
   * POST /api/v1/cursos/:id/inscribir
   */
  @Post(':id/inscribir')
  @Roles('ESTUDIANTE', 'EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async inscribirse(
    @Param('id') cursoId: string,
    @CurrentUser() user: RequestUser
  ): Promise<InscripcionResponse> {
    const inscripcion = await this.inscripcionesService.inscribirse(
      cursoId,
      user.id
    );
    return {
      inscripcion,
      message: 'Te has inscrito exitosamente en el curso',
    };
  }

  /**
   * Cancelar inscripción en un curso
   *
   * DELETE /api/v1/cursos/:id/inscribir
   */
  @Delete(':id/inscribir')
  @Roles('ESTUDIANTE', 'EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelarInscripcion(
    @Param('id') cursoId: string,
    @CurrentUser() user: RequestUser
  ): Promise<void> {
    await this.inscripcionesService.cancelarInscripcion(cursoId, user.id);
  }

  /**
   * Obtener estado de inscripción en un curso
   *
   * GET /api/v1/cursos/:id/inscripcion
   */
  @Get(':id/inscripcion')
  @Roles('ESTUDIANTE', 'EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async obtenerEstadoInscripcion(
    @Param('id') cursoId: string,
    @CurrentUser() user: RequestUser
  ): Promise<EstadoInscripcionResponse> {
    const inscripcion =
      await this.inscripcionesService.obtenerEstadoInscripcion(
        cursoId,
        user.id
      );
    return {
      inscripcion,
      inscrito: inscripcion !== null && inscripcion.estado === 'ACTIVO',
    };
  }

  /**
   * Obtener curso por ID
   *
   * GET /api/v1/cursos/:id
   */
  @Public()
  @Get(':id')
  async obtenerPorId(@Param('id') id: string): Promise<CursoResponse> {
    const curso = await this.cursosService.obtenerPorId(id);
    return {
      curso,
      message: 'Curso obtenido exitosamente',
    };
  }

  /**
   * Crear un nuevo curso
   *
   * POST /api/v1/cursos
   */
  @Post()
  @Roles('EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async crear(
    @Body() dto: CreateCursoDto,
    @CurrentUser() user: RequestUser
  ): Promise<CursoResponse> {
    const curso = await this.cursosService.crear(dto, user.id);
    return {
      curso,
      message: 'Curso creado exitosamente',
    };
  }

  /**
   * Actualizar un curso
   *
   * PATCH /api/v1/cursos/:id
   */
  @Patch(':id')
  @Roles('EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async actualizar(
    @Param('id') id: string,
    @Body() dto: UpdateCursoDto,
    @CurrentUser() user: RequestUser
  ): Promise<CursoResponse> {
    const curso = await this.cursosService.actualizar(id, dto, user.id);
    return {
      curso,
      message: 'Curso actualizado exitosamente',
    };
  }

  /**
   * Publicar o despublicar un curso
   *
   * PATCH /api/v1/cursos/:id/publicar
   */
  @Patch(':id/publicar')
  @Roles('EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async cambiarEstadoPublicacion(
    @Param('id') id: string,
    @Body() dto: PublicarCursoDto,
    @CurrentUser() user: RequestUser
  ): Promise<CursoResponse> {
    const curso = await this.cursosService.cambiarEstadoPublicacion(
      id,
      dto,
      user.id
    );
    const message = dto.publicar
      ? 'Curso publicado exitosamente'
      : 'Curso despublicado';
    return {
      curso,
      message,
    };
  }

  /**
   * Eliminar un curso (soft delete)
   *
   * DELETE /api/v1/cursos/:id
   */
  @Delete(':id')
  @Roles('EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminar(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser
  ): Promise<void> {
    await this.cursosService.eliminar(id, user.id);
  }
}
