# Arquitectura del Sistema - Amauta

## Visión General

Amauta es una plataforma educativa progresiva (PWA) construida con una arquitectura moderna y modular que prioriza:

- **Accesibilidad universal**: Funciona en cualquier dispositivo con navegador
- **Offline-first**: Contenido disponible sin conexión a internet
- **Escalabilidad**: Diseñada para crecer con la comunidad
- **Mantenibilidad**: Código limpio y bien documentado

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (PWA)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Next.js    │  │  Service     │  │  IndexedDB   │  │
│  │   App Router │  │  Worker      │  │  (Offline)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                      HTTPS/REST API
                           │
┌─────────────────────────────────────────────────────────┐
│                    SERVIDOR BACKEND                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Express/   │  │  Auth        │  │  Redis       │  │
│  │   Fastify    │  │  Middleware  │  │  (Cache)     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                           │                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Business    │  │  Data Access │  │  PostgreSQL  │  │
│  │  Logic       │  │  Layer       │  │  (Prisma)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                    ALMACENAMIENTO                        │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │  Archivos    │  │  CDN         │                    │
│  │  Multimedia  │  │  (Opcional)  │                    │
│  └──────────────┘  └──────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

## Stack Tecnológico

### Frontend

- **Framework**: Next.js 14+ (App Router)
- **Lenguaje**: TypeScript
- **UI**: Tailwind CSS + Radix UI / shadcn/ui
- **Estado**: Zustand para estado global
- **Offline**: Workbox + IndexedDB
- **Validación**: Zod
- **Formularios**: React Hook Form

### Backend

- **Runtime**: Node.js 20+
- **Framework**: NestJS (con adaptador Fastify)
- **Lenguaje**: TypeScript (strict mode)
- **ORM**: Prisma
- **Autenticación**: Passport.js (JWT strategy)
- **Validación**: Zod + class-validator
- **API**: RESTful (GraphQL opcional futuro)
- **Arquitectura**: Modular (controllers, services, repositories)

### Base de Datos

- **Principal**: PostgreSQL 15+
- **Caché**: Redis 7+ (configurado, en uso desde Fase 1)
- **Búsqueda**: PostgreSQL Full-Text Search (Elasticsearch futuro)

### DevOps

- **Desarrollo Local**: Docker + Docker Compose (obligatorio)
- **Deployment**: Dokploy en VPS
- **CI/CD**: GitHub Actions
- **Monitoreo**: (A definir - Fase 1)
- **Logs**: Pino (recomendado para NestJS + Fastify)

## Patrones de Arquitectura

### 1. Arquitectura en Capas

```
┌─────────────────────────────────┐
│  Presentation Layer (Next.js)   │  ← UI Components, Pages
├─────────────────────────────────┤
│  API Layer (REST Endpoints)     │  ← Controllers, Routes
├─────────────────────────────────┤
│  Business Logic Layer           │  ← Services, Use Cases
├─────────────────────────────────┤
│  Data Access Layer (Prisma)     │  ← Repositories, Models
├─────────────────────────────────┤
│  Database (PostgreSQL)           │  ← Persistent Storage
└─────────────────────────────────┘
```

### 2. Estrategia Offline-First

**Service Worker** intercepta requests:

1. **Cache First**: Recursos estáticos (CSS, JS, imágenes)
2. **Network First**: Contenido dinámico (cursos, usuarios)
3. **Stale While Revalidate**: Contenido semi-estático (catálogo de cursos)

**IndexedDB** almacena:

- Contenido de cursos descargados
- Progreso del estudiante
- Datos pendientes de sincronización

**Sincronización**:

- Background Sync API para operaciones offline
- Conflict resolution para datos modificados offline

### 3. Módulos Principales

#### Módulo de Usuarios y Autenticación

- Registro y autenticación
- Perfiles (estudiante, educador, administrador)
- Roles y permisos

#### Módulo de Cursos

- Creación y gestión de cursos
- Estructura de lecciones y unidades
- Multimedia (videos, documentos, interactivos)
- Descarga para offline

#### Módulo de Aprendizaje

- Seguimiento de progreso
- Sistema de evaluaciones
- Certificaciones
- Gamificación (opcional)

#### Módulo Administrativo Escolar

- Gestión de asistencias
- Registro de calificaciones
- Comunicados y notificaciones
- Reportes académicos

#### Módulo de Comunidad

- Foros de discusión
- Mensajería
- Grupos de estudio
- Colaboración

## Seguridad

### Principios

- Autenticación JWT con refresh tokens
- HTTPS obligatorio en producción
- Sanitización de inputs
- Rate limiting
- CORS configurado
- CSP (Content Security Policy)

### Niveles de Acceso

1. **Público**: Navegación de catálogo
2. **Estudiante**: Acceso a cursos, seguimiento
3. **Educador**: Creación de contenido, seguimiento de alumnos
4. **Administrador Escolar**: Gestión administrativa completa
5. **Super Admin**: Configuración del sistema

