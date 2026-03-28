# ADR-007: NextAuth como sesión web y JWT firmado hacia backend

## Estado

Aceptado

## Fecha

2026-03-28

## Contexto

El frontend de Amauta usa Next.js App Router y necesita resolver dos problemas a la vez:

1. **Sesión web y UX de autenticación** en páginas, layouts y middleware.
2. **Autorización backend** en NestJS + Fastify con guards JWT y RBAC.

El backend ya valida tokens HS256 con `AUTH_SECRET` en `JwtAuthGuard`, mientras que el frontend usa NextAuth para login con credenciales contra `/api/v1/auth/login`.

Además, los route handlers del frontend actúan como **proxy autenticado** hacia el backend. Eso obliga a definir un contrato estable entre:

- la sesión web de NextAuth
- los proxies App Router
- los guards JWT del backend

## Opciones Consideradas

### Opción A: El navegador habla directo con el backend y guarda token JWT

- **Pros**:
  - Menos capas intermedias
  - Menos lógica en route handlers del frontend
- **Contras**:
  - Mayor superficie de exposición del token en cliente
  - Más complejidad de CORS y refresh de sesión
  - Peor integración con Server Components, middleware y layouts protegidos

### Opción B: Solo NextAuth, sin JWT puente al backend

- **Pros**:
  - Menos piezas conceptuales
  - Una única sesión para todo
- **Contras**:
  - El backend NestJS no consume de forma nativa la sesión/cookie de NextAuth
  - Requiere acoplar backend al formato interno de Auth.js o compartir cookies cross-app
  - Complica RBAC y validación en servicios HTTP independientes

### Opción C: NextAuth para sesión web + JWT firmado por proxies hacia backend (elegida)

- **Pros**:
  - El frontend mantiene la DX de NextAuth
  - El backend sigue usando guards JWT simples y explícitos
  - Los route handlers pueden actuar como BFF/proxy autenticado
  - El contrato entre apps queda controlado por Amauta
- **Contras**:
  - Hay un “puente” adicional que mantener
  - Cambios en claims o secretos deben coordinarse entre web y api
  - Si la lógica se duplica en proxies, aparecen bugs sistémicos

## Decisión

Adoptamos el siguiente patrón:

1. **NextAuth** maneja la sesión web del frontend.
2. El login del frontend usa credenciales validadas por el backend.
3. Los **route handlers** del frontend leen la sesión con NextAuth.
4. Esos handlers generan un **JWT HS256 firmado con `AUTH_SECRET`** para hablar con el backend.
5. El backend valida ese JWT con `JwtAuthGuard` y aplica RBAC con `RolesGuard`.

Para reducir bugs, la lógica de puente debe vivir centralizada en helpers compartidos del frontend, no copiada en cada proxy.

## Consecuencias

### Positivas

- Separa claramente **sesión web** de **autorización backend**.
- Permite usar middleware, layouts y Server Components protegidos con NextAuth.
- Mantiene el backend desacoplado de cookies y detalles internos de Auth.js.
- Hace explícito el contrato de claims (`id`, `sub`, `email`, `rol`).

### Negativas

- Requiere coordinación de secretos entre frontend y backend.
- Obliga a documentar bien el formato del token puente.
- Introduce una capa BFF/proxy que debe testearse.

### Neutras

- Los route handlers del frontend pasan a ser parte de la arquitectura de seguridad, no solo “wrappers”.

## Referencias

- `C:\Users\infor\DevHome\amauta\apps\web\src\lib\auth.ts`
- `C:\Users\infor\DevHome\amauta\apps\web\src\lib\backend-auth.ts`
- `C:\Users\infor\DevHome\amauta\apps\api\src\common\guards\jwt-auth.guard.ts`
- `C:\Users\infor\DevHome\amauta\apps\web\src\proxy.ts`
