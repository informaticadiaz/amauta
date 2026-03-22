---
name: security-audit
description: Use this skill when the user asks to run a security audit on the codebase. Triggered by phrases like "ejecuta una auditoría de seguridad", "auditá la seguridad de", "security audit", "revisión de seguridad", or "auditá el módulo de [X]".
version: 1.0.0
---

# Security Audit — Auditoría de Seguridad

Actúa como un ingeniero senior especializado en seguridad de aplicaciones web.
Audita el código del proyecto en busca de vulnerabilidades de seguridad y genera
un informe estructurado con hallazgos priorizados, código de explotación conceptual
y remediaciones concretas.

**Alcance**: Backend (NestJS/Fastify), Frontend (Next.js/React), Base de datos (PostgreSQL/Prisma),
Autenticación (NextAuth.js/JWT), APIs REST.

**Referencia**: OWASP Top 10, CWE/SANS Top 25, guía interna `docs/technical/security-guide.md`.

## Cuándo se activa

Cuando el usuario pide una auditoría de seguridad, por ejemplo:

- "Ejecuta una auditoría de seguridad sobre el módulo de autenticación"
- "Auditá la seguridad de las API routes del frontend"
- "Security audit del módulo de uploads"
- "Revisión de seguridad completa del proyecto"

## Proceso de Auditoría (Ejecutar en Orden)

### PASO 0 — Bienvenida e Identificación del Scope

**Ejecutar SIEMPRE al inicio**, incluso si el usuario ya indicó un scope en su mensaje.

#### 0.1 Mostrar auditorías previas

Listar los informes existentes en `docs/auditorias/`:

```bash
ls docs/auditorias/ 2>/dev/null || echo "(ninguna auditoría previa)"
```

#### 0.2 Mostrar mensaje de bienvenida y cuestionario

Presentar al usuario el siguiente mensaje interactivo:

---

🔐 **Security Audit — Amauta**

¡Buenas! ¿Qué auditamos hoy?

**Scopes disponibles:**

| #   | Scope           | Archivos                                                    |
| --- | --------------- | ----------------------------------------------------------- |
| 1   | `auth`          | Autenticación y autorización (JWT, NextAuth, guards)        |
| 2   | `cursos`        | Módulo de cursos (service, controller, DTOs)                |
| 3   | `lecciones`     | Módulo de lecciones                                         |
| 4   | `inscripciones` | Módulo de inscripciones                                     |
| 5   | `uploads`       | Subida de archivos                                          |
| 6   | `api-routes`    | API Routes del frontend (Next.js)                           |
| 7   | `frontend`      | Componentes y páginas React                                 |
| 8   | `database`      | Queries Prisma y schema                                     |
| 9   | `completo`      | Todo el proyecto (Auth → Backend → DB → Uploads → Frontend) |

**Auditorías previas:** [lista del paso 0.1]

¿Qué número o nombre de scope querés auditar?

---

#### 0.3 Confirmar scope y tipo de auditoría

Una vez que el usuario elige el scope, confirmar:

> "Perfecto, voy a auditar **[scope elegido]**.
> ¿Qué tipo de auditoría querés?
>
> - **Triage** — Foco en vulnerabilidades críticas y altas solamente. Ideal antes de un deploy urgente o como primera pasada rápida.
> - **Deep Dive** — Análisis exhaustivo de todos los niveles de severidad (crítico → informativo) + configuración + dependencias + recomendaciones proactivas."

- **Triage**: solo ejecutar pasos 2 y 3 del proceso
- **Deep Dive**: ejecutar todos los pasos (2 al 7)

Esperar respuesta antes de continuar.

---

### PASO 1 — Delimitar el Scope y Preparar Contexto

Determinar qué archivos auditar según el scope indicado:

| Scope indicado        | Archivos a auditar                                                   |
| --------------------- | -------------------------------------------------------------------- |
| Módulo backend        | `apps/api/src/[modulo]/**/*.ts` (service, controller, guards, DTOs)  |
| Auth                  | `apps/api/src/auth/**` + `apps/web/src/app/api/auth/**` + middleware |
| API Routes (frontend) | `apps/web/src/app/api/**/*.ts`                                       |
| Uploads               | `apps/api/src/uploads/**` + configuración de Multer/FastifyMultipart |
| Base de datos         | `apps/api/src/**/*.service.ts` + `apps/api/prisma/schema.prisma`     |
| Frontend              | `apps/web/src/app/**/*.tsx` + `apps/web/src/components/**/*.tsx`     |
| Completo              | Todo lo anterior en orden: Auth → Backend → DB → Uploads → Frontend  |

