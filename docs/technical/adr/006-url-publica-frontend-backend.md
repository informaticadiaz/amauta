# ADR-006: Usar URL Pública para Comunicación Frontend-Backend

## Estado

Propuesto

## Fecha

2026-01-21

## Contexto

El frontend (Next.js) necesita comunicarse con el backend (NestJS) desde **server-side** para:

1. **Proxy de imágenes** - API Route `/api/image/[...path]/route.ts`
2. **Fetching de datos** - Server Components que obtienen datos del backend
3. **PWA Offline-First (Fase 2)** - Service Workers que cachean assets

### Problema Actual

Las imágenes de cursos NO se están cargando en producción (`https://amauta.diazignacio.ar/dashboard/cursos`).

**Causa**: La variable `API_URL` apunta a un nombre interno de Docker que puede no estar resolviendo correctamente:

```bash
API_URL=http://amauta-amautaapi-ryf48a:4000
```

### Opciones Consideradas

#### Opción A: URL Interna de Docker

```bash
API_URL=http://amauta-amautaapi-ryf48a:4000
```

**Pros**:

- Latencia mínima (~3ms)
- No consume ancho de banda público
- Comunicación directa sin salir del VPS

**Contras**:

- Tráfico HTTP sin encriptar (tokens JWT visibles si hay sniffing)
- Bypasea Cloudflare WAF y Traefik (defensa en profundidad comprometida)
- Alto acoplamiento a infraestructura Docker (nombre de contenedor)
- Viola Dependency Inversion Principle (SOLID)
- Difícil debugging (no accesible externamente)
- **Incompatible con Service Workers** (Fase 2 PWA) - el browser no puede acceder
- TCO alto ($1,274/año) por tiempo de debugging y refactor futuro
- No portable (solo funciona en ese VPS específico)

#### Opción B: URL Pública HTTPS (elegida)

```bash
API_URL=https://amauta-api.diazignacio.ar
```

**Pros**:

- TLS 1.3 end-to-end (tráfico encriptado)
- Defensa en profundidad (Cloudflare WAF + Traefik + NestJS Guards)
- Bajo acoplamiento (independiente de infraestructura)
- Respeta SOLID (DIP, OCP)
- Fácil debugging (`curl` desde anywhere)
- **Compatible con Service Workers** (Fase 2 PWA)
- TCO bajo ($254/año)
- Portable (funciona en cualquier entorno)
- Logging completo en Traefik + Cloudflare
- Escalable (load balancer, multi-region, etc.)

**Contras**:

- Latencia mayor (+27ms vs opción interna)
- Hairpin routing (sale a internet y vuelve)
- Consume ancho de banda (mitigado por Cloudflare Free Tier)

## Decisión

**Usar URL Pública HTTPS para TODAS las comunicaciones server-side entre Frontend y Backend.**

```bash
# Configuración en Dokploy → amauta-web → Environment Variables
API_URL=https://amauta-api.diazignacio.ar
NEXT_PUBLIC_API_URL=https://amauta-api.diazignacio.ar
```

## Razones

### 1. Seguridad (CRÍTICO - 30%)

**TLS 1.3 end-to-end**:

- Tráfico encriptado en toda la cadena
- Protección contra sniffing de tokens JWT
- Compliance con GDPR/LOPD para datos de estudiantes

**Defense in Depth**:

- Cloudflare: DDoS protection, WAF, geo-blocking
- Traefik: SSL/TLS termination, headers security, rate limiting
- NestJS: JWT Guards, RBAC

vs. URL interna que **bypasea** estas capas.

**Mitigación OWASP Top 10**:

- A02: Cryptographic Failures → TLS previene
- A05: Security Misconfiguration → Stack estándar
- A07: Auth Failures → Tokens encriptados en tránsito
- A09: Logging Failures → Logs completos

### 2. Arquitectura (SÓLIDO - 25%)

**Bajo Acoplamiento**:

- Frontend independiente de infraestructura Docker
- Portable entre entornos (dev, staging, prod)
- Escalable sin cambios de código

**SOLID**:

- **DIP (Dependency Inversion)**: Frontend depende de abstracción HTTP, no de implementación Docker
- **OCP (Open/Closed)**: Abierto para extensión (cambiar backend), cerrado para modificación (no tocar código)

**Testability**:

- Fácil mockear HTTP server
- No requiere infraestructura Docker para tests

### 3. Roadmap - Fase 2: PWA Offline-First (CRÍTICO - 20%)

**Service Workers ejecutan en el browser** (client-side).

URL interna NO funciona:

```typescript
// ❌ Browser NO puede resolver nombre interno de Docker
fetch('http://amauta-amautaapi-ryf48a:4000/uploads/image.jpg');
```

URL pública SÍ funciona:

```typescript
// ✅ Browser puede acceder desde anywhere
fetch('https://amauta-api.diazignacio.ar/uploads/image.jpg');
```

**Si usamos URL interna ahora**:

- Fase 2 bloqueada → Refactor completo necesario
- Costo: ~30 horas ($600)
- Riesgo de bugs introducidos

