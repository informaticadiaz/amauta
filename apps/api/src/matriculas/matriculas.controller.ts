import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser, Roles } from '../common/decorators';
import type { RequestUser } from '../common/guards';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { MatriculasService } from './matriculas.service';
import type { CreateMatriculaDto } from './dto/create-matricula.dto';
import type { QueryMatriculasDto } from './dto/query-matriculas.dto';
import type { UpdateMatriculaDto } from './dto/update-matricula.dto';

@Controller()
export class MatriculasController {
  constructor(private readonly matriculasService: MatriculasService) {}

  @Post('instituciones/:institucionId/matriculas')
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  async crear(
    @Param('institucionId') institucionId: string,
    @Body() dto: CreateMatriculaDto,
    @CurrentUser() user: RequestUser
  ) {
    const matricula = await this.matriculasService.crear(
      institucionId,
      dto,
      user.id
    );
    return { matricula, message: 'Matrícula creada exitosamente' };
  }

  @Get('instituciones/:institucionId/matriculas')
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  listar(
    @Param('institucionId') institucionId: string,
    @Query() query: QueryMatriculasDto,
    @CurrentUser() user: RequestUser
  ) {
    return this.matriculasService.listar(institucionId, query, user.id);
  }

  @Patch('matriculas/:id')
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  async actualizar(
    @Param('id') id: string,
    @Body() dto: UpdateMatriculaDto,
    @CurrentUser() user: RequestUser
  ) {
    const matricula = await this.matriculasService.actualizar(id, dto, user.id);
    return { matricula, message: 'Matrícula actualizada exitosamente' };
  }
}