Antes de auditar:

- Leer `docs/technical/security-guide.md` para conocer las políticas del proyecto
- Leer `apps/api/prisma/schema.prisma` para entender el modelo de datos
- Leer `docs/ai-context/_patterns.md` para conocer los patrones esperados
- Si hay módulo específico: leer `docs/ai-context/modules/[modulo].md`

---

### PASO 2 — Auditoría de Autenticación y Autorización (A01/A07 OWASP)

#### 2.1 Broken Access Control — Acceso sin autorización

Buscar endpoints que no tienen guards apropiados:

```typescript
// ❌ Endpoint sensible sin guard
@Get('admin/usuarios')
// Sin @Roles('ADMIN_ESCUELA') ni @UseGuards(RolesGuard)
async listarUsuarios() { ... }

// ✅ Con guard y rol requerido
@Get('admin/usuarios')
@Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
async listarUsuarios() { ... }
```

**Señales de riesgo:**

- Controladores o métodos sin `@UseGuards(JwtAuthGuard)`
- Uso de `@Public()` en endpoints que deberían requerir autenticación
- Ausencia de `@Roles()` en operaciones sensibles (borrado, administración)
- Falta de verificación de ownership: ¿el usuario puede acceder al recurso de OTRO usuario?

#### 2.2 Insecure Direct Object Reference (IDOR)

Verificar que el servicio valida que el recurso pertenece al usuario autenticado:

```typescript
// ❌ IDOR: cualquier usuario autenticado puede ver inscripciones ajenas
async getInscripcion(id: string) {
  return this.prisma.inscripcion.findUnique({ where: { id } });
}

// ✅ Verifica ownership
async getInscripcion(id: string, usuarioId: string) {
  const inscripcion = await this.prisma.inscripcion.findUnique({ where: { id } });
  if (!inscripcion || inscripcion.estudianteId !== usuarioId) {
    throw new ForbiddenException();
  }
  return inscripcion;
}
```

**Recursos críticos a verificar**: inscripciones, progreso, perfil de usuario, archivos subidos.

#### 2.3 JWT — Configuración y manejo inseguro

```typescript
// ❌ Secret débil o hardcodeado
JwtModule.register({ secret: 'secreto123', ... })

// ❌ Sin expiración
JwtModule.register({ secret: process.env.JWT_SECRET, signOptions: {} })

// ✅
JwtModule.register({
  secret: process.env.JWT_SECRET, // mínimo 32 chars aleatorios
  signOptions: { expiresIn: '7d' },
})
```

Buscar también:

- Tokens almacenados en `localStorage` (frontend) — debería ser cookie httpOnly
- Ausencia de validación del campo `sub` o `userId` en el payload
- `alg: none` aceptado (raramente en NestJS, pero verificar config custom)

#### 2.4 NextAuth — Configuración insegura

```typescript
// Verificar en apps/web/src/app/api/auth/[...nextauth]/route.ts
// ❌ NEXTAUTH_SECRET no configurado o débil
// ❌ Callbacks de session/jwt que exponen datos sensibles
// ❌ pages.error sin manejo adecuado
// ❌ trustHost habilitado sin control en producción
```

---

### PASO 3 — Auditoría de Inyección (A03 OWASP)

#### 3.1 Inyección en queries Prisma

Prisma usa queries parametrizadas por defecto, PERO hay casos peligrosos:

```typescript
// ✅ Safe (tagged template)
await this.prisma.$queryRaw`SELECT * FROM users WHERE email = ${userInput}`;

// ❌ CRÍTICO
await this.prisma.$queryRawUnsafe(
  `SELECT * FROM users WHERE email = '${userInput}'`
);

// ❌ PELIGROSO: orderBy desde input del usuario sin lista blanca
const orderBy = { [req.query.sortBy]: req.query.order };
await this.prisma.curso.findMany({ orderBy });

// ✅ Lista blanca para campos de ordenamiento
const ALLOWED_SORT_FIELDS = ['titulo', 'createdAt', 'updatedAt'];
if (!ALLOWED_SORT_FIELDS.includes(sortBy)) throw new BadRequestException();
```

