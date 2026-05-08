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
  Inject,
} from '@nestjs/common';
import { Roles, CurrentUser } from '../common/decorators';
import type { RequestUser } from '../common/guards';
import {
  ComunicadosService,
  type ComunicadoResponse,
  type ListaComunicadosResponse,
} from './comunicados.service';
import type { QueryComunicadosDto } from './dto/query-comunicados.dto';

@Controller()
export class ComunicadosController {
  constructor(
    @Inject(ComunicadosService)
    private readonly comunicadosService: ComunicadosService
  ) {}

  @Get('me/comunicados')
  async getMisComunicados(
    @Query() query: QueryComunicadosDto,
    @CurrentUser() user: RequestUser
  ): Promise<ListaComunicadosResponse> {
    return this.comunicadosService.getMisComunicados(user.id, query);
  }

  @Post('me/comunicados')
  @Roles('ADMIN_ESCUELA', 'EDUCADOR', 'SUPER_ADMIN')
  async crearMiComunicado(
    @Body() dto: unknown,
    @CurrentUser() user: RequestUser
  ): Promise<ComunicadoResponse> {
    return this.comunicadosService.crearParaInstitucionDelUsuario(
      dto,
      user.id,
      user.rol
    );
  }

  @Post('instituciones/:id/comunicados')
  @Roles('ADMIN_ESCUELA', 'EDUCADOR', 'SUPER_ADMIN')
  async crear(
    @Param('id') id: string,
    @Body() dto: unknown,
    @CurrentUser() user: RequestUser
  ): Promise<ComunicadoResponse> {
    return this.comunicadosService.crear(id, dto, user.id);
  }

  @Get('instituciones/:id/comunicados')
  async listar(
    @Param('id') id: string,
    @Query() query: QueryComunicadosDto
  ): Promise<ListaComunicadosResponse> {
    return this.comunicadosService.listar(id, query);
  }

  @Get('instituciones/:id/comunicados/:comId')
  async obtener(
    @Param('id') id: string,
    @Param('comId') comId: string
  ): Promise<ComunicadoResponse> {
    return this.comunicadosService.obtener(id, comId);
  }

  @Patch('instituciones/:id/comunicados/:comId')
  @Roles('ADMIN_ESCUELA', 'EDUCADOR', 'SUPER_ADMIN')
  async actualizar(
    @Param('id') id: string,
    @Param('comId') comId: string,
    @Body() dto: unknown,
    @CurrentUser() user: RequestUser
  ): Promise<ComunicadoResponse> {
    return this.comunicadosService.actualizar(id, comId, dto, {
      id: user.id,
      rol: user.rol,
    });
  }

  @Delete('instituciones/:id/comunicados/:comId')
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async archivar(
    @Param('id') id: string,
    @Param('comId') comId: string,
    @CurrentUser() user: RequestUser
  ): Promise<void> {
    return this.comunicadosService.archivar(id, comId, {
      id: user.id,
      rol: user.rol,
    });
  }
}
