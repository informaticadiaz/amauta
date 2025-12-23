# Guía de Onboarding Técnico - Amauta

## Bienvenida

Bienvenido al equipo de desarrollo de Amauta. Esta guía te ayudará a estar productivo en el menor tiempo posible.

**Tiempo estimado de onboarding**: 2-3 días

---

## Día 1: Configuración del Entorno

### Objetivos del Día 1

- [ ] Tener el proyecto corriendo localmente
- [ ] Entender la estructura del monorepo
- [ ] Hacer tu primer cambio (aunque sea mínimo)

### Paso 1: Requisitos Previos

Asegurate de tener instalado:

| Herramienta    | Versión Mínima | Verificar                |
| -------------- | -------------- | ------------------------ |
| Node.js        | 20.x           | `node --version`         |
| npm            | 10.x           | `npm --version`          |
| Git            | 2.x            | `git --version`          |
| Docker         | 24.x           | `docker --version`       |
| Docker Compose | 2.x            | `docker compose version` |
| GitHub CLI     | 2.x            | `gh --version`           |

**Instalación rápida (Ubuntu/Debian):**

```bash
# Node.js 20 (via nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# GitHub CLI
sudo apt install gh
gh auth login
```

### Paso 2: Clonar el Repositorio

```bash
# Clonar
git clone https://github.com/[usuario]/amauta.git
cd amauta

# Instalar dependencias
npm install
```

### Paso 3: Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tus valores locales (o usar los defaults para desarrollo)
nano .env
```

Variables mínimas necesarias:

```env
# Base de datos
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/amauta_dev"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT (generar uno aleatorio para desarrollo)
JWT_SECRET="tu-secret-aleatorio-aqui"

# Entorno
NODE_ENV="development"
```

### Paso 4: Levantar Servicios con Docker

```bash
# Levantar PostgreSQL y Redis
docker compose up -d

# Verificar que están corriendo
docker compose ps
```

Deberías ver:

```
NAME                SERVICE             STATUS
amauta-postgres     postgres            running
amauta-redis        redis               running
```

### Paso 5: Configurar Base de Datos

```bash
# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# (Opcional) Cargar datos de prueba
npm run prisma:seed
```

### Paso 6: Ejecutar el Proyecto

```bash
# Desarrollo (todos los workspaces)
npm run dev
```

Esto levanta:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

### Paso 7: Verificar que Todo Funciona

```bash
# Backend health check
curl http://localhost:3001/health

# Debería responder: {"status":"ok"}
```

Abrí http://localhost:3000 en el navegador y deberías ver la página de inicio.

### Troubleshooting Día 1

| Problema                | Solución                                                                    |
| ----------------------- | --------------------------------------------------------------------------- |
| Puerto 5432 ocupado     | `sudo lsof -i :5432` y matar el proceso, o cambiar puerto en docker-compose |
| `prisma generate` falla | Verificar que Docker está corriendo y DATABASE_URL es correcta              |
| `npm install` falla     | Borrar `node_modules` y `package-lock.json`, reinstalar                     |
| Frontend no carga       | Verificar que el backend está corriendo primero                             |

---

## Día 2: Entender la Arquitectura

### Objetivos del Día 2

- [ ] Entender la estructura del monorepo
- [ ] Conocer las tecnologías principales
- [ ] Navegar el código con confianza

### Estructura del Monorepo

```
amauta/
├── apps/
│   ├── web/                 # Frontend Next.js
│   │   ├── src/
│   │   │   ├── app/         # App Router (páginas)
│   │   │   ├── components/  # Componentes React
│   │   │   └── lib/         # Utilidades
│   │   └── package.json
│   │
│   └── api/                 # Backend NestJS + Fastify
│       ├── src/
│       │   ├── modules/     # Módulos de dominio
│       │   ├── common/      # Código compartido
│       │   └── main.ts      # Entry point
│       └── package.json
│
├── packages/
│   ├── shared/              # Código compartido entre apps
│   └── types/               # Tipos TypeScript compartidos
│
├── prisma/
│   ├── schema.prisma        # Definición de modelos
│   └── migrations/          # Migraciones de DB
│
└── docs/                    # Documentación
```

### Stack Tecnológico

**Frontend (apps/web):**

- Next.js 14+ (App Router)
- React 18+
- TypeScript (strict mode)
- Tailwind CSS

**Backend (apps/api):**

- NestJS 10+
- Fastify (en lugar de Express)
- Prisma ORM
- PostgreSQL 15+
- Redis 7+

**Herramientas:**

- Turborepo (monorepo)
- ESLint + Prettier
- Husky (pre-commit hooks)
- GitHub Actions (CI/CD)

### Lecturas Recomendadas

Dedicá tiempo a leer estos documentos:

1. **`CLAUDE.md`** (15 min) - Contexto general del proyecto
2. **`docs/technical/architecture.md`** (30 min) - Arquitectura detallada
3. **`docs/technical/database.md`** (20 min) - Modelos de datos
4. **`docs/project-management/sistema-gestion.md`** (30 min) - Cómo trabajamos

### Explorar el Código

Tareas de exploración:

```bash
# Ver estructura de carpetas
tree -L 3 -I node_modules

# Ver modelos de Prisma
cat prisma/schema.prisma