Buscar: `$queryRawUnsafe`, `$executeRawUnsafe`, interpolación de strings en `$queryRaw`.

#### 3.2 Inyección de Comandos del Sistema Operativo

```typescript
// ❌ CRÍTICO: ejecutar comandos con input del usuario
import { exec } from 'child_process';
exec(`convert ${filename} output.jpg`); // filename podría ser "; rm -rf /"

// ✅ Usar librerías de alto nivel (sharp, etc.) sin shell
import sharp from 'sharp';
await sharp(buffer).toFile(outputPath);
```

Buscar: `exec(`, `execSync(`, `spawn(` con input del usuario.

#### 3.3 Server-Side Request Forgery (SSRF)

```typescript
// ❌ Fetch a URL controlada por el usuario (host controlable)
const response = await fetch(req.body.webhookUrl);

// ✅ Validar contra lista blanca de dominios
const ALLOWED_DOMAINS = ['trusted-api.com'];
const url = new URL(webhookUrl);
if (!ALLOWED_DOMAINS.includes(url.hostname)) throw new BadRequestException();
```

---

### PASO 4 — Auditoría de Subida de Archivos (A04/A05 OWASP)

#### 4.1 Validación de tipo de archivo

```typescript
// ❌ Solo verifica extensión (fácil de burlar)
if (!filename.endsWith('.jpg')) throw new Error();

// ❌ Solo verifica Content-Type del header (controlable por el cliente)
if (file.mimetype !== 'image/jpeg') throw new Error();

// ✅ Verificar magic bytes (firma del archivo real)
import { fileTypeFromBuffer } from 'file-type';
const type = await fileTypeFromBuffer(buffer);
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
if (!type || !ALLOWED_TYPES.includes(type.mime))
  throw new BadRequestException();
```

#### 4.2 Path Traversal en nombres de archivo

```typescript
// ❌ CRÍTICO: nombre de archivo directo del usuario
const filepath = path.join(uploadsDir, req.file.originalname);
// originalname podría ser "../../etc/passwd"

// ✅ Generar nombre seguro
import { v4 as uuidv4 } from 'uuid';
const ext = path.extname(req.file.originalname).toLowerCase();
const safeFilename = `${uuidv4()}${ext}`;
const filepath = path.join(uploadsDir, safeFilename);
```

#### 4.3 Límites de tamaño y rate limiting

```typescript
// Verificar que existe límite de tamaño en la configuración de Multer/FastifyMultipart
// ❌ Sin límite
fileSize: Infinity;

// ✅ Límite explícito
fileSize: 5 * 1024 * 1024; // 5MB máximo
```

#### 4.4 Ejecución de archivos subidos

Verificar que los archivos subidos no son servidos desde una ruta ejecutable
y que el servidor web no los interpreta como scripts.

---

### PASO 5 — Auditoría de Validación y Sanitización de Inputs (A03 OWASP)

#### 5.1 Ausencia de validación en DTOs

```typescript
// ❌ Sin validación — acepta cualquier dato
@Post()
async crear(@Body() body: any) { ... }

// ✅ Con clase-validator y pipe global
@Post()
async crear(@Body() dto: CrearCursoDto) { ... }

// Y en el DTO:
export class CrearCursoDto {
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  titulo: string;
}
```

Verificar que el `ValidationPipe` está habilitado globalmente en `main.ts`:

```typescript
app.useGlobalPipes(
  new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })
);
```

**`whitelist: true`** es crítico — sin él, propiedades extra del body pasan al servicio.

#### 5.2 Cross-Site Scripting (XSS) en Frontend

```tsx
// ❌ CRÍTICO: dangerouslySetInnerHTML sin sanitización
<div dangerouslySetInnerHTML={{ __html: leccion.contenido }} />;

// ✅ Sanitizar con DOMPurify antes de renderizar HTML
import DOMPurify from 'isomorphic-dompurify';
<div
  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(leccion.contenido) }}
/>;
```

Buscar: `dangerouslySetInnerHTML`, `.innerHTML =`, `eval(`, `Function(`.

#### 5.3 Open Redirect

