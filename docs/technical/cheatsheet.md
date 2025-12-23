# Cheatsheet - Amauta

Referencia rápida de comandos y convenciones del proyecto.

---

## Comandos NPM

### Desarrollo

```bash
# Levantar todo el proyecto en modo desarrollo
npm run dev

# Solo frontend
npm run dev --workspace=@amauta/web

# Solo backend
npm run dev --workspace=@amauta/api
```

### Build y Verificación

```bash
# Build de producción
npm run build

# Verificar tipos TypeScript
npm run type-check

# Linting
npm run lint

# Linting con fix automático
npm run lint:fix

# Formatear código
npm run format

# Verificar formato
npm run format:check
```

### Testing

```bash
# Ejecutar todos los tests
npm run test

# Tests en modo watch
npm run test:watch

# Tests con cobertura
npm run test:cov

# Tests E2E
npm run test:e2e
```

### Base de Datos (Prisma)

```bash
# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Crear nueva migración
npm run prisma:migrate -- --name nombre_de_migracion

# Resetear base de datos
npm run prisma:reset

# Abrir Prisma Studio
npm run prisma:studio

# Seed data
npm run prisma:seed
```

---

## Comandos Git

### Flujo Básico

```bash
# Ver estado
git status

# Agregar archivos
git add .
git add archivo.ts

# Commit con formato
git commit -m "tipo: descripción"

# Push
git push
git push -u origin nombre-rama
```

### Ramas

```bash
# Crear y cambiar a nueva rama
git checkout -b feature/T-XXX-descripcion

# Cambiar de rama
git checkout main
git checkout nombre-rama

# Ver ramas
git branch -a

# Eliminar rama local
git branch -d nombre-rama
```

### Historial

```bash
# Ver log resumido
git log --oneline -10

# Ver cambios de un archivo
git log -p archivo.ts

# Ver diferencias
git diff
git diff --staged
```

---

## Comandos GitHub CLI

### Issues

```bash
# Listar issues abiertos
gh issue list

# Listar con límite
gh issue list --limit 100

# Filtrar por label
gh issue list --label "must-have"
gh issue list --label "backend"

# Ver detalles de un issue
gh issue view <número>

# Ver issue en formato JSON
gh issue view <número> --json title,body,labels

# Crear issue
gh issue create --title "T-XXX: Título" --body "Descripción"

# Cerrar issue
gh issue close <número> --comment "✅ Completado..."

# Reabrir issue
gh issue reopen <número>
```

### Pull Requests

```bash
# Listar PRs
gh pr list

# Crear PR
gh pr create --title "Título" --body "Descripción"

# Ver PR
gh pr view <número>

# Checkout de un PR
gh pr checkout <número>

# Aprobar PR
gh pr review --approve

# Merge PR
gh pr merge <número>
```

---

## Formato de Commits

### Estructura

```
<tipo>: <descripción corta>

<cuerpo opcional>

Resuelve: #<número>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Tipos

| Tipo       | Uso                             |
| ---------- | ------------------------------- |
| `feat`     | Nueva funcionalidad             |
| `fix`      | Corrección de bug               |
| `docs`     | Documentación                   |
| `style`    | Formateo (sin cambio de lógica) |
| `refactor` | Refactorización                 |
| `test`     | Tests                           |
| `chore`    | Mantenimiento                   |

### Ejemplos

```bash
# Feature
git commit -m "feat: agregar endpoint de inscripción a cursos

- Crear POST /cursos/:id/inscribirse
- Validar que el usuario no esté ya inscrito
- Enviar email de confirmación

Resuelve: #45"

# Fix
git commit -m "fix: corregir cálculo de progreso del curso

El progreso no consideraba lecciones opcionales.

Resuelve: #78"

# Docs
git commit -m "docs: actualizar guía de instalación

- Agregar requisitos de Docker
- Corregir comando de migración"
```

---

## Estructura de Archivos

### Dónde poner código nuevo

| Tipo                | Ubicación                                   |
| ------------------- | ------------------------------------------- |
| Página web          | `apps/web/src/app/ruta/page.tsx`            |
| Componente React    | `apps/web/src/components/NombreComponente/` |
| Hook personalizado  | `apps/web/src/hooks/useNombre.ts`           |
| Utilidad frontend   | `apps/web/src/lib/nombre.ts`                |
| Endpoint API        | `apps/api/src/modules/nombre/`              |
| Modelo Prisma       | `prisma/schema.prisma`                      |
| Tipo compartido     | `packages/types/src/`                       |
| Utilidad compartida | `packages/shared/src/`                      |

### Naming Conventions

| Tipo              | Convención              | Ejemplo                |
| ----------------- | ----------------------- | ---------------------- |
| Componentes React | PascalCase              | `UserProfile.tsx`      |
| Hooks             | camelCase con use       | `useAuth.ts`           |
| Utilidades        | camelCase               | `formatDate.ts`        |
| Constantes        | UPPER_SNAKE             | `MAX_FILE_SIZE`        |
| Tipos/Interfaces  | PascalCase              | `User`, `ICurso`       |
| Archivos de test  | `.test.ts` o `.spec.ts` | `auth.service.spec.ts` |

---

## Prisma

### Schema Básico

```prisma
model Usuario {
  id        String   @id @default(cuid())
  email     String   @unique
  nombre    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relaciones
  cursos    Curso[]
}
```

### Queries Comunes

```typescript
// Buscar uno
const user = await prisma.usuario.findUnique({
  where: { id: 'xxx' },
});

