/**
 * Servicio de Cursos
 *
 * Maneja la lógica de negocio para gestión de cursos
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { PrismaService } from '../prisma/prisma.service';
import { createCursoSchema, type CreateCursoDto } from './dto/create-curso.dto';
import {
  updateCursoSchema,
  publicarCursoSchema,
  type UpdateCursoDto,
  type PublicarCursoDto,
} from './dto/update-curso.dto';
import { queryCursosSchema, type QueryCursosDto } from './dto/query-cursos.dto';
import type { EstadoCurso, Nivel } from '@prisma/client';

export interface CursoConEducador {
  id: string;
  titulo: string;
  descripcion: string;
  slug: string;
  imagen: string | null;
  nivel: Nivel;
  estado: EstadoCurso;
  duracion: number | null;
  idioma: string;
  publicadoEn: Date | null;
  createdAt: Date;
  updatedAt: Date;
  educador: {
    id: string;
    nombre: string;
    apellido: string;
    avatar: string | null;
  };
  categoria: {
    id: string;
    nombre: string;
    slug: string;
  };
  _count: {
    lecciones: number;
    inscripciones: number;
  };
}

interface ListaCursosResult {
  cursos: CursoConEducador[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class CursosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Genera un slug único a partir del título
   */
  private async generarSlug(titulo: string): Promise<string> {
    const baseSlug = titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9\s-]/g, '') // Solo alfanuméricos
      .trim()
      .replace(/\s+/g, '-') // Espacios a guiones
      .replace(/-+/g, '-'); // Múltiples guiones a uno

    // Verificar si el slug existe
    let slug = baseSlug;
    let counter = 1;

    while (await this.prisma.curso.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Crea un nuevo curso
   */
  async crear(
    dto: CreateCursoDto,
    educadorId: string
  ): Promise<CursoConEducador> {
    // Validar datos de entrada
    const result = createCursoSchema.safeParse(dto);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? 'Datos inválidos';
      throw new BadRequestException(message);
    }

    const {
      titulo,
      descripcion,
      categoriaId,
      nivel,
      imagen,
      duracion,
      idioma,
    } = result.data;

    // Verificar que la categoría existe
    const categoria = await this.prisma.categoria.findUnique({
      where: { id: categoriaId },
    });

    if (!categoria) {
      throw new BadRequestException('La categoría no existe');
    }

    // Generar slug único
    const slug = await this.generarSlug(titulo);

    // Crear el curso
    const curso = await this.prisma.curso.create({
      data: {
        titulo,
        descripcion,
        slug,
        educadorId,
        categoriaId,
        nivel: nivel as Nivel,
        imagen,
        duracion,
        idioma,
      },
      include: {
        educador: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            avatar: true,
          },
        },
        categoria: {
          select: {
            id: true,
            nombre: true,
            slug: true,
          },
        },
        _count: {
          select: {
            lecciones: true,
            inscripciones: true,
          },
        },
      },
    });

    return curso;
  }

  /**
   * Lista cursos públicos con filtros y paginación
   */
  async listar(query: QueryCursosDto): Promise<ListaCursosResult> {
    // Validar query params
    const result = queryCursosSchema.safeParse(query);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? 'Parámetros inválidos';
      throw new BadRequestException(message);
    }

    const {
      page,
      limit,
      categoriaId,
      nivel,
      estado,
      buscar,
      ordenarPor,
      orden,
    } = result.data;

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: {
      estado?: EstadoCurso;
      categoriaId?: string;
      nivel?: Nivel;
      OR?: Array<
        | { titulo: { contains: string; mode: 'insensitive' } }
        | { descripcion: { contains: string; mode: 'insensitive' } }
      >;
    } = {
      // Por defecto solo cursos publicados para listado público
      estado: estado ?? ('PUBLICADO' as EstadoCurso),
    };

    if (categoriaId) {
      where.categoriaId = categoriaId;
    }

    if (nivel) {
      where.nivel = nivel as Nivel;
    }

    if (buscar) {
      where.OR = [
        { titulo: { contains: buscar, mode: 'insensitive' } },
        { descripcion: { contains: buscar, mode: 'insensitive' } },
      ];
    }

    // Ejecutar queries en paralelo
    const [cursos, total] = await Promise.all([
      this.prisma.curso.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [ordenarPor]: orden },
        include: {
          educador: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              avatar: true,
            },
          },
          categoria: {
            select: {
              id: true,
              nombre: true,
              slug: true,
            },
          },
          _count: {
            select: {
              lecciones: true,
              inscripciones: true,
            },
          },
        },
      }),
      this.prisma.curso.count({ where }),
    ]);

    return {
      cursos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Lista los cursos de un educador (mis cursos)
   */
  async listarMisCursos(
    educadorId: string,
    query: QueryCursosDto
  ): Promise<ListaCursosResult> {
    // Validar query params
    const result = queryCursosSchema.safeParse(query);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? 'Parámetros inválidos';
      throw new BadRequestException(message);
    }

    const { page, limit, estado, ordenarPor, orden } = result.data;

    const skip = (page - 1) * limit;

    // Filtrar por educador
    const where: {
      educadorId: string;
      estado?: EstadoCurso;
    } = {
      educadorId,
    };

    // Si se especifica estado, filtrar por él (sino mostrar todos)
    if (estado) {
      where.estado = estado as EstadoCurso;
    }

    const [cursos, total] = await Promise.all([
      this.prisma.curso.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [ordenarPor]: orden },
        include: {
          educador: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              avatar: true,
            },
          },
          categoria: {
            select: {
              id: true,
              nombre: true,
              slug: true,
            },
          },
          _count: {
            select: {
              lecciones: true,
              inscripciones: true,
            },
          },
        },
      }),
      this.prisma.curso.count({ where }),
    ]);

    return {
      cursos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtiene un curso por ID
   */
  async obtenerPorId(id: string): Promise<CursoConEducador> {
    const curso = await this.prisma.curso.findUnique({
      where: { id },
      include: {
        educador: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            avatar: true,
          },
        },
        categoria: {
          select: {
            id: true,
            nombre: true,
            slug: true,
          },
        },
        _count: {
          select: {
            lecciones: true,
            inscripciones: true,
          },
        },
      },
    });

    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }

    return curso;
  }

  /**
   * Obtiene un curso por slug
   */
  async obtenerPorSlug(slug: string): Promise<CursoConEducador> {
    const curso = await this.prisma.curso.findUnique({
      where: { slug },
      include: {
        educador: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            avatar: true,
          },
        },
        categoria: {
          select: {
            id: true,
            nombre: true,
            slug: true,
          },
        },
        _count: {
          select: {
            lecciones: true,
            inscripciones: true,
          },
        },
      },
    });

    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }

    return curso;
  }

  /**
   * Actualiza un curso (solo el propietario)
   */
  async actualizar(
    id: string,
    dto: UpdateCursoDto,
    usuarioId: string
  ): Promise<CursoConEducador> {
    // Validar datos de entrada
    const result = updateCursoSchema.safeParse(dto);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? 'Datos inválidos';
      throw new BadRequestException(message);
    }

    // Verificar que el curso existe
    const cursoExistente = await this.prisma.curso.findUnique({
      where: { id },
      select: { educadorId: true, titulo: true, slug: true },
    });

    if (!cursoExistente) {
      throw new NotFoundException('Curso no encontrado');
    }

    // Verificar propiedad
    if (cursoExistente.educadorId !== usuarioId) {
      throw new ForbiddenException('No tienes permiso para editar este curso');
    }

    const {
      titulo,
      descripcion,
      categoriaId,
      nivel,
      imagen,
      duracion,
      idioma,
    } = result.data;

    // Si cambia el título, regenerar slug
    let slug = cursoExistente.slug;
    if (titulo && titulo !== cursoExistente.titulo) {
      slug = await this.generarSlug(titulo);
    }

    // Verificar categoría si se proporciona
    if (categoriaId) {
      const categoria = await this.prisma.categoria.findUnique({
        where: { id: categoriaId },
      });
      if (!categoria) {
        throw new BadRequestException('La categoría no existe');
      }
    }

    // Actualizar curso
    const curso = await this.prisma.curso.update({
      where: { id },
      data: {
        ...(titulo && { titulo, slug }),
        ...(descripcion && { descripcion }),
        ...(categoriaId && { categoriaId }),
        ...(nivel && { nivel: nivel as Nivel }),
        ...(imagen !== undefined && { imagen }),
        ...(duracion !== undefined && { duracion }),
        ...(idioma && { idioma }),
      },
      include: {
        educador: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            avatar: true,
          },
        },
        categoria: {
          select: {
            id: true,
            nombre: true,
            slug: true,
          },
        },
        _count: {
          select: {
            lecciones: true,
            inscripciones: true,
          },
        },
      },
    });

    return curso;
  }

  /**
   * Publica o despublica un curso
   */
  async cambiarEstadoPublicacion(
    id: string,
    dto: PublicarCursoDto,
    usuarioId: string
  ): Promise<CursoConEducador> {
    // Validar datos
    const result = publicarCursoSchema.safeParse(dto);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? 'Datos inválidos';
      throw new BadRequestException(message);
    }

    // Verificar que el curso existe
    const cursoExistente = await this.prisma.curso.findUnique({
      where: { id },
      select: { educadorId: true, estado: true },
    });

    if (!cursoExistente) {
      throw new NotFoundException('Curso no encontrado');
    }

    // Verificar propiedad
    if (cursoExistente.educadorId !== usuarioId) {
      throw new ForbiddenException(
        'No tienes permiso para modificar este curso'
      );
    }

    const { publicar } = result.data;

    // Determinar nuevo estado
    const nuevoEstado: EstadoCurso = publicar ? 'PUBLICADO' : 'BORRADOR';
    const publicadoEn = publicar ? new Date() : null;

    const curso = await this.prisma.curso.update({
      where: { id },
      data: {
        estado: nuevoEstado,
        publicadoEn,
      },
      include: {
        educador: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            avatar: true,
          },
        },
        categoria: {
          select: {
            id: true,
            nombre: true,
            slug: true,
          },
        },
        _count: {
          select: {
            lecciones: true,
            inscripciones: true,
          },
        },
      },
    });

    return curso;
  }

  /**
   * Elimina un curso (soft delete - cambia estado a ARCHIVADO)
   */
  async eliminar(id: string, usuarioId: string): Promise<void> {
    // Verificar que el curso existe
    const curso = await this.prisma.curso.findUnique({
      where: { id },
      select: { educadorId: true },
    });

    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }

    // Verificar propiedad
    if (curso.educadorId !== usuarioId) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar este curso'
      );
    }

    // Soft delete: cambiar estado a ARCHIVADO
    await this.prisma.curso.update({
      where: { id },
      data: { estado: 'ARCHIVADO' },
    });
  }
}
