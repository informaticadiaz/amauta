# @amauta/web

Frontend de Amauta - Aplicación Next.js PWA

## Estado del workspace

Este README describe el frontend verificable en `apps/web/src` y no mantiene una fase o sprint propio. Para fase de producto, sprint y estado de funcionalidades consultar [`docs/project-management/roadmap.md`](../../docs/project-management/roadmap.md).

La implementación del workspace contiene App Router, autenticación, catálogo y detalle de cursos, lecciones, dashboard, evaluaciones, foros, grupos, asistencias, calificaciones, comunicados, reportes, rutas proxy de API y rutas offline/PWA. Las capacidades detalladas deben considerarse implementadas únicamente cuando exista evidencia funcional en código y verificaciones; este README no convierte una intención del roadmap en un estado completado.

## Tecnologías

- **Next.js** con App Router
- **React 18**
- **TypeScript** en modo strict
- **Zod** para validación de env vars

## Desarrollo

```bash
# Desde la raíz del monorepo
npm run dev

# Solo este workspace
npm run dev --workspace=@amauta/web

# Build de producción
npm run build --workspace=@amauta/web

# Verificar tipos
npm run type-check --workspace=@amauta/web
```

## Estructura

```
apps/web/
├── src/
│   ├── app/              # App Router de Next.js
│   │   ├── layout.tsx    # Layout raíz con metadata
│   │   ├── page.tsx      # Página principal
│   │   ├── globals.css   # Estilos globales
│   │   └── icon.svg      # Favicon
│   └── config/
│       └── env.ts        # Validación de variables de entorno
├── public/               # Assets estáticos
├── next.config.js        # Configuración de Next.js
├── Dockerfile            # Build multi-stage para producción
└── package.json
```

## Variables de Entorno

Ver `.env.example` para la lista completa. Variables principales:

| Variable              | Descripción          | Requerida  |
| --------------------- | -------------------- | ---------- |
| `NEXT_PUBLIC_API_URL` | URL del backend API  | Sí         |
| `NEXT_PUBLIC_APP_URL` | URL de la aplicación | Sí         |
| `NEXTAUTH_SECRET`     | Secret para NextAuth | Producción |

## Docker

El Dockerfile está configurado para producción con output standalone:

```bash
# Build de imagen
docker build -t amauta-web -f apps/web/Dockerfile .

# Ejecutar
docker run -p 3000:3000 amauta-web
```

## Scripts

| Script       | Descripción                   |
| ------------ | ----------------------------- |
| `dev`        | Inicia servidor de desarrollo |
| `build`      | Genera build de producción    |
| `start`      | Inicia servidor de producción |
| `lint`       | Ejecuta ESLint                |
| `type-check` | Verifica tipos TypeScript     |
