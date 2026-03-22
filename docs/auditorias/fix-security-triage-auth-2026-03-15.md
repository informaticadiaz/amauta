# Fix Security Findings — triage-auth-2026-03-15

**Informe original:** `docs/auditorias/auditoria-triage-auth-2026-03-15.md`
**Fecha de remediación:** 2026-03-15
**Remediado por:** Senior Security Engineer (IA)

---

## Fixes Aplicados ✅

| #   | Hallazgo                                             | Severidad | Archivos modificados                                                                          | Estado      |
| --- | ---------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------- | ----------- |
| 1   | Endpoint público expone datos personales de usuarios | 🟠 Alto   | `apps/api/src/auth/auth.controller.ts`                                                        | ✅ Aplicado |
| 2   | Sin rate limiting en endpoints de autenticación      | 🟠 Alto   | `apps/api/src/app.module.ts`, `apps/api/src/auth/auth.controller.ts`, `apps/api/package.json` | ✅ Aplicado |

---

## Detalle de Cambios

### Fix 1 — Endpoint público `GET /auth/user/:id`

**Archivo:** `apps/api/src/auth/auth.controller.ts` línea 70

Eliminado el decorador `@Public()` del endpoint `GET /auth/user/:id`.
El endpoint ahora requiere JWT válido gracias al guard global `JwtAuthGuard`.

```diff
- @Public()
  @Get('user/:id')
  async getUser(@Param('id') id: string): Promise<AuthUser | null> {
```

### Fix 2 — Rate limiting en autenticación

**Dependencia instalada:** `@nestjs/throttler ^6.5.0`

**`apps/api/src/app.module.ts`:** Agregado `ThrottlerModule` y `ThrottlerGuard` como primer guard global.

```diff
+ import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

  imports: [
+   ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    ...
  ],
  providers: [
+   { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
```

**`apps/api/src/auth/auth.controller.ts`:** Límites específicos por endpoint.

```diff
+ import { Throttle, SkipThrottle } from '@nestjs/throttler';

+ @Throttle({ default: { limit: 5, ttl: 60000 } })   // 5 intentos/min
  @Post('login')

+ @Throttle({ default: { limit: 3, ttl: 300000 } })  // 3 intentos/5min
  @Post('register')

+ @SkipThrottle()
  @Get('me')
```

---

## Requieren Intervención Manual ⚠️

Ninguna — todos los hallazgos del Triage eran automatizables.

---

## Hallazgo Adicional Detectado Durante Remediación

Durante la verificación del build se detectaron **14 errores TypeScript pre-existentes**
(no relacionados con los hallazgos de seguridad) causados por el cliente Prisma sin generar.

**Causa:** `@prisma/client` no había sido generado en el entorno local.
**Resolución aplicada:** `npx prisma generate --schema=apps/api/prisma/schema.prisma`
**Resultado:** Build limpio (0 errores).

---

## Estado del Build

- **Backend** (`@amauta/api`): ✅ Limpio — 0 errores tras `prisma generate`
- **Frontend** (`@amauta/web`): no modificado en esta remediación

---

## Próximos Pasos

No quedan acciones pendientes para los hallazgos de esta auditoría.

Se recomienda ejecutar una nueva auditoría sobre otros scopes:

- `uploads` — validación de tipo de archivo y path traversal
- `api-routes` — API Routes del frontend (Next.js)
- `frontend` — XSS en componentes React
