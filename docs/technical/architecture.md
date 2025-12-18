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
- **Framework**: Express o Fastify
- **Lenguaje**: TypeScript
- **ORM**: Prisma
- **Autenticación**: NextAuth.js / Passport.js
- **Validación**: Zod
- **API**: RESTful (GraphQL opcional futuro)

### Base de Datos
- **Principal**: PostgreSQL 15+
- **Caché**: Redis
- **Búsqueda**: PostgreSQL Full-Text Search (Elasticsearch futuro)

### DevOps
- **Contenedores**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoreo**: (A definir)
- **Logs**: Winston / Pino

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

## Próximos Pasos

Ver [Roadmap](../project-management/roadmap.md) para el plan de implementación por fases.
