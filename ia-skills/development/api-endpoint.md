# Skill: API Endpoint

> Agrega un nuevo endpoint a un módulo existente.

---

## Uso

```
Agrega un endpoint [MÉTODO] [RUTA] al módulo [módulo] que [descripción]
```

**Ejemplos:**

```
Agrega un endpoint GET /cursos/:id/estadisticas al módulo cursos que devuelve estadísticas del curso

Agrega un endpoint POST /lecciones/:id/duplicar al módulo lecciones que duplica una lección
```

---

## Parámetros

| Parámetro     | Descripción          | Ejemplo                          |
| ------------- | -------------------- | -------------------------------- |
| `método`      | HTTP method          | `GET`, `POST`, `PATCH`, `DELETE` |
| `ruta`        | Path del endpoint    | `/cursos/:id/estadisticas`       |
| `módulo`      | Módulo donde agregar | `cursos`                         |
| `descripción` | Qué hace el endpoint | `devuelve estadísticas`          |
| `roles`       | Roles requeridos     | `EDUCADOR+`                      |
| `público`     | Si es público        | `true/false`                     |

---

## Archivos a Modificar

1. **Controller**: Agregar método con decoradores
2. **Service**: Agregar lógica de negocio
3. **DTOs** (si necesario): Crear schemas de request/response

---

## Templates

### Endpoint GET (obtener datos)

```typescript
// En controller

/**
 * Obtener estadísticas del curso
 *
 * GET /api/v1/cursos/:id/estadisticas
 */
@Get(':id/estadisticas')
@Roles('EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
async obtenerEstadisticas(
  @Param('id') id: string,
  @CurrentUser() user: RequestUser
): Promise<EstadisticasResponse> {
  return this.cursosService.obtenerEstadisticas(id, user.id);
}

// En service

interface EstadisticasResponse {
  totalInscritos: number;
  promedioProgreso: number;
  leccionesCompletadas: number;
  // ...
}

async obtenerEstadisticas(
  cursoId: string,
  usuarioId: string
): Promise<EstadisticasResponse> {
  // Verificar que el curso existe
  const curso = await this.prisma.curso.findUnique({
    where: { id: cursoId },
    select: { educadorId: true },
  });

  if (!curso) {
    throw new NotFoundException('Curso no encontrado');
  }

  // Verificar propiedad
  if (curso.educadorId !== usuarioId) {
    throw new ForbiddenException('No tienes acceso a estas estadísticas');
  }

  // Calcular estadísticas
  const [totalInscritos, inscripciones] = await Promise.all([
    this.prisma.inscripcion.count({
      where: { cursoId, estado: 'ACTIVO' },
    }),
    this.prisma.inscripcion.findMany({
      where: { cursoId, estado: 'ACTIVO' },
      select: { progreso: true },
    }),
  ]);

  const promedioProgreso = inscripciones.length > 0
    ? inscripciones.reduce((sum, i) => sum + i.progreso, 0) / inscripciones.length
    : 0;

  return {
    totalInscritos,
    promedioProgreso: Math.round(promedioProgreso),
    // ...
  };
}
```

### Endpoint POST (acción)

```typescript
// En controller

/**
 * Duplicar una lección
 *
 * POST /api/v1/lecciones/:id/duplicar
 */
@Post(':id/duplicar')
@Roles('EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
async duplicar(
  @Param('id') id: string,
  @CurrentUser() user: RequestUser
): Promise<LeccionResponseWrapper> {
  const leccion = await this.leccionesService.duplicar(id, user.id);
  return {
    leccion,
    message: 'Lección duplicada exitosamente',
  };
}

// En service

async duplicar(leccionId: string, usuarioId: string): Promise<LeccionResponse> {
  // Obtener lección original
  const original = await this.prisma.leccion.findUnique({
    where: { id: leccionId },
    include: { curso: { select: { educadorId: true } } },
  });

  if (!original) {
    throw new NotFoundException('Lección no encontrada');
  }

  // Verificar propiedad del curso
  if (original.curso.educadorId !== usuarioId) {
    throw new ForbiddenException('No tienes permiso');
  }

  // Obtener siguiente orden
  const ultimaLeccion = await this.prisma.leccion.findFirst({
    where: { cursoId: original.cursoId },
    orderBy: { orden: 'desc' },
    select: { orden: true },
  });

  // Crear copia
  return this.prisma.leccion.create({
    data: {
      titulo: `${original.titulo} (copia)`,
      descripcion: original.descripcion,
      cursoId: original.cursoId,
      tipo: original.tipo,
      duracion: original.duracion,
      contenido: original.contenido,
      orden: (ultimaLeccion?.orden ?? 0) + 1,
      publicada: false, // Siempre como borrador
    },
  });
}
```