```typescript
// ❌ Redirect a URL del usuario sin validar
const redirectUrl = req.query.redirect;
res.redirect(redirectUrl); // podría ser https://phishing.com

// ✅ Solo rutas relativas o lista blanca
const ALLOWED_REDIRECTS = ['/dashboard', '/cursos', '/login'];
if (!ALLOWED_REDIRECTS.includes(redirectUrl)) {
  return res.redirect('/dashboard');
}
```

Buscar en API Routes de Next.js: `redirect(searchParams.get('redirect'))`.

---

### PASO 6 — Auditoría de Configuración y Exposición de Datos (A02/A05 OWASP)

#### 6.1 Exposición de datos sensibles en respuestas

```typescript
// ❌ Retorna hash de password en la respuesta
return this.prisma.usuario.findMany();

// ✅ Excluir campos sensibles
return this.prisma.usuario.findMany({
  select: {
    id: true,
    nombre: true,
    email: true,
    rol: true,
    // passwordHash: OMITIDO
  },
});
```

Buscar: respuestas que incluyen `passwordHash`, `token`, `secret`, claves privadas.

```typescript

```

#### 6.2 Variables de entorno expuestas al cliente (Next.js)

```typescript
// ❌ CRÍTICO: Secret expuesto al bundle del cliente
// En next.config.js o en código:
process.env.JWT_SECRET; // Solo disponible en servidor
process.env.NEXT_PUBLIC_JWT_SECRET; // ❌ NEXT_PUBLIC_ lo expone al browser

// Regla: NEVER usar NEXT_PUBLIC_ para secretos
```

Verificar que `NEXT_PUBLIC_*` variables no contienen: JWT secrets, API keys privadas, credenciales de DB.

#### 6.3 Headers de seguridad HTTP

```typescript
// Verificar en next.config.js que existen Security Headers:
// ✅ Content-Security-Policy
// ✅ X-Frame-Options: DENY
// ✅ X-Content-Type-Options: nosniff
// ✅ Referrer-Policy: strict-origin-when-cross-origin
// ✅ Permissions-Policy

// En NestJS/Fastify: verificar uso de @fastify/helmet
app.register(helmet);
```

#### 6.5 Rate Limiting ausente

Verificar que los endpoints sensibles tienen rate limiting:

- `POST /auth/login` — prevenir brute force
- `POST /auth/register` — prevenir spam
- `POST /lecciones/:id/completar` — prevenir manipulación de progreso

```typescript
// Buscar: @Throttle() o ThrottlerModule en auth.module.ts
```

#### 6.4 CORS mal configurado

```typescript
// ❌ CORS wildcard en producción
app.enableCors({ origin: '*' });

// ✅ Lista blanca de orígenes
app.enableCors({
  origin: [process.env.FRONTEND_URL],
  credentials: true,
});
```

---

### PASO 7 — Auditoría de Dependencias y Configuración (A06/A09 OWASP)

#### 7.1 Dependencias con vulnerabilidades conocidas

Revisar `package.json` en busca de versiones con CVEs conocidos.
Buscar dependencias desactualizadas en paquetes críticos de seguridad:

- `jsonwebtoken`, `next-auth`, `bcrypt`, `multer`

#### 7.2 Manejo inseguro de errores

```typescript
// ❌ Stack traces expuestos al cliente en producción
throw new Error(`DB query failed: ${query} with params ${params}`);

// ✅ Mensaje genérico al cliente, log interno
this.logger.error('DB query failed', { query, params, error });
throw new InternalServerErrorException('Error interno del servidor');
```

Buscar: `catch (e) { throw new Error(e.message) }` — expone mensajes internos.

#### 7.3 Logs con datos sensibles

```typescript
// ❌ Loguear passwords o tokens
this.logger.log(`Login attempt: ${email} ${password}`);

// ✅ Solo datos no sensibles
this.logger.log(`Login attempt for: ${email}`);
```

---

### PASO 8 — Generar el Informe de Seguridad

Producir el informe según el tipo de auditoría elegida:

- **Triage**: incluir solo secciones Resumen Ejecutivo, Hallazgos (críticos y altos únicamente), Resumen de Hallazgos y Plan de Remediación Priorizado.
- **Deep Dive**: incluir todas las secciones del informe (Triage + Medio/Bajo/Informativo + Lo que está bien implementado + Recomendaciones Generales).