// Buscar muchos
const users = await prisma.usuario.findMany({
  where: { activo: true },
  orderBy: { createdAt: 'desc' },
  take: 10,
});

// Crear
const user = await prisma.usuario.create({
  data: { email: 'test@test.com', nombre: 'Test' },
});

// Actualizar
const user = await prisma.usuario.update({
  where: { id: 'xxx' },
  data: { nombre: 'Nuevo Nombre' },
});

// Eliminar
await prisma.usuario.delete({
  where: { id: 'xxx' },
});

// Con relaciones
const curso = await prisma.curso.findUnique({
  where: { id: 'xxx' },
  include: {
    educador: true,
    lecciones: true,
  },
});
```

---

## NestJS

### Crear módulo nuevo

```bash
# Estructura manual
mkdir -p apps/api/src/modules/nombre
touch apps/api/src/modules/nombre/nombre.module.ts
touch apps/api/src/modules/nombre/nombre.controller.ts
touch apps/api/src/modules/nombre/nombre.service.ts
touch apps/api/src/modules/nombre/dto/create-nombre.dto.ts
```

### Estructura de un Controller

```typescript
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@Controller('cursos')
@UseGuards(JwtAuthGuard)
export class CursosController {
  constructor(private readonly cursosService: CursosService) {}

  @Get()
  findAll() {
    return this.cursosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cursosService.findOne(id);
  }

  @Post()
  create(@Body() createCursoDto: CreateCursoDto) {
    return this.cursosService.create(createCursoDto);
  }
}
```

### Estructura de un Service

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class CursosService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.curso.findMany({
      where: { publicado: true },
    });
  }

  async findOne(id: string) {
    const curso = await this.prisma.curso.findUnique({
      where: { id },
    });

    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }

    return curso;
  }
}
```

---

## Next.js (App Router)

### Crear página nueva

```
apps/web/src/app/
├── cursos/
│   ├── page.tsx           # /cursos
│   ├── [id]/
│   │   └── page.tsx       # /cursos/:id
│   └── nuevo/
│       └── page.tsx       # /cursos/nuevo
```

### Estructura de una página

```typescript
// apps/web/src/app/cursos/page.tsx
export default async function CursosPage() {
  const cursos = await fetchCursos();

  return (
    <div>
      <h1>Cursos</h1>
      {cursos.map(curso => (
        <CursoCard key={curso.id} curso={curso} />
      ))}
    </div>
  );
}
```

### Componente Cliente

```typescript
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

---

## Docker

### Comandos básicos

```bash
# Levantar servicios
docker compose up -d

# Ver servicios corriendo
docker compose ps

# Ver logs
docker compose logs -f
docker compose logs postgres

# Detener servicios
docker compose down

# Detener y borrar volúmenes
docker compose down -v

# Reiniciar un servicio
docker compose restart postgres
```

### Acceder a la base de datos

```bash
# Conectar a PostgreSQL
docker compose exec postgres psql -U postgres -d amauta_dev

# Ejecutar comando SQL
docker compose exec postgres psql -U postgres -d amauta_dev -c "SELECT * FROM usuarios LIMIT 5;"
```

---

## URLs Útiles

### Desarrollo Local

| Servicio      | URL                   |
| ------------- | --------------------- |
| Frontend      | http://localhost:3000 |
| Backend API   | http://localhost:3001 |
| Prisma Studio | http://localhost:5555 |

### Producción

| Servicio    | URL                               |
| ----------- | --------------------------------- |
| Frontend    | https://amauta.diazignacio.ar     |
| Backend API | https://amauta-api.diazignacio.ar |

---

## Atajos de Teclado (VSCode)

| Atajo          | Acción             |
| -------------- | ------------------ |
| `Ctrl+P`       | Buscar archivo     |
| `Ctrl+Shift+P` | Command palette    |
| `Ctrl+Shift+F` | Buscar en proyecto |
| `Ctrl+\``      | Terminal integrada |
| `F12`          | Ir a definición    |
| `Shift+F12`    | Ver referencias    |
| `Ctrl+.`       | Quick fix          |
| `Alt+Shift+F`  | Formatear archivo  |

---

## Troubleshooting Rápido

| Problema              | Solución                                               |
| --------------------- | ------------------------------------------------------ |
| `npm install` falla   | `rm -rf node_modules package-lock.json && npm install` |
| Puerto ocupado        | `lsof -i :3000` y matar proceso                        |
| Prisma desactualizado | `npm run prisma:generate`                              |
| Types no actualizan   | Reiniciar TypeScript server en VSCode                  |
| Docker no levanta     | `docker compose down -v && docker compose up -d`       |
| Git hooks no corren   | `npx husky install`                                    |

---

**Última actualización**: 2025-12-23