**Si usamos URL pública ahora**:

- Fase 2 compatible sin cambios
- Costo: $0

### 4. Costos TCO (Total Cost of Ownership - 15%)

**Opción A (Interna)**:

- Setup: 4h ($80)
- Debugging anual: 10h ($200)
- Refactor Fase 2: 30h ($600)
- Mantenimiento: 8h ($160)
- **Total Año 1**: $1,040 (+ $154 infra) = **$1,194**

**Opción B (Pública)**:

- Setup: 1h ($20)
- Debugging anual: 1h ($20)
- Refactor Fase 2: 0h ($0)
- Mantenimiento: 2h ($40)
- **Total Año 1**: $80 (+ $154 infra) = **$234**

**Ahorro**: $960/año

### 5. Simplicidad Operacional (10%)

**Para instituciones educativas que quieran self-hostear**:

URL interna requiere:

- Expertise en Docker networking
- Debugging complejo (entrar a contenedores)
- Configuración propensa a errores

URL pública requiere:

- Conocimiento web estándar (DNS)
- Debugging simple (`curl`)
- Configuración clara

**Alineado con misión de Amauta**: Educación accesible para todos.

### 6. Trade-off de Latencia (5%)

**Latencia adicional**: +27ms (3ms → 30ms)

**¿Es significativo?**

- ❌ NO. Threshold de percepción: 100ms
- 30ms sigue siendo "instantáneo"

**Mitigación**:

```
Cache-Control: public, max-age=86400, immutable
```

Con caché: Requests subsiguientes = 0ms

**ROI**: Beneficios >> Costo de latencia

## Consecuencias

### Positivas

1. **Seguridad robusta**: Encriptación end-to-end, WAF, logging completo
2. **Arquitectura limpia**: Bajo acoplamiento, SOLID, testable
3. **Compatible con roadmap**: Fase 2 PWA funciona sin cambios
4. **Costos sostenibles**: TCO 5x menor que opción interna
5. **Replicable**: Instituciones pequeñas pueden adoptar fácilmente
6. **Escalable**: Load balancing, multi-region sin cambiar código
7. **Debugging simple**: `curl` funciona desde anywhere

### Negativas

1. **Latencia +27ms**: Imperceptible para usuarios (<100ms threshold)
2. **Hairpin routing**: Tráfico sale y vuelve (mitigado por Cloudflare)
3. **Dependencia DNS**: Si Cloudflare cae, no funciona (99.99% uptime)

### Neutras

1. **Ancho de banda**: Cloudflare Free Tier cubre necesidades actuales
2. **Configuración**: Cambio simple en Dokploy (1 variable)

## Implementación

### Paso 1: Cambiar Variable en Dokploy

```
Dokploy UI → amauta-web → Environment Variables
Variable: API_URL
Valor: https://amauta-api.diazignacio.ar
```

### Paso 2: Rebuild

```
Dokploy UI → amauta-web → Redeploy
```

### Paso 3: Verificar

```bash
# Abrir en navegador
https://amauta.diazignacio.ar/dashboard/cursos

# Verificar que imágenes cargan
# DevTools → Network → /api/image/* → Status 200
```

## Métricas de Éxito

- [ ] Imágenes de cursos cargan correctamente
- [ ] No hay errores 404/500 en `/api/image/*`
- [ ] Latencia promedio < 50ms (primera semana)
- [ ] Cache hit rate > 80% (primer mes)

## Alternativas Descartadas

### Híbrida: Fallback

Intentar URL interna, fallback a pública si falla.

**Rechazado**: Complejidad innecesaria, difícil debugging, viola KISS.

### Service Mesh (Istio/Linkerd)

**Rechazado**: Overkill para 2 servicios, complejidad alta, no apropiado para Amauta.

## Referencias

- **Análisis completo**: `docs/NotebookLM/001-analisis-networking-frontend-backend.md`
- **Perspectiva seguridad**: `docs/NotebookLM/002-perspectiva-seguridad.md`
- **Perspectiva arquitectura**: `docs/NotebookLM/003-perspectiva-arquitectura.md`
- **Contexto Amauta**: `docs/NotebookLM/004-perspectiva-contexto-amauta.md`
- **Roadmap**: `docs/project-management/roadmap.md` (Fase 2: PWA Offline-First)
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **ADR-005**: `docs/technical/adr/005-deployment-dokploy.md` (Contexto de deployment)

## Notas

Esta decisión es **crítica** para el éxito de Amauta porque:

- Define la arquitectura de networking para todo el proyecto
- Afecta directamente la Fase 2 (PWA Offline-First)
- Impacta en la capacidad de instituciones para adoptar la plataforma
- Es difícil/costoso cambiar después

**La latencia +27ms es completamente irrelevante** comparada con los beneficios de seguridad, arquitectura, y compatibilidad con roadmap.

---

**Autor**: Análisis arquitectónico y de seguridad multi-perspectiva

**Revisores**: Pendiente

**Aprobado**: Pendiente