El informe debe comenzar con:

---

## 🔐 Informe de Auditoría de Seguridad — [Triage / Deep Dive] — [Scope auditado]

**Fecha:** [fecha actual]
**Tipo:** [Triage — Crítico y Alto solamente / Deep Dive — Análisis exhaustivo]
**Auditor:** Senior Security Engineer (IA)
**Archivos analizados:** [lista]
**Nivel de riesgo total:** [🔴 CRÍTICO / 🟠 ALTO / 🟡 MEDIO / 🟢 BAJO] ← el más alto encontrado
**Referencias:** OWASP Top 10 2021, CWE

---

### Resumen Ejecutivo

[2-4 oraciones describiendo el estado general de seguridad, los vectores de ataque principales encontrados y el riesgo global]

---

### Hallazgos

> Ordenados por severidad: Crítico → Alto → Medio → Bajo → Informativo

#### 🔴 CRÍTICO — [Nombre de la vulnerabilidad]

**CWE/OWASP:** CWE-XXX / A0X:2021
**Archivo:** `ruta/al/archivo.ts` línea X
**Vector de ataque:** [Autenticado / No autenticado] → [HTTP / Local]
**Impacto:** [Descripción del impacto: acceso no autorizado, pérdida de datos, RCE, etc.]

**Código vulnerable:**

```typescript
// código vulnerable con contexto
```

**Cómo se explotaría:**
[Descripción paso a paso de cómo un atacante podría explotar esto — sin código de explotación real, solo descripción conceptual]

**Remediación:**

```typescript
// código corregido
```

**Esfuerzo de remediación:** [Bajo / Medio / Alto]
**Prioridad:** Resolver ANTES del próximo deploy

---

#### 🟠 ALTO — [Nombre de la vulnerabilidad]

**CWE/OWASP:** CWE-XXX / A0X:2021
**Archivo:** `ruta/al/archivo.ts` línea X
**Vector de ataque:** [Autenticado / No autenticado] → [HTTP / Local]
**Impacto:** [Descripción del impacto]

**Código vulnerable:**

```typescript
// código vulnerable con contexto
```

**Cómo se explotaría:**
[Descripción conceptual paso a paso]

**Remediación:**

```typescript
// código corregido
```

**Esfuerzo de remediación:** [Bajo / Medio / Alto]

---

#### 🟡 MEDIO — [Nombre de la vulnerabilidad]

[mismo formato]

---

#### 🔵 BAJO / INFORMATIVO — [Nombre de la observación]

[mismo formato simplificado]

---

### Resumen de Hallazgos

| Severidad  | Cantidad | OWASP Categoría principal |
| ---------- | -------- | ------------------------- |
| 🔴 Crítico | N        |                           |
| 🟠 Alto    | N        |                           |
| 🟡 Medio   | N        |                           |
| 🔵 Bajo    | N        |                           |
| **Total**  | **N**    |                           |

---

### Plan de Remediación Priorizado

1. **[Vulnerabilidad 1]** — Riesgo: Crítico / Esfuerzo: Bajo → **Resolver antes del próximo deploy**
2. **[Vulnerabilidad 2]** — Riesgo: Alto / Esfuerzo: Medio → **Resolver en este sprint**
3. **[Vulnerabilidad 3]** — Riesgo: Medio / Esfuerzo: Bajo → Próximo sprint
4. **[Vulnerabilidad N]** — Riesgo: Bajo / Esfuerzo: Alto → Evaluar costo/beneficio

---

### Lo que está bien implementado ✅

[Lista de controles de seguridad correctamente implementados — reconocer lo que funciona bien]

---

### Recomendaciones Generales

[Mejoras proactivas que no son vulnerabilidades actuales pero mejorarían la postura de seguridad]

---

### PASO 9 — Guardar el Informe

Una vez generado el informe, guardarlo en `docs/auditorias/` con el siguiente nombre:

```
docs/auditorias/auditoria-triage-[scope]-[YYYY-MM-DD].md      ← para Triage
docs/auditorias/auditoria-deepdive-[scope]-[YYYY-MM-DD].md    ← para Deep Dive
```

**Ejemplos:**

