import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser, Roles } from '../common/decorators';
import type { RequestUser } from '../common/guards';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { TutoresService } from './tutores.service';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { TutorReadService } from './tutor-read.service';
import type { CreateTutorEstudianteDto } from './dto/create-tutor-estudiante.dto';
import type { QueryTutorEstudianteDto } from './dto/query-tutor-estudiante.dto';

@Controller()
export class TutoresController {
  constructor(
    private readonly tutoresService: TutoresService,
    private readonly tutorReadService: TutorReadService
  ) {}

  @Get('me/tutor-estudiantes')
  @Roles('TUTOR')
  listarEstudiantes(@CurrentUser() user: RequestUser) {
    return this.tutorReadService.listarEstudiantes(user.id);
  }

  @Get('me/tutor-estudiantes/:estudianteId/boletin')
  @Roles('TUTOR')
  obtenerBoletin(
    @Param('estudianteId') estudianteId: string,
    @CurrentUser() user: RequestUser
  ) {
    return this.tutorReadService.obtenerBoletin(user.id, estudianteId);
  }

  @Get('me/tutor-estudiantes/:estudianteId/asistencias')
  @Roles('TUTOR')
  obtenerAsistencias(
    @Param('estudianteId') estudianteId: string,
    @CurrentUser() user: RequestUser
  ) {
    return this.tutorReadService.obtenerAsistencias(user.id, estudianteId);
  }

  @Get('me/tutor-estudiantes/:estudianteId/calificaciones')
  @Roles('TUTOR')
  obtenerCalificaciones(
    @Param('estudianteId') estudianteId: string,
    @CurrentUser() user: RequestUser
  ) {
    return this.tutorReadService.obtenerCalificaciones(user.id, estudianteId);
  }

  @Get('me/tutor-estudiantes/:estudianteId/comunicados')
  @Roles('TUTOR')
  obtenerComunicados(
    @Param('estudianteId') estudianteId: string,
    @CurrentUser() user: RequestUser
  ) {
    return this.tutorReadService.obtenerComunicados(user.id, estudianteId);
  }

  @Post('instituciones/:institucionId/tutores-estudiantes')
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  async crear(
    @Param('institucionId') institucionId: string,
    @Body() dto: CreateTutorEstudianteDto,
    @CurrentUser() user: RequestUser
  ) {
    const vinculo = await this.tutoresService.crear(
      institucionId,
      dto,
      user.id
    );
    return { vinculo, message: 'Vínculo tutor-estudiante creado exitosamente' };
  }

  @Get('instituciones/:institucionId/tutores-estudiantes')
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  listar(
    @Param('institucionId') institucionId: string,
    @Query() query: QueryTutorEstudianteDto,
    @CurrentUser() user: RequestUser
  ) {
    return this.tutoresService.listar(institucionId, query, user.id);
  }

  @Delete('instituciones/:institucionId/tutores-estudiantes/:id')
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async desactivar(
    @Param('institucionId') institucionId: string,
    @Param('id') id: string,
    @CurrentUser() user: RequestUser
  ): Promise<void> {
    await this.tutoresService.desactivar(institucionId, id, user.id);
  }
}
