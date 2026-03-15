# 🔐 Informe de Auditoría de Seguridad — Triage — `auth`

**Fecha:** 2026-03-15
**Tipo:** Triage — Crítico y Alto solamente
**Auditor:** Senior Security Engineer (IA)
**Archivos analizados:**
- `apps/api/src/auth/auth.controller.ts`
- `apps/api/src/auth/auth.service.ts`
- `apps/api/src/auth/auth.module.ts`
- `apps/api/src/auth/dto/login.dto.ts`
- `apps/api/src/auth/dto/register.dto.ts`
- `apps/api/src/common/guards/jwt-auth.guard.ts`
- `apps/api/src/common/guards/roles.guard.ts`
- `apps/api/src/app.module.ts`
- `apps/api/src/main.ts`
- `apps/api/src/config/env.ts`
- `apps/web/src/lib/auth.ts`
- `apps/web/src/lib/auth.config.ts`
- `apps/web/src/middleware.ts`
- `apps/web/src/app/api/auth/[...nextauth]/route.ts`
- `apps/web/src/app/api/auth/register/route.ts`

**Nivel de riesgo total:** 🟠 ALTO
**Referencias:** OWASP Top 10 2021, CWE

---

## Resumen Ejecutivo

La capa de autenticación está bien estructurada: usa bcrypt para hashing, verifica el estado activo del usuario en cada request, no expone el `passwordHash` en respuestas y tiene guards globales bien configurados. Sin embargo, se identificaron dos vulnerabilidades de severidad **Alta** que deben resolverse antes del próximo ciclo de release: un endpoint público que expone datos personales de cualquier usuario del sistema sin autenticación, y la ausencia de rate limiting en los endpoints de login y registro — dejando la puerta abierta a ataques de fuerza bruta y enumeración de cuentas.

---

## Hallazgos

> Ordenados por severidad: Crítico → Alto

### 🟠 ALTO — Endpoint público expone datos personales de cualquier usuario

**CWE/OWASP:** CWE-200 / A01:2021 – Broken Access Control + A02:2021 – Sensitive Data Exposure
**Archivo:** `apps/api/src/auth/auth.controller.ts` línea 70–74
**Vector de ataque:** No autenticado → HTTP GET
**Impacto:** Cualquier persona en internet puede obtener el email, nombre, apellido y rol de cualquier usuario del sistema conociendo (o iterando) su UUID.

**Código vulnerable:**

```typescript
// apps/api/src/auth/auth.controller.ts — líneas 70-74
@Public()                               // ← sin autenticación
@Get('user/:id')
async getUser(@Param('id') id: string): Promise<AuthUser | null> {
  return this.authService.getUserById(id);  // retorna: email, nombre, apellido, rol
}
```

**Cómo se explotaría:**
Un atacante realiza `GET /api/v1/auth/user/<uuid>` sin ningún token. Si el UUID es conocido (aparece en URLs, logs filtrados, o puede iterarse dado que Prisma usa UUIDs v4), obtiene el email, nombre, apellido y rol de la víctima. Con el rol identificado (`EDUCADOR`, `ADMIN_ESCUELA`), puede priorizar ataques de phishing o fuerza bruta contra cuentas de mayor privilegio.

**Remediación:**

```typescript
// Quitar @Public() — el guard global JwtAuthGuard ya protege el resto
@Get('user/:id')
async getUser(@Param('id') id: string): Promise<AuthUser | null> {
  return this.authService.getUserById(id);
}

// Si el endpoint es necesario solo para verificación de sesión propia,
// reemplazarlo completamente por GET /auth/me con ownership check:
@Get('me')
async getMe(@CurrentUser() user: RequestUser): Promise<AuthUser> {
  return this.authService.getUserById(user.id) as Promise<AuthUser>;
}
```

Si el endpoint debe quedar público (ej: para mostrar perfil público), limitar los campos retornados a solo `nombre`, `apellido` y `avatar` — nunca email ni rol.

**Esfuerzo de remediación:** Bajo (eliminar un decorador)
**Prioridad:** Resolver ANTES del próximo deploy

---

### 🟠 ALTO — Sin rate limiting en endpoints de autenticación (Brute Force)

