# Guía de Seguridad para Desarrolladores - Amauta

## Importancia

Amauta maneja datos sensibles de estudiantes e instituciones educativas. La seguridad no es opcional, es una responsabilidad fundamental.

> **Regla de oro**: Nunca asumas que un input es seguro. Siempre validá y sanitizá.

---

## OWASP Top 10 y Cómo Prevenirlos

### 1. Broken Access Control

**Problema**: Usuarios acceden a recursos que no deberían.

```typescript
// ❌ Malo: cualquiera puede ver cualquier curso
@Get('cursos/:id')
getCurso(@Param('id') id: string) {
  return this.cursosService.findOne(id);
}

// ✅ Bueno: verificar que el usuario tiene acceso
@Get('cursos/:id')
@UseGuards(JwtAuthGuard)
getCurso(@Param('id') id: string, @User() user: UserPayload) {
  return this.cursosService.findOneWithAccess(id, user.id);
}

// En el service
async findOneWithAccess(cursoId: string, userId: string) {
  const curso = await this.prisma.curso.findUnique({
    where: { id: cursoId },
    include: { inscripciones: true }
  });

  if (!curso) {
    throw new NotFoundException();
  }

  // Verificar acceso
  const tieneAcceso =
    curso.publicado ||
    curso.educadorId === userId ||
    curso.inscripciones.some(i => i.usuarioId === userId);

  if (!tieneAcceso) {
    throw new ForbiddenException('No tenés acceso a este curso');
  }

  return curso;
}
```

### 2. Cryptographic Failures

**Problema**: Datos sensibles expuestos o mal encriptados.

```typescript
// ❌ Malo: guardar contraseña en texto plano
await prisma.usuario.create({
  data: { email, password: password }, // NUNCA
});

// ✅ Bueno: hashear con bcrypt
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Uso
await prisma.usuario.create({
  data: {
    email,
    passwordHash: await hashPassword(password),
  },
});
```

**Datos sensibles que NUNCA deben loggearse**:

- Contraseñas
- Tokens de sesión/JWT
- Datos de tarjetas de crédito
- Números de documento

### 3. Injection

**Problema**: Código malicioso inyectado en queries.

#### SQL Injection

```typescript
// ❌ Malo: concatenar input en query
const query = `SELECT * FROM usuarios WHERE email = '${email}'`;

// ✅ Bueno: usar Prisma (parametrizado automáticamente)
const user = await prisma.usuario.findUnique({
  where: { email },
});

// Si necesitás raw query:
const users = await prisma.$queryRaw`
  SELECT * FROM usuarios WHERE email = ${email}
`; // Prisma sanitiza automáticamente
```

#### NoSQL Injection

```typescript
// ❌ Malo: pasar objeto directo del request
const user = await User.findOne(req.body);

// ✅ Bueno: extraer solo campos esperados
const { email, password } = req.body;
const user = await User.findOne({ email });
```

### 4. Insecure Design

**Prevención**: Pensar en seguridad desde el diseño.

- Definir roles y permisos antes de implementar
- Revisar diseño con checklist de seguridad
- Threat modeling para features críticas

### 5. Security Misconfiguration

```typescript
// ❌ Malo: CORS abierto
app.enableCors({ origin: '*' });

// ✅ Bueno: origins específicos
app.enableCors({
  origin: ['http://localhost:3000', 'https://amauta.diazignacio.ar'],
  credentials: true,
});

// ❌ Malo: exponer stack traces en producción
app.useGlobalFilters(new AllExceptionsFilter()); // sin filtrar

// ✅ Bueno: ocultar detalles en producción
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const isProduction = process.env.NODE_ENV === 'production';

    response.status(status).send({
      statusCode: status,
      message: isProduction ? 'Error interno' : exception.message,
      // NO incluir stack en producción
      ...(isProduction ? {} : { stack: exception.stack }),
    });
  }
}
```

### 6. Vulnerable and Outdated Components

```bash
# Revisar vulnerabilidades
npm audit

# Arreglar automáticamente
npm audit fix

# Ver dependencias desactualizadas
npm outdated
```

**Política**: Revisar `npm audit` antes de cada release.

### 7. Identification and Authentication Failures

```typescript
// Políticas de contraseña
const passwordSchema = z.string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Debe contener mayúscula')
  .regex(/[a-z]/, 'Debe contener minúscula')
  .regex(/[0-9]/, 'Debe contener número');

// Rate limiting para login
@Throttle(5, 60) // 5 intentos por minuto
@Post('login')
login(@Body() dto: LoginDto) {
  return this.authService.login(dto);
}

// Expiración de tokens
const token = this.jwtService.sign(payload, {
  expiresIn: '1h', // No tokens eternos
});
```

### 8. Software and Data Integrity Failures

```typescript
// Verificar integridad de datos críticos
import * as crypto from 'crypto';

function generateChecksum(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Para certificados, verificar que no fueron alterados
const certificado = await prisma.certificado.findUnique({
  where: { id },
});

const checksumActual = generateChecksum(JSON.stringify(certificado.datos));
if (checksumActual !== certificado.checksum) {
  throw new Error('Certificado alterado');
}
```