## Escalabilidad

### Horizontal

- Backend stateless (sesiones en Redis)
- Load balancer compatible
- Microservicios opcionales para módulos específicos

### Vertical

- Optimización de queries (índices, vistas materializadas)
- Caché estratégico en múltiples niveles
- CDN para contenido estático

### Base de Datos

- Particionamiento por institución educativa
- Read replicas para reportes
- Archivado de datos históricos

## Performance

### Frontend

- Code splitting automático (Next.js)
- Lazy loading de componentes
- Optimización de imágenes (next/image)
- Prefetching estratégico

### Backend

- Caché de queries frecuentes
- Paginación de resultados
- Compresión gzip/brotli
- Connection pooling

## Consideraciones de Diseño

### Accesibilidad (a11y)

- WCAG 2.1 AA compliance
- Navegación por teclado
- Screen reader friendly
- Alto contraste disponible

### Internacionalización (i18n)

- Soporte multi-idioma (español prioritario)
- Idiomas originarios (quechua, aymara, guaraní)
- RTL support preparado

### Responsive Design

- Mobile-first approach
- Breakpoints: móvil, tablet, desktop
- Touch-friendly interactions

## Decisiones Técnicas Clave

### ¿Por qué NestJS + Fastify?

**NestJS** fue elegido como framework backend porque:

- **Arquitectura enterprise**: Estructura modular escalable desde el inicio
- **TypeScript first-class**: Máxima integración con Prisma y el ecosistema TS
- **Dependency Injection**: Facilita testing, mantenimiento y escalabilidad
- **Decoradores**: Código declarativo y limpio
- **Ecosystem maduro**: Gran cantidad de librerías y patterns establecidos
- **Documentación excelente**: Swagger/OpenAPI integrado

**Fastify** como adaptador (en lugar de Express por defecto) porque:

- **Performance**: ~30-50% más rápido que Express
- **Schema validation nativa**: Validación JSON Schema integrada
- **TypeScript support**: Mejor soporte TypeScript que Express
- **Plugins modernos**: Ecosystem creciente y moderno

**Alternativas consideradas**:

- ❌ Express puro: Más simple pero menos estructura para proyectos grandes
- ❌ Fastify puro: Rápido pero requiere más setup manual
- ✅ NestJS + Fastify: Mejor de ambos mundos

### ¿Por qué Next.js?

- SSR/SSG para SEO y performance
- API routes integradas
- Excelente soporte PWA
- Ecosystem maduro

### ¿Por qué PostgreSQL?

- Robustez para datos académicos críticos
- Full-text search nativo
- JSON support para flexibilidad
- Open source y bien documentado

### ¿Por qué Offline-First?

- Contextos con conectividad limitada
- Acceso universal real
- Mejor experiencia de usuario
- Resistencia a fallos de red

### ¿Por qué Docker obligatorio en desarrollo?

- **Consistencia**: Mismo entorno para todos los desarrolladores
- **Servicios múltiples**: PostgreSQL + Redis configurados automáticamente
- **Aislamiento**: No contaminar sistema local con servicios
- **Paridad desarrollo/producción**: Mismo stack que en VPS
- **Onboarding rápido**: `docker-compose up -d` y listo

## Flujo de Desarrollo

### Entorno Local (Desarrollo)

```bash
# 1. Clonar repositorio
git clone https://github.com/informaticadiaz/amauta.git
cd amauta

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp apps/api/.env.example apps/api/.env.local
cp apps/web/.env.example apps/web/.env.local
# Editar .env.local con valores de desarrollo

# 4. Iniciar servicios (PostgreSQL + Redis)
docker-compose up -d

# 5. Ejecutar migraciones de base de datos
npm run prisma:migrate --workspace=@amauta/api

# 6. (Opcional) Cargar datos de prueba
npm run prisma:seed --workspace=@amauta/api

# 7. Iniciar aplicaciones en modo desarrollo
npm run dev
```

**Servicios disponibles**:

- Frontend: http://localhost:3000
- API Backend: http://localhost:3001
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Prisma Studio: `npm run prisma:studio` → http://localhost:5555

### Entorno de Producción (VPS con Dokploy)

```
Desarrollador → git push → GitHub → Webhook → Dokploy → Deploy automático
```

**Infraestructura**:

- VPS: Dokploy en 72.60.144.210
- Frontend: https://amauta.diazignacio.ar
- API: https://api.amauta.diazignacio.ar
- Base de datos: PostgreSQL en VPS
- Caché: Redis en VPS

**Proceso de deployment**:

1. Desarrollador hace commit y push a `main`
2. GitHub webhook notifica a Dokploy
3. Dokploy ejecuta build de Docker
4. Se ejecutan migraciones de Prisma
5. Se hace deploy de la nueva versión
6. Health checks validan el deployment

Ver [Deployment Guide](./deployment.md) para más detalles.

## Próximos Pasos

Ver [Roadmap](../project-management/roadmap.md) para el plan de implementación por fases.