### Endpoint PATCH (actualización parcial)

```typescript
// En controller

/**
 * Marcar curso como destacado
 *
 * PATCH /api/v1/cursos/:id/destacar
 */
@Patch(':id/destacar')
@Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
async destacar(
  @Param('id') id: string,
  @Body() dto: DestacarCursoDto
): Promise<CursoResponse> {
  const curso = await this.cursosService.destacar(id, dto);
  return {
    curso,
    message: dto.destacado ? 'Curso destacado' : 'Curso ya no está destacado',
  };
}

// DTO
export const destacarCursoSchema = z.object({
  destacado: z.boolean(),
});

export type DestacarCursoDto = z.infer<typeof destacarCursoSchema>;

// En service

async destacar(id: string, dto: DestacarCursoDto): Promise<CursoConEducador> {
  const result = destacarCursoSchema.safeParse(dto);
  if (!result.success) {
    throw new BadRequestException(result.error.issues[0]?.message);
  }

  const curso = await this.prisma.curso.findUnique({ where: { id } });
  if (!curso) {
    throw new NotFoundException('Curso no encontrado');
  }

  return this.prisma.curso.update({
    where: { id },
    data: { destacado: result.data.destacado },
    include: { /* ... */ },
  });
}
```

### Endpoint DELETE (acción destructiva)

```typescript
// En controller

/**
 * Eliminar todas las lecciones de un curso
 *
 * DELETE /api/v1/cursos/:id/lecciones
 */
@Delete(':id/lecciones')
@Roles('EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
@HttpCode(HttpStatus.NO_CONTENT)
async eliminarLecciones(
  @Param('id') cursoId: string,
  @CurrentUser() user: RequestUser
): Promise<void> {
  await this.cursosService.eliminarTodasLecciones(cursoId, user.id);
}

// En service

async eliminarTodasLecciones(cursoId: string, usuarioId: string): Promise<void> {
  const curso = await this.prisma.curso.findUnique({
    where: { id: cursoId },
    select: { educadorId: true },
  });

  if (!curso) {
    throw new NotFoundException('Curso no encontrado');
  }

  if (curso.educadorId !== usuarioId) {
    throw new ForbiddenException('No tienes permiso');
  }

  await this.prisma.leccion.deleteMany({
    where: { cursoId },
  });
}
```

---

## Patrones Comunes

### Endpoint Público

```typescript
@Public()
@Get(':id/preview')
async preview(@Param('id') id: string) {}
```

### Con Query Parameters

```typescript
@Get(':id/inscripciones')
async listarInscripciones(
  @Param('id') cursoId: string,
  @Query() query: QueryInscripcionesDto
) {}
```

### Con Body Validado

```typescript
@Post(':id/invitar')
async invitar(
  @Param('id') id: string,
  @Body() dto: InvitarDto,
  @CurrentUser() user: RequestUser
) {}
```

---

## Agregar API Route en Frontend

Si el endpoint requiere autenticación:

```typescript
// apps/web/src/app/api/cursos/[id]/estadisticas/route.ts

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { SignJWT } from 'jose';

const API_URL = process.env.API_URL || 'http://localhost:3001';
const AUTH_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

async function createAuthToken(
  token: Record<string, unknown>
): Promise<string> {
  const secret = new TextEncoder().encode(AUTH_SECRET);
  return new SignJWT({
    id: token.id as string,
    sub: token.sub as string,
    email: token.email as string,
    rol: token.rol as string,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({
      req: request,
      secret: AUTH_SECRET,
      secureCookie: true,
      salt: '__Secure-authjs.session-token',
    });

    if (!token) {
      return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
    }

    const { id } = await params;
    const authToken = await createAuthToken(token);

    const response = await fetch(
      `${API_URL}/api/v1/cursos/${id}/estadisticas`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error en proxy:', error);
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}
```

---

## Checklist

- [ ] Agregar método al controller
- [ ] Agregar lógica al service
- [ ] Crear DTO si necesario
- [ ] Agregar API route en frontend si requiere auth
- [ ] Documentar en contexto del módulo
- [ ] Ejecutar `npm run lint`