### 9. Security Logging and Monitoring Failures

```typescript
// Loggear eventos de seguridad
@Injectable()
export class SecurityLogger {
  private logger = new Logger('Security');

  logLoginAttempt(email: string, success: boolean, ip: string) {
    this.logger.log({
      event: 'LOGIN_ATTEMPT',
      email,
      success,
      ip,
      timestamp: new Date().toISOString(),
    });
  }

  logAccessDenied(userId: string, resource: string) {
    this.logger.warn({
      event: 'ACCESS_DENIED',
      userId,
      resource,
      timestamp: new Date().toISOString(),
    });
  }

  logSuspiciousActivity(details: any) {
    this.logger.error({
      event: 'SUSPICIOUS_ACTIVITY',
      ...details,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### 10. Server-Side Request Forgery (SSRF)

```typescript
// ❌ Malo: fetch a URL del usuario sin validar
@Post('fetch-url')
async fetchUrl(@Body('url') url: string) {
  const response = await fetch(url); // Peligroso
  return response.text();
}

// ✅ Bueno: validar URL contra whitelist
const ALLOWED_DOMAINS = ['youtube.com', 'vimeo.com'];

@Post('fetch-video')
async fetchVideo(@Body('url') url: string) {
  const parsedUrl = new URL(url);

  if (!ALLOWED_DOMAINS.includes(parsedUrl.hostname)) {
    throw new BadRequestException('Dominio no permitido');
  }

  const response = await fetch(url);
  return response.text();
}
```

---

## Validación de Inputs

### Usar DTOs con class-validator

```typescript
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUsuarioDto {
  @IsEmail({}, { message: 'Email inválido' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsString()
  @MinLength(8, { message: 'Mínimo 8 caracteres' })
  @MaxLength(100)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  nombre: string;

  @IsOptional()
  @IsEnum(Rol)
  rol?: Rol;
}
```

### Validar en el Pipe Global

```typescript
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Remueve propiedades no declaradas
    forbidNonWhitelisted: true, // Error si hay propiedades extra
    transform: true, // Transforma tipos automáticamente
  })
);
```

---

## Manejo de Secrets

### Variables de Entorno

```bash
# .env (NUNCA commitear)
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
REDIS_URL="..."

# .env.example (commitear, sin valores reales)
DATABASE_URL="postgresql://user:password@localhost:5432/db"
JWT_SECRET="your-secret-here"
REDIS_URL="redis://localhost:6379"
```

### Validación de Env con Zod

```typescript
// config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  REDIS_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

### Nunca en el Código

```typescript
// ❌ NUNCA
const secret = 'mi-secret-hardcodeado';

// ✅ Siempre desde env
const secret = process.env.JWT_SECRET;
```

---

## XSS Prevention

### En el Frontend (React/Next.js)

```typescript
// React escapa por defecto, pero cuidado con:

// ❌ Peligroso: dangerouslySetInnerHTML sin sanitizar
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ Si necesitás HTML, sanitizar primero
import DOMPurify from 'dompurify';

const sanitizedHtml = DOMPurify.sanitize(userContent);
<div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />

// ✅ Mejor: usar markdown con librería segura
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const html = DOMPurify.sanitize(marked.parse(userMarkdown));
```

### Headers de Seguridad

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline';",
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

---

## Autenticación y Autorización

### JWT Best Practices

```typescript
// Payload mínimo
const payload = {
  sub: user.id, // ID del usuario
  rol: user.rol, // Rol para autorización
  // NO incluir datos sensibles
};

// Expiración corta + refresh tokens
const accessToken = this.jwtService.sign(payload, {
  expiresIn: '15m',
});

const refreshToken = this.jwtService.sign(
  { sub: user.id },
  { expiresIn: '7d' }
);
```

### Guards de Autorización

```typescript
// guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler()
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.rol);
  }
}

// Uso
@Get('admin/usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
getUsuarios() {
  return this.usuariosService.findAll();
}
```

---

## Checklist de Seguridad

### Antes de cada PR

- [ ] Inputs validados con DTOs
- [ ] No hay secrets hardcodeados
- [ ] Permisos verificados en endpoints protegidos
- [ ] No hay console.log con datos sensibles
- [ ] Queries usan Prisma (no SQL raw sin sanitizar)

### Antes de cada Release

- [ ] `npm audit` sin vulnerabilidades críticas
- [ ] Dependencias actualizadas
- [ ] Variables de entorno de producción configuradas
- [ ] SSL/HTTPS funcionando
- [ ] Rate limiting configurado
- [ ] Logs de seguridad activos

### Periódicamente

- [ ] Revisar permisos de usuarios en producción
- [ ] Revisar logs de accesos denegados
- [ ] Rotar secrets (JWT, API keys)
- [ ] Backup de base de datos verificado

---

## Recursos

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [NestJS Security](https://docs.nestjs.com/security/authentication)

---

**Última actualización**: 2025-12-23
**Versión**: 1.0.0
