# @amauta/web

Frontend de Amauta - Aplicación Next.js PWA

## Estado Actual

🚧 **Pendiente configuración**

Este workspace está preparado pero requiere configuración completa:

- [x] Issue #5 (T-009): Configurar TypeScript - ✅ Completado
- [ ] Issue #20 (T-019): Configurar Next.js 14+ - 🎯 **Siguiente**
- [ ] Futuro: Configurar Tailwind CSS
- [ ] Futuro: Configurar PWA con Workbox
- [ ] Futuro: Configurar Zustand para state management

## Tecnologías Planeadas

- **Next.js 14+** con App Router
- **TypeScript** en modo strict
- **Tailwind CSS** para estilos
- **Zustand** para state management
- **Workbox** para PWA y service workers

## Desarrollo

```bash
# Desde la raíz del monorepo
npm run dev

# Solo este workspace (cuando esté configurado)
npm run dev --workspace=@amauta/web
```

## Estructura (Futura)

```
apps/web/
├── src/
│   ├── app/           # App Router de Next.js
│   ├── components/    # Componentes React
│   ├── lib/          # Utilidades y helpers
│   └── styles/       # Estilos globales
├── public/           # Assets estáticos
└── package.json
```