- `docs/auditorias/auditoria-triage-auth-2026-03-15.md`
- `docs/auditorias/auditoria-deepdive-auth-2026-03-15.md`
- `docs/auditorias/auditoria-triage-completo-2026-03-15.md`
- `docs/auditorias/auditoria-deepdive-uploads-2026-03-15.md`

Si ya existe un archivo con ese nombre (misma fecha, scope y tipo), agregar sufijo `-v2`, `-v3`, etc.

Después de guardar, informar al usuario:

> "✅ Informe guardado en `docs/auditorias/auditoria-[triage|deepdive]-[scope]-[fecha].md`"

---

### PASO 10 — Propuesta de Remediación Autónoma

Después de guardar el informe, clasificar cada hallazgo encontrado en dos categorías y mostrar la siguiente tabla al usuario:

**Automatizables** — Claude puede aplicar el fix directamente:

- Cambios de código (eliminar decoradores, agregar validaciones, restringir campos retornados)
- Cambios de configuración (agregar módulos, configurar guards, ajustar imports)
- Instalación de dependencias de seguridad faltantes

**Requieren intervención manual** — no automatizables:

- Rotación de secrets/API keys en producción
- Cambios de infraestructura (firewall, WAF, HTTPS forzado a nivel servidor)
- Configuración de servicios externos (CDN, proveedor de email, DNS)
- Políticas organizacionales o de equipo

Mostrar al usuario:

```
## ¿Aplicamos los fixes?

| Hallazgo | Severidad | ¿Automatizable? | Esfuerzo |
|----------|-----------|-----------------|---------|
| [hallazgo 1] | 🔴 Crítico | ✅ Sí | Bajo |
| [hallazgo 2] | 🟠 Alto   | ✅ Sí | Medio |
| [hallazgo N] | 🟡 Medio  | ⚠️ Manual | — |

Para aplicar los fixes con contexto limpio (recomendado), iniciá una nueva
conversación y ejecutá:

  /fix-security-findings docs/auditorias/auditoria-[tipo]-[scope]-[fecha].md

El skill generará la contraparte:
  docs/auditorias/fix-security-[tipo]-[scope]-[fecha].md

Esto permite ver el estado de todas las auditorías de un vistazo en docs/auditorias/.
```

**Por qué contexto limpio**: la auditoría acumula mucho contexto de lectura de archivos.
El skill de remediación trabaja mejor partiendo solo del informe guardado,
sin el ruido de la sesión de auditoría.

---

## Niveles de Severidad

| Nivel           | Símbolo | Criterio CVSS aproximado                                                        |
| --------------- | ------- | ------------------------------------------------------------------------------- |
| **Crítico**     | 🔴      | CVSS 9.0-10.0 — Explotable remotamente sin auth, impacto total en datos/sistema |
| **Alto**        | 🟠      | CVSS 7.0-8.9 — Explotable con auth básica o localmente, impacto significativo   |
| **Medio**       | 🟡      | CVSS 4.0-6.9 — Requiere condiciones específicas, impacto parcial                |
| **Bajo**        | 🔵      | CVSS 0.1-3.9 — Difícil de explotar, impacto mínimo o solo informativo           |
| **Informativo** | ⚪      | Sin CVSS — Buenas prácticas, hardening adicional recomendado                    |

## Notas para la Auditoría

- **Análisis estático**: Esta auditoría identifica vulnerabilidades visibles en el código fuente.
  No reemplaza un pentest dinámico (DAST) ni un análisis de dependencias automatizado (`npm audit`).
- **Contexto de explotabilidad**: Evaluar si la vulnerabilidad es explotable en el entorno real
  (ej: un IDOR en un endpoint que requiere admin tiene menor riesgo que uno público).
- **Sin código de explotación**: Describir conceptualmente cómo se explotaría,
  pero no generar payloads reales de ataque.
- **Prisma es seguro por defecto**: Las queries parametrizadas de Prisma previenen SQLi estándar.
  Buscar específicamente `$queryRawUnsafe` y `$executeRawUnsafe`.
- **Next.js App Router**: Las API Routes en `app/api/` son Server-side.
  Verificar que no exponen datos sensibles en Server Components que se hidratan al cliente.
- **Después de la auditoría**: Ejecutar `npm audit` para vulnerabilidades en dependencias
  y considerar herramientas como Snyk o GitHub Dependabot para monitoreo continuo.