# Ver endpoints del API
ls apps/api/src/modules/

# Ver páginas del frontend
ls apps/web/src/app/
```

### Ejercicio Práctico

Hacé estos cambios pequeños para familiarizarte:

1. **Cambiar un texto en el frontend**
   - Editá `apps/web/src/app/page.tsx`
   - Cambiá el título de bienvenida
   - Verificá que hot reload funciona

2. **Ver los logs del backend**
   - Hacé una request al API
   - Observá los logs en la terminal

3. **Explorar Prisma Studio**
   ```bash
   npm run prisma:studio
   ```

   - Abrí http://localhost:5555
   - Navegá los modelos de datos

---

## Día 3: Primera Tarea Real

### Objetivos del Día 3

- [ ] Completar tu primera tarea del proyecto
- [ ] Hacer tu primer commit siguiendo las convenciones
- [ ] Entender el flujo de trabajo completo

### Elegir tu Primera Tarea

```bash
# Ver issues disponibles
gh issue list --label "good-first-issue"

# Si no hay good-first-issue, buscar tareas pequeñas
gh issue list --limit 20
```

Elegí una tarea de 1-3 puntos para empezar.

### Flujo de Trabajo

```bash
# 1. Ver detalles del issue
gh issue view <número>

# 2. Crear rama (opcional pero recomendado)
git checkout -b feature/T-XXX-descripcion

# 3. Trabajar en la tarea
# ... hacer cambios ...

# 4. Verificar cambios
npm run lint
npm run type-check
npm run build

# 5. Commit
git add .
git commit -m "feat: descripción del cambio

- Detalle 1
- Detalle 2

Resuelve: #<número>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 6. Push (si usaste rama)
git push -u origin feature/T-XXX-descripcion

# 7. Cerrar issue
gh issue close <número> --comment "✅ Completado. [descripción]"
```

### Checklist Antes de Commit

- [ ] El código compila sin errores (`npm run build`)
- [ ] No hay errores de linting (`npm run lint`)
- [ ] No hay errores de tipos (`npm run type-check`)
- [ ] Probé los cambios manualmente
- [ ] El mensaje de commit sigue el formato

---

## Checklist de Onboarding Completo

### Entorno

- [ ] Node.js 20+ instalado
- [ ] Docker y Docker Compose funcionando
- [ ] GitHub CLI configurado y autenticado
- [ ] Proyecto clonado y dependencias instaladas
- [ ] Variables de entorno configuradas
- [ ] Base de datos corriendo y migrada
- [ ] Frontend y backend corriendo localmente

### Conocimiento

- [ ] Leí CLAUDE.md
- [ ] Leí docs/technical/architecture.md
- [ ] Leí docs/project-management/sistema-gestion.md
- [ ] Entiendo la estructura del monorepo
- [ ] Sé dónde están los modelos de Prisma
- [ ] Sé dónde están los endpoints del API
- [ ] Sé dónde están las páginas del frontend

### Práctica

- [ ] Hice un cambio en el frontend y vi hot reload
- [ ] Exploré Prisma Studio
- [ ] Hice mi primer commit siguiendo las convenciones
- [ ] Cerré mi primer issue

---

## Recursos de Aprendizaje

### Si no conocés alguna tecnología

| Tecnología   | Recurso Recomendado                                                        |
| ------------ | -------------------------------------------------------------------------- |
| Next.js      | [Next.js Learn](https://nextjs.org/learn)                                  |
| NestJS       | [NestJS Docs](https://docs.nestjs.com/)                                    |
| Prisma       | [Prisma Quickstart](https://www.prisma.io/docs/getting-started/quickstart) |
| TypeScript   | [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)       |
| Tailwind CSS | [Tailwind Docs](https://tailwindcss.com/docs)                              |

### Canales de Ayuda

- **Issues de GitHub**: Para reportar problemas o pedir clarificaciones
- **Discusiones de GitHub**: Para preguntas generales
- **Documentación**: Siempre revisar `/docs` primero

---

## Preguntas Frecuentes de Nuevos Desarrolladores

### ¿Por qué usamos Turborepo?

Permite manejar múltiples aplicaciones (web, api) y packages compartidos en un solo repositorio, con builds optimizados y caché inteligente.

### ¿Por qué NestJS con Fastify en lugar de Express?

- NestJS: Estructura modular, inyección de dependencias, decoradores
- Fastify: Más rápido que Express, mejor para APIs de alto rendimiento

### ¿Dónde pongo código nuevo?

| Tipo de código         | Ubicación                        |
| ---------------------- | -------------------------------- |
| Página nueva           | `apps/web/src/app/`              |
| Componente React       | `apps/web/src/components/`       |
| Endpoint API           | `apps/api/src/modules/[modulo]/` |
| Modelo de datos        | `prisma/schema.prisma`           |
| Tipos compartidos      | `packages/types/`                |
| Utilidades compartidas | `packages/shared/`               |

### ¿Cómo creo una migración de base de datos?

```bash
# Después de modificar schema.prisma
npm run prisma:migrate -- --name descripcion_del_cambio
```

### ¿Cómo reseteo la base de datos?

```bash
# Borrar y recrear
npm run prisma:reset
```

---

**Última actualización**: 2025-12-23
**Versión**: 1.0.0
