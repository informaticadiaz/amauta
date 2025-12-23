# ADR-004: Frontend con Next.js App Router

## Estado

Aceptado

## Fecha

2024-12-15

## Contexto

Necesitamos elegir un framework de frontend para Amauta. El frontend debe:

- Ser una PWA (Progressive Web App)
- Funcionar offline (futuro)
- Tener buen SEO para páginas públicas
- Soportar TypeScript
- Tener buen rendimiento

## Opciones Consideradas

### Opción 1: React SPA (Create React App / Vite)

- **Pros**:
  - Simple de configurar
  - Flexibilidad total
  - Sin server-side rendering
- **Contras**:
  - SEO limitado
  - Tiempo de carga inicial alto
  - No hay SSR/SSG

### Opción 2: Next.js Pages Router

- **Pros**:
  - SSR y SSG
  - Buen SEO
  - Madurez y estabilidad
  - Gran comunidad
- **Contras**:
  - API Routes menos flexibles
  - Data fetching con getServerSideProps/getStaticProps
  - Mixing de client y server menos intuitivo

### Opción 3: Next.js App Router (elegida)

- **Pros**:
  - React Server Components
  - Streaming y Suspense nativo
  - Layouts anidados
  - Mejor DX para data fetching
  - Futuro de Next.js
- **Contras**:
  - Más nuevo, menos ejemplos
  - Algunas librerías no compatibles aún
  - Conceptos nuevos (RSC)

### Opción 4: Remix

- **Pros**:
  - Data loading/mutations elegantes
  - Buena UX para formularios
  - Progressive enhancement
- **Contras**:
  - Comunidad más pequeña
  - Menos integración con Vercel (donde está Turborepo)
  - Cambios frecuentes en el framework

## Decisión

**Usar Next.js 14+ con App Router**.

### Razones principales

1. **React Server Components**: Menos JavaScript en el cliente, mejor performance
2. **Layouts**: Layouts anidados simplifican estructura de la app
3. **Data fetching**: `async/await` directo en componentes servidor
4. **Futuro de React**: RSC es hacia donde va React
5. **Integración con Turborepo**: Ambos de Vercel, excelente soporte
6. **PWA**: next-pwa funciona bien con App Router

## Consecuencias

### Positivas

- Mejor performance inicial (menos JS)
- SEO excelente para páginas públicas
- Caching granular por ruta
- Streaming de contenido
- Layouts persistentes entre navegaciones

### Negativas

- Curva de aprendizaje para RSC
- Hay que entender qué es servidor vs cliente
- Algunas librerías de React no funcionan en server components
- Debugging más complejo (servidor + cliente)

### Neutras

- Estructura de carpetas diferente (`app/` vs `pages/`)
- `'use client'` necesario para componentes interactivos
- Pensar en términos de server-first

## Estructura Resultante

```
apps/web/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Layout raíz
│   │   ├── page.tsx           # Página inicio (/)
│   │   ├── cursos/
│   │   │   ├── page.tsx       # /cursos
│   │   │   └── [id]/
│   │   │       └── page.tsx   # /cursos/:id
│   │   └── dashboard/
│   │       ├── layout.tsx     # Layout del dashboard
│   │       └── page.tsx       # /dashboard
│   ├── components/
│   │   ├── ui/                # Componentes de UI
│   │   └── features/          # Componentes de features
│   └── lib/
│       └── utils.ts
```

## Ejemplo de Data Fetching

```typescript
// app/cursos/page.tsx - Server Component (por defecto)
async function getCursos() {
  const res = await fetch(`${process.env.API_URL}/cursos`, {
    next: { revalidate: 60 } // ISR: revalidar cada 60s
  });
  return res.json();
}

export default async function CursosPage() {
  const cursos = await getCursos();

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

## Referencias

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)
- [When to use Server vs Client Components](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns)
