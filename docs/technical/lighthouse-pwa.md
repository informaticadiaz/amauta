# Lighthouse PWA — Checklist y Guía Rápida

> Objetivo: verificar que Amauta sea instalable y funcione offline.

## Dónde correrlo

- **Producción (recomendado):** https://amauta.diazignacio.ar
- **Local (opcional):** http://localhost:3000

## Guía rápida (Chrome DevTools)

1. Abrir la app en Chrome.
2. DevTools → pestaña **Lighthouse**.
3. Seleccionar **Progressive Web App**.
4. Dispositivo: **Mobile**.
5. Ejecutar “Analyze page load”.

## Guía rápida (CLI)

> Útil para repetir la medición de forma consistente.

```bash
npx lighthouse https://amauta.diazignacio.ar \
  --only-categories=pwa \
  --form-factor=mobile \
  --screen-emulation.mobile \
  --view
```

## Resultados mínimos esperados

- **PWA Score:** > 90 en producción.
- **Manifest válido:** nombre, short_name, start_url, display, theme_color, icons (192/512, maskable).
- **Service Worker activo:** registrado y controlando la página.
- **Funciona offline:** al menos la pantalla principal responde sin conexión.
- **HTTPS:** habilitado en producción.

## Checklist PWA (rápido)

- [ ] `manifest.json` válido y enlazado desde metadata.
- [ ] Íconos 192x192 y 512x512 con `purpose: "maskable any"`.
- [ ] `start_url` responde offline.
- [ ] Service Worker registrado (ver en DevTools → Application → Service Workers).
- [ ] Página principal carga sin conexión (DevTools → Network → Offline).
- [ ] `theme-color` presente.

## Notas de verificación

- Ejecutar Lighthouse con conexión estable y sin extensiones que modifiquen la red.
- Si el score baja, revisar primero: manifest, SW y fallback offline.
