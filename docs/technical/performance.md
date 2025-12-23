# Guía de Performance - Amauta

## Importancia para Amauta

Amauta tiene como misión servir a comunidades con conectividad limitada. La performance no es un lujo, es un requisito para cumplir nuestra misión social.

### Objetivos de Performance

| Métrica                            | Objetivo | Crítico |
| ---------------------------------- | -------- | ------- |
| **LCP** (Largest Contentful Paint) | < 2.5s   | < 4s    |
| **FID** (First Input Delay)        | < 100ms  | < 300ms |
| **CLS** (Cumulative Layout Shift)  | < 0.1    | < 0.25  |
| **TTFB** (Time to First Byte)      | < 200ms  | < 600ms |
| **Bundle Size** (JS inicial)       | < 100KB  | < 200KB |
| **API Response Time**              | < 200ms  | < 500ms |

---

## Frontend Performance

### React Server Components

Next.js App Router usa RSC por defecto. Esto reduce JavaScript en el cliente.

```typescript
// ✅ Server Component (por defecto) - No envía JS al cliente
async function CursosPage() {
  const cursos = await getCursos(); // Ejecuta en servidor
  return <CursosList cursos={cursos} />;
}

// ⚠️ Client Component - Envía JS al cliente
'use client';
function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

**Regla**: Solo usar `'use client'` cuando necesitás interactividad.

### Code Splitting

Next.js hace code splitting automático por ruta. Para componentes pesados:

```typescript
import dynamic from 'next/dynamic';

// Carga el componente solo cuando se necesita
const EditorPesado = dynamic(
  () => import('@/components/EditorPesado'),
  {
    loading: () => <p>Cargando editor...</p>,
    ssr: false, // Si no necesita SSR
  }
);

export default function PaginaConEditor() {
  return (
    <div>
      <h1>Editor de Contenido</h1>
      <EditorPesado />
    </div>
  );
}
```

### Optimización de Imágenes

```typescript
import Image from 'next/image';

// ✅ Bueno: next/image optimiza automáticamente
<Image
  src="/curso-thumbnail.jpg"
  alt="Thumbnail del curso"
  width={300}
  height={200}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// ❌ Malo: img sin optimizar
<img src="/curso-thumbnail.jpg" alt="Thumbnail" />
```

**Beneficios de next/image**:

- Lazy loading automático
- Conversión a WebP/AVIF
- Responsive sizes
- Previene CLS

### Fonts

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Evita FOUT
  preload: true,
});

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

### Prefetching

Next.js prefetches links automáticamente. Para control manual:

```typescript
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Prefetch automático (hover)
<Link href="/cursos">Ver Cursos</Link>

// Prefetch manual
const router = useRouter();
router.prefetch('/dashboard');
```

### Bundle Analysis

```bash
# Instalar
npm install @next/bundle-analyzer

# next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({});

# Ejecutar
ANALYZE=true npm run build
```

---

## Backend Performance

### Optimización de Queries

#### Evitar N+1

```typescript
// ❌ N+1: 1 + N queries
const cursos = await prisma.curso.findMany();
for (const curso of cursos) {
  const lecciones = await prisma.leccion.findMany({
    where: { cursoId: curso.id },
  });
}

// ✅ Una query con include
const cursos = await prisma.curso.findMany({
  include: { lecciones: true },
});

// ✅ O con select para traer solo lo necesario
const cursos = await prisma.curso.findMany({
  select: {
    id: true,
    titulo: true,
    lecciones: {
      select: {
        id: true,
        titulo: true,
      },
    },
  },
});
```

#### Paginación

```typescript
// ✅ Siempre paginar listas
const cursos = await prisma.curso.findMany({
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' },
});
```

#### Índices de Base de Datos

```prisma
// schema.prisma
model Curso {
  id          String   @id @default(cuid())
  titulo      String
  publicado   Boolean  @default(false)
  educadorId  String
  createdAt   DateTime @default(now())

  // Índices para queries frecuentes
  @@index([publicado])
  @@index([educadorId])
  @@index([createdAt])
}

