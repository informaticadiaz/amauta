# Módulo: Auth (Autenticación)

> Sistema de autenticación con NextAuth.js v5 (frontend) y JWT (backend).

---

## Descripción Funcional

Autenticación basada en credenciales (email + password). El frontend usa NextAuth.js v5 para manejar sesiones. El backend valida JWTs firmados por el frontend.

### Flujo de Autenticación

```
1. Usuario envía credenciales al frontend (NextAuth)
2. NextAuth valida contra backend (/api/v1/auth/login)
3. Si válido, NextAuth crea sesión con cookie segura
4. Para requests al backend, frontend crea JWT corto y lo envía
5. Backend valida JWT con JwtAuthGuard
```

---

## Archivos del Módulo

### Backend

| Archivo                                        | Propósito                     |
| ---------------------------------------------- | ----------------------------- |
| `apps/api/src/auth/auth.module.ts`             | Módulo NestJS                 |
| `apps/api/src/auth/auth.controller.ts`         | Endpoints login/register      |
| `apps/api/src/auth/auth.service.ts`            | Lógica de autenticación       |
| `apps/api/src/auth/dto/login.dto.ts`           | Schema Zod para login         |
| `apps/api/src/auth/dto/register.dto.ts`        | Schema Zod para registro      |
| `apps/api/src/common/guards/jwt-auth.guard.ts` | Guard global JWT              |
| `apps/api/src/common/guards/roles.guard.ts`    | Guard de roles                |
| `apps/api/src/common/decorators/`              | @Public, @Roles, @CurrentUser |

### Frontend

| Archivo                                            | Propósito              |
| -------------------------------------------------- | ---------------------- |
| `apps/web/src/app/api/auth/[...nextauth]/route.ts` | NextAuth handlers      |
| `apps/web/src/app/api/auth/register/route.ts`      | Proxy registro         |
| `apps/web/src/lib/auth.ts`                         | Configuración NextAuth |
| `apps/web/src/app/(auth)/login/page.tsx`           | Página de login        |
| `apps/web/src/app/(auth)/register/page.tsx`        | Página de registro     |
| `apps/web/src/hooks/useAuthorization.ts`           | Hook de permisos       |
| `apps/web/src/components/auth/LoginForm.tsx`       | Formulario login       |
| `apps/web/src/components/auth/RegisterForm.tsx`    | Formulario registro    |

---

## Endpoints API

Base: `/api/v1/auth`

| Método | Ruta        | Auth | Descripción          |
| ------ | ----------- | ---- | -------------------- |
| POST   | `/login`    | No   | Validar credenciales |
| POST   | `/register` | No   | Crear cuenta         |

### Request/Response

**POST /login**

```json
// Request
{ "email": "user@example.com", "password": "password123" }

// Response 200
{
  "user": {
    "id": "cuid...",
    "email": "user@example.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    "rol": "ESTUDIANTE"
  },
  "message": "Login exitoso"
}
```

**POST /register**

```json
// Request
{
  "email": "nuevo@example.com",
  "password": "password123",
  "nombre": "María",
  "apellido": "García",
  "rol": "ESTUDIANTE"
}

// Response 201
{
  "user": { ... },
  "message": "Usuario registrado exitosamente"
}
```

---

## Modelo de Usuario

```prisma
model Usuario {
  id              String    @id @default(cuid())
  email           String    @unique
  nombre          String
  apellido        String
  rol             Rol       @default(ESTUDIANTE)
  password        String    // Hash bcrypt
  avatar          String?
  activo          Boolean   @default(true)
  emailVerificado DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relaciones...
}

enum Rol {
  ESTUDIANTE
  EDUCADOR
  ADMIN_ESCUELA
  SUPER_ADMIN
}
```

---

## Decoradores de Autorización

### @Public()

Marca un endpoint como público (sin autenticación).

```typescript
@Public()
@Get('cursos')
async listar() { ... }
```

### @Roles(...roles)

Requiere uno de los roles especificados.

```typescript
@Roles('EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
@Post()
async crear() { ... }
```

### @CurrentUser()

Inyecta el usuario autenticado.

```typescript
async crear(
  @Body() dto: CreateDto,
  @CurrentUser() user: RequestUser
): Promise<Response> {
  // user.id, user.email, user.rol
}
```

---

## Guards

### JwtAuthGuard (Global)

Aplicado globalmente. Valida JWT en header Authorization.
Los endpoints `@Public()` lo saltan.

### RolesGuard (Global)

Aplicado globalmente. Verifica roles si hay `@Roles()`.

---

## Hook useAuthorization

```typescript
const {
  isLoading,
  isAuthenticated,
  user,
  hasRole,
  hasAnyRole,
  // Helpers
  isEstudiante,
  isEducador,
  isAdmin,
  // Permisos
  canManageCourses,
  canEnrollInCourses,
} = useAuthorization();
```

---

## Ejemplos de Código

### DTO de Login

```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type LoginDto = z.infer<typeof loginSchema>;
```

### Validación en Service

```typescript
async login(dto: LoginDto): Promise<LoginResponse> {
  const result = loginSchema.safeParse(dto);
  if (!result.success) {
    throw new BadRequestException(result.error.issues[0]?.message);
  }

  const { email, password } = result.data;

  const user = await this.prisma.usuario.findUnique({
    where: { email },
  });

  if (!user || !user.activo) {
    throw new UnauthorizedException('Credenciales inválidas');
  }

  const passwordValid = await bcrypt.compare(password, user.password);
  if (!passwordValid) {
    throw new UnauthorizedException('Credenciales inválidas');
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      rol: user.rol,
    },
    message: 'Login exitoso',
  };
}
```

---

## Usuarios de Prueba

| Email                     | Password      | Rol           |
| ------------------------- | ------------- | ------------- |
| `superadmin@amauta.test`  | `password123` | SUPER_ADMIN   |
| `admin1@amauta.test`      | `password123` | ADMIN_ESCUELA |
| `educador1@amauta.test`   | `password123` | EDUCADOR      |
| `estudiante1@amauta.test` | `password123` | ESTUDIANTE    |

Ver `apps/api/prisma/README.md` para lista completa.

---

## Notas para IA

1. **Password**: Siempre hashear con bcrypt (10 rounds)
2. **Guards globales**: No necesitan aplicarse por endpoint
3. **JWT corto**: El frontend crea JWTs de 1 hora para el backend
4. **Sesión NextAuth**: Usa cookies seguras HttpOnly
5. **Mensajes genéricos**: "Credenciales inválidas" para login fallido
