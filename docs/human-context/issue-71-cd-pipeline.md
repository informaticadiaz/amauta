# Issue #71 — CD: Pipeline de despliegue automático con GitHub Actions + Dokploy

**Qué podés hacer ahora:** Cada vez que se hace un push a `master` y pasan todos los checks (tests, lint, build), el sistema despliega automáticamente la nueva versión en producción sin ninguna intervención manual.

---

## Desarrolladores, ahora el flujo es:

### Desplegar a producción

1. Hacer push a `master` (o mergear un pull request)
2. GitHub Actions ejecuta automáticamente: validaciones → build → tests → deploy
3. Si todo pasa, Dokploy recibe la señal y redespliega el contenedor
4. El sistema verifica que la API responde correctamente antes de dar el deploy por exitoso

### Ver el estado del pipeline

- Ir a https://github.com/informaticadiaz/amauta/actions
- Ver el workflow "CI" en ejecución o los últimos runs
- Cada job muestra su estado: Validaciones, Build, Deploy, Resumen

### Qué se valida en cada push

- Estructura de archivos del proyecto
- No hay secretos expuestos en el repositorio
- Documentación no está vacía
- Todo cambio en el schema Prisma tiene su migración correspondiente
- Lint (ESLint) y formato (Prettier)
- Type checking (TypeScript sin errores)
- Build completo (frontend + backend)
- Tests del backend (API) y frontend (Web)

---

## Migraciones de base de datos

Las migraciones se aplican automáticamente al arrancar el contenedor en cada deploy. No hay que ejecutarlas manualmente.

---

## Paso pendiente (configuración manual)

Para que el deploy automático funcione, hay que configurar el webhook de Dokploy:

1. Entrar al panel de Dokploy: http://72.60.144.210:3000
2. Ir al servicio de la API → buscar la URL del webhook de deploy
3. Ir a https://github.com/informaticadiaz/amauta/settings/secrets/actions
4. Crear el secret `DOKPLOY_WEBHOOK_URL` con esa URL

Una vez configurado, el pipeline completo funciona sin más intervención.

---

## Quién puede usarlo

| Rol           | ¿Puede usarlo?                   |
| ------------- | -------------------------------- |
| ESTUDIANTE    | ❌ (infraestructura interna)     |
| EDUCADOR      | ❌ (infraestructura interna)     |
| ADMIN_ESCUELA | ❌ (infraestructura interna)     |
| SUPER_ADMIN   | ❌ (infraestructura interna)     |
| Desarrollador | ✅ Automático en push a `master` |