model Inscripcion {
  id          String @id @default(cuid())
  usuarioId   String
  cursoId     String

  // Índice compuesto para búsquedas frecuentes
  @@unique([usuarioId, cursoId])
  @@index([cursoId])
}
```

### Caching

#### Cache con Redis

```typescript
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class CacheService {
  constructor(private redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

// Uso en service
@Injectable()
export class CursosService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService
  ) {}

  async findAll(): Promise<Curso[]> {
    const cacheKey = 'cursos:publicados';

    // Intentar cache primero
    const cached = await this.cache.get<Curso[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Si no hay cache, consultar DB
    const cursos = await this.prisma.curso.findMany({
      where: { publicado: true },
    });

    // Guardar en cache
    await this.cache.set(cacheKey, cursos, 300); // 5 minutos

    return cursos;
  }

  async update(id: string, data: UpdateCursoDto) {
    const curso = await this.prisma.curso.update({
      where: { id },
      data,
    });

    // Invalidar cache relacionado
    await this.cache.invalidate('cursos:*');

    return curso;
  }
}
```

#### HTTP Caching

```typescript
// Controller con cache headers
@Get('cursos')
@Header('Cache-Control', 'public, max-age=300') // 5 min
findAll() {
  return this.cursosService.findAll();
}

// Para contenido estático
@Get('assets/:filename')
@Header('Cache-Control', 'public, max-age=31536000, immutable') // 1 año
getAsset(@Param('filename') filename: string) {
  return this.assetsService.get(filename);
}
```

### Compresión

```typescript
// main.ts
import compression from '@fastify/compress';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  await app.register(compression, {
    encodings: ['gzip', 'deflate', 'br'], // Brotli incluido
  });

  await app.listen(3001);
}
```

### Connection Pooling

```typescript
// Prisma ya maneja connection pooling
// Configuración en DATABASE_URL:
// postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=10
```

---

## Database Performance

### Queries Lentas

Activar logging de queries lentas:

```typescript
const prisma = new PrismaClient({
  log: [{ emit: 'event', level: 'query' }],
});

prisma.$on('query', (e) => {
  if (e.duration > 100) {
    // > 100ms
    console.warn(`Query lenta (${e.duration}ms):`, e.query);
  }
});
```

### EXPLAIN ANALYZE

```sql
-- Ver plan de ejecución
EXPLAIN ANALYZE SELECT * FROM "Curso" WHERE "publicado" = true;

-- Índice faltante se ve en: Seq Scan (escaneo secuencial)
-- Con índice: Index Scan (mucho más rápido)
```

### Mantenimiento

```sql
-- Ejecutar periódicamente en producción
VACUUM ANALYZE;  -- Limpia y actualiza estadísticas
REINDEX DATABASE amauta;  -- Reconstruye índices
```

---

## Monitoring

### Métricas a Monitorear

| Métrica        | Herramienta    | Alerta     |
| -------------- | -------------- | ---------- |
| Response Time  | Logs / APM     | > 500ms    |
| Error Rate     | Logs / Sentry  | > 1%       |
| CPU Usage      | VPS Metrics    | > 80%      |
| Memory Usage   | VPS Metrics    | > 80%      |
| DB Connections | Prisma Metrics | > 80% pool |
| Cache Hit Rate | Redis INFO     | < 80%      |

### Logging de Performance

```typescript
// Middleware para loggear tiempos
@Injectable()
export class PerformanceMiddleware implements NestMiddleware {
  private logger = new Logger('Performance');

  use(req: FastifyRequest, res: FastifyReply, next: () => void) {
    const start = Date.now();

    res.raw.on('finish', () => {
      const duration = Date.now() - start;
      const { method, url } = req;

      if (duration > 200) {
        this.logger.warn(`${method} ${url} - ${duration}ms`);
      } else {
        this.logger.log(`${method} ${url} - ${duration}ms`);
      }
    });

    next();
  }
}
```

---

## Checklist de Performance

### Antes de cada PR

- [ ] No hay queries N+1 nuevas
- [ ] Imágenes usan next/image
- [ ] Componentes client solo donde es necesario
- [ ] Listas paginadas

### Antes de cada Release

- [ ] Bundle size no aumentó significativamente
- [ ] Lighthouse score > 90
- [ ] Queries lentas identificadas y optimizadas
- [ ] Cache configurado para endpoints frecuentes

### Periódicamente

- [ ] Revisar Core Web Vitals en Search Console
- [ ] Analizar logs de queries lentas
- [ ] Revisar cache hit rate
- [ ] Ejecutar VACUUM ANALYZE en DB

---

## Anti-Patrones de Performance

| Anti-Patrón            | Problema       | Solución          |
| ---------------------- | -------------- | ----------------- |
| Fetch en loop          | N+1 requests   | Batch o include   |
| Bundle gigante         | Carga lenta    | Code splitting    |
| No pagination          | Memoria/tiempo | Siempre paginar   |
| Cache infinito         | Datos stale    | TTL apropiado     |
| Imágenes sin optimizar | LCP alto       | next/image        |
| Todo en cliente        | JS excesivo    | Server Components |

---

## Herramientas

### Análisis Frontend

- **Lighthouse**: Chrome DevTools → Lighthouse
- **WebPageTest**: https://webpagetest.org/
- **Bundle Analyzer**: `ANALYZE=true npm run build`

### Análisis Backend

- **Prisma Studio**: Ver queries
- **pgAdmin**: Analizar PostgreSQL
- **Redis CLI**: `redis-cli INFO stats`

### Profiling

```typescript
// Node.js profiling
node --inspect apps/api/dist/main.js
// Abrir chrome://inspect
```

---

## Recursos

- [Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Prisma Performance](https://www.prisma.io/docs/guides/performance-and-optimization)
- [PostgreSQL Performance](https://www.postgresql.org/docs/current/performance-tips.html)

---

**Última actualización**: 2025-12-23
**Versión**: 1.0.0