**CWE/OWASP:** CWE-307 / A07:2021 – Identification and Authentication Failures
**Archivo:** `apps/api/src/app.module.ts` + `apps/api/src/auth/auth.controller.ts`
**Vector de ataque:** No autenticado → HTTP POST repetido
**Impacto:** Un atacante puede lanzar ataques de fuerza bruta contra `POST /api/v1/auth/login` sin limitación. Con credenciales débiles o una lista de emails válidos (obtenida del hallazgo anterior), puede comprometer cuentas. También puede hacer spam masivo en `POST /api/v1/auth/register` para saturar la base de datos.

**Código vulnerable:**

```typescript
// apps/api/src/app.module.ts — no existe ThrottlerModule
@Module({
  imports: [
    ConfigModule.forRoot({ ... }),
    PrismaModule,
    AuthModule,
    // ❌ ThrottlerModule ausente
    ...
  ],
})

// apps/api/src/config/env.ts — variables definidas pero sin implementar
RATE_LIMIT_MAX: z.string().default('100')          // ← definida pero no usada
RATE_LIMIT_WINDOW_MS: z.string().default('15')     // ← definida pero no usada
```

**Cómo se explotaría:**
Con una herramienta como `hydra` o un script simple, un atacante envía miles de requests `POST /auth/login` con combinaciones de password contra un email conocido. Al no haber limitación de velocidad ni bloqueo por intentos fallidos, el único freno es el tiempo de bcrypt (~100ms por intento = 10 intentos/seg = 864.000 intentos/día por conexión).

**Remediación:**

```typescript
// 1. Instalar: npm install @nestjs/throttler --workspace=@amauta/api

// 2. apps/api/src/app.module.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'auth',
        ttl: 60000,   // 1 minuto
        limit: 10,    // máx 10 intentos por minuto por IP
      },
    ]),
    ...
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})

// 3. apps/api/src/auth/auth.controller.ts
import { Throttle } from '@nestjs/throttler';

@Public()
@Throttle({ auth: { limit: 5, ttl: 60000 } }) // 5 intentos/min para login
@Post('login')
async login(@Body() dto: LoginDto) { ... }

@Public()
@Throttle({ auth: { limit: 3, ttl: 300000 } }) // 3 registros cada 5 min
@Post('register')
async register(@Body() dto: RegisterDto) { ... }
```

**Esfuerzo de remediación:** Medio (instalar paquete + configurar módulo + decoradores)
**Prioridad:** Resolver en este sprint

---

## Resumen de Hallazgos

| Severidad | Cantidad | OWASP Categoría principal |
|-----------|----------|--------------------------|
| 🔴 Crítico | 0 | — |
| 🟠 Alto | 2 | A01 Broken Access Control, A07 Auth Failures |
| 🟡 Medio | — | _(no auditado en Triage)_ |
| 🔵 Bajo | — | _(no auditado en Triage)_ |
| **Total** | **2** | |

---

## Plan de Remediación Priorizado

1. **Endpoint público `GET /auth/user/:id`** — Riesgo: Alto / Esfuerzo: Bajo → **Resolver antes del próximo deploy** (eliminar `@Public()` o restringir campos retornados)
2. **Sin rate limiting en login/register** — Riesgo: Alto / Esfuerzo: Medio → **Resolver en este sprint** (agregar `ThrottlerModule` de NestJS)

---

## Lo que está bien implementado ✅

- **bcrypt con 10 salt rounds**: hashing robusto de contraseñas.
- **Guards globales**: `JwtAuthGuard` y `RolesGuard` aplicados en toda la API vía `APP_GUARD`, sin posibilidad de olvidar proteger un endpoint nuevo.
- **Verificación de usuario activo en cada request**: el guard consulta la DB en cada llamada (`activo: true`), permitiendo revocar acceso inmediatamente desactivando un usuario — mitiga la ausencia de token blacklist.
- **Separación email/password en respuestas**: `passwordHash` nunca se retorna en ninguna respuesta del servicio.
- **Validación con Zod + safeParse**: DTOs de login y registro usan `safeParse` correctamente, con mensajes de error claros.
- **CORS configurado con lista blanca**: `env.CORS_ORIGIN` valida los orígenes permitidos, no usa wildcard `*`.
- **Secret mínimo de 32 caracteres**: `env.ts` valida `JWT_SECRET` con `min(32)` al arranque.
- **Algoritmo fijo HS256**: `jwt-auth.guard.ts` especifica `algorithms: ['HS256']`, impidiendo el ataque de `alg: none`.
- **Contraseña con requisitos de complejidad**: el schema de registro exige mayúsculas, minúsculas y números.
