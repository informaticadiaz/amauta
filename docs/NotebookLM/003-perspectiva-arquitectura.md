# 003: Perspectiva de Arquitectura de Software - Networking Frontend-Backend

> **Perspectiva**: Arquitecto de Software Senior
>
> **Frameworks**: SOLID, Clean Architecture, Design Patterns
>
> **Fecha**: 2026-01-21

---

## 🏗️ Resumen Arquitectónico

### Pregunta Central

**¿Qué opción de networking promueve una arquitectura más sólida, mantenible y escalable?**

### Respuesta

✅ **URL Pública HTTPS** resulta en una arquitectura superior debido a:

- Bajo acoplamiento (independencia de infraestructura)
- Respeto a principios SOLID (especialmente DIP y OCP)
- Fácil testing y mocking
- Portabilidad entre entornos
- Escalabilidad futura

---

## 📐 Principios SOLID Aplicados

### S - Single Responsibility Principle

**No aplica directamente** a esta decisión, pero el proxy de imágenes tiene una responsabilidad clara: servir imágenes del backend.

### O - Open/Closed Principle (CRÍTICO)

**Principio**: "Abierto para extensión, cerrado para modificación"

#### Opción A: Viola OCP

```typescript
// apps/web/src/app/api/image/[...path]/route.ts
const API_URL = 'http://amauta-amautaapi-ryf48a:4000';
//              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//              DETALLE DE IMPLEMENTACIÓN HARDCODEADO
```

**Problema**: Si necesitás cambiar la infraestructura:

- ✏️ Migrar a otro VPS
- ✏️ Escalar horizontalmente (múltiples backends)
- ✏️ Cambiar a Kubernetes
- ✏️ Usar un load balancer

**Necesitás MODIFICAR el código** → Viola OCP

#### Opción B: Respeta OCP

```typescript
const API_URL = process.env.API_URL || 'https://amauta-api.diazignacio.ar';
//              ^^^^^^^^^^^^^^^^^^^^^
//              ABSTRACCIÓN (dominio estable)
```

**Ventaja**: Podés cambiar la infraestructura subyacente sin tocar código:

- ✅ Backend migra a otro VPS → Solo cambiar DNS
- ✅ Escalar a 3 backends → Load balancer detrás del dominio
- ✅ Migrar a Kubernetes → Dominio apunta a Ingress
- ✅ CDN para assets → Dominio con CDN en el medio

**NO necesitás modificar código** → Respeta OCP

---

### L - Liskov Substitution Principle

**No aplica directamente**, pero conceptualmente:

Cualquier implementación de backend (NestJS, otro framework, otro lenguaje) debe poder sustituirse sin cambiar el frontend → **URL pública** permite esto fácilmente.

---

### I - Interface Segregation Principle

**No aplica directamente** a esta decisión de networking.

---

### D - Dependency Inversion Principle (CRÍTICO)

**Principio**: "Depender de abstracciones, no de concreciones"

#### Opción A: Viola DIP

```
┌─────────────────────────────┐
│     Frontend (Next.js)      │
│   High-level module         │
│                             │
│   DEPENDE DE ↓              │
└──────────────┬──────────────┘
               │
               │ Detalle de implementación:
               │ "amauta-amautaapi-ryf48a" (nombre de contenedor)
               │ Puerto 4000
               │ Red Docker "dokploy-network"
               │
               ▼
┌─────────────────────────────┐
│  Infraestructura Docker     │
│   Low-level module          │
│  (Detalle de implementación)│
└─────────────────────────────┘
```

**Problema**: El módulo de alto nivel (frontend) depende directamente de detalles de bajo nivel (infraestructura Docker).

#### Opción B: Respeta DIP

```
┌─────────────────────────────┐
│     Frontend (Next.js)      │
│   High-level module         │
│                             │
│   DEPENDE DE ↓              │
└──────────────┬──────────────┘
               │
               │ Abstracción:
               │ "amauta-api.diazignacio.ar" (interfaz HTTP)
               │
               ▼
┌─────────────────────────────┐
│   Interfaz HTTP/HTTPS       │
│   (Abstracción estable)     │
└──────────────┬──────────────┘
               │
               │ Implementado por ↓
               ▼
┌─────────────────────────────┐
│  Infraestructura (VPS)      │
│   Low-level module          │
│  (Detalle de implementación)│
└─────────────────────────────┘
```

**Ventaja**: El frontend depende de la abstracción HTTP (estable), no de la implementación concreta (cambiante).

---

## 🔗 Acoplamiento y Cohesión

### Concepto

**Acoplamiento**: Grado de interdependencia entre módulos

- **Bajo acoplamiento**: Módulos independientes (✅ bueno)
- **Alto acoplamiento**: Módulos muy dependientes (❌ malo)

**Cohesión**: Grado de relación entre elementos dentro de un módulo

- **Alta cohesión**: Elementos relacionados (✅ bueno)
- **Baja cohesión**: Elementos no relacionados (❌ malo)

### Análisis

#### Opción A: Alto Acoplamiento

**Frontend acoplado a**:

- Nombre específico del contenedor backend
- Red Docker específica
- Topología de red del VPS
- Configuración de Dokploy

**Diagrama de dependencias**:

```
Frontend
  ├─ Depende de: Nombre contenedor "amauta-amautaapi-ryf48a"
  ├─ Depende de: Red Docker "dokploy-network"
  ├─ Depende de: DNS interno de Docker
  └─ Depende de: Configuración específica de Dokploy
```

**Consecuencias**:

- ❌ Cambiar infraestructura → Rompe frontend
- ❌ Difícil de testear (necesitás toda la infra Docker)
- ❌ No portable (solo funciona en ese VPS específico)

#### Opción B: Bajo Acoplamiento

**Frontend acoplado a**:

- Protocolo HTTP/HTTPS (estándar universal)
- Dominio DNS (abstracción estable)

**Diagrama de dependencias**:

```
Frontend
  └─ Depende de: Protocolo HTTP + DNS estándar
                 (abstracciones universales)
```

**Consecuencias**:

- ✅ Cambiar infraestructura → Frontend funciona igual
- ✅ Fácil de testear (mock HTTP server)
- ✅ Portable (funciona en cualquier entorno)

---

## 🎨 Patrones de Arquitectura

### Service Mesh vs API Gateway

#### Service Mesh (Opción A)

**Concepto**: Comunicación directa service-to-service con proxy sidecar.

```
┌─────────┐       ┌─────────┐
│Frontend │◄─────►│ Backend │
│ Service │       │ Service │
└─────────┘       └─────────┘
     ▲                 ▲
     │                 │
  Sidecar          Sidecar
   Proxy            Proxy
```

**Características**:

- Comunicación interna directa
- Menor latencia
- Requiere service discovery
- Complejidad en configuración

**Usado por**: Istio, Linkerd, Consul Connect

**¿Es apropiado para Amauta?**

- ❌ Overkill para 2 servicios
- ❌ Complejidad innecesaria
- ❌ Requiere expertise avanzado

#### API Gateway (Opción B)

**Concepto**: Punto único de entrada, reverse proxy centralizado.

```
┌─────────┐
│ Client  │
│Frontend │
└────┬────┘
     │
     ▼
┌─────────┐
│   API   │
│ Gateway │ ◄── Traefik
│(Proxy)  │
└────┬────┘
     │
     ├──────► Backend 1
     ├──────► Backend 2
     └──────► Backend N
```

**Características**:

- Single point of entry
- Centraliza cross-cutting concerns (SSL, logging, rate limiting)
- Fácil configuración
- Estándar de la industria

**Usado por**: Kong, NGINX, Traefik, AWS API Gateway

**¿Es apropiado para Amauta?**

- ✅ Simple para 1-10 servicios
- ✅ Traefik ya configurado
- ✅ Estándar y bien documentado

---

## 🧱 Clean Architecture / Hexagonal Architecture

### Puertos y Adaptadores

**Concepto**: El core de la aplicación define "puertos" (interfaces), y los "adaptadores" implementan esos puertos.

#### Aplicación a Amauta

**Puerto (Abstracción)**:

```typescript
// Port: HTTP API
interface BackendAPI {
  getImage(path: string): Promise<Buffer>;
  getCursos(): Promise<Curso[]>;
}
```

**Adaptadores (Implementaciones)**:

**Adapter A: Docker Internal**

```typescript
class DockerInternalAdapter implements BackendAPI {
  private baseURL = 'http://amauta-amautaapi-ryf48a:4000';

  async getImage(path: string) {
    return fetch(`${this.baseURL}/${path}`);
  }
}
```

**Adapter B: HTTPS Public**

```typescript
class HTTPSPublicAdapter implements BackendAPI {
  private baseURL = 'https://amauta-api.diazignacio.ar';

  async getImage(path: string) {
    return fetch(`${this.baseURL}/${path}`);
  }
}
```

**Ventaja de Opción B**:

- El puerto (abstracción HTTP) es ESTABLE
- El adapter puede cambiar sin afectar el core
- Fácil agregar nuevos adapters (ej: cache layer, CDN)

---

## 🧪 Testability (Facilidad de Testing)

### Opción A: Difícil de Testear

**Test de integración**:

```typescript
describe('Image Proxy', () => {
  it('should fetch image from backend', async () => {
    // ❌ Problema: Necesitás levantar toda la infra Docker
    // docker-compose up
    // Esperar que los contenedores estén listos
    // Nombre del contenedor debe ser exacto

    const response = await fetch('/api/image/uploads/curso.jpg');
    expect(response.ok).toBe(true);
  });
});
```

**Unit test**:

```typescript
// ❌ Imposible mockear porque la URL está hardcodeada
// al nombre del contenedor Docker
```

### Opción B: Fácil de Testear

**Test de integración**:

```typescript
describe('Image Proxy', () => {
  beforeAll(() => {
    // ✅ Mock server HTTP simple
    mockServer = createMockServer(3001);
    process.env.API_URL = 'http://localhost:3001';
  });

  it('should fetch image from backend', async () => {
    mockServer.get('/uploads/curso.jpg').reply(200, buffer);

    const response = await fetch('/api/image/uploads/curso.jpg');
    expect(response.ok).toBe(true);
  });
});
```

**Unit test**:

```typescript
// ✅ Fácil mockear con nock, msw, etc.
import nock from 'nock';

nock('https://amauta-api.diazignacio.ar')
  .get('/uploads/curso.jpg')
  .reply(200, mockImageBuffer);
```

---

## 📦 Portabilidad

### Opción A: No Portable

**Funciona solo en**:

- VPS específico con Dokploy
- Con configuración exacta de red Docker
- Con nombres de contenedores específicos

**NO funciona en**:

- Desarrollo local (diferentes nombres de contenedores)
- CI/CD (GitHub Actions)
- Preview deployments (Vercel, Netlify)
- Otros VPS providers
- Kubernetes

### Opción B: Totalmente Portable

**Funciona en**:

- ✅ Desarrollo local (`API_URL=http://localhost:3001`)
- ✅ Staging (`API_URL=https://staging-api.domain.com`)
- ✅ Producción (`API_URL=https://amauta-api.diazignacio.ar`)
- ✅ CI/CD (mock server)
- ✅ Cualquier proveedor cloud

**Configuración**:

```bash
# .env.development.local
API_URL=http://localhost:3001

# .env.staging
API_URL=https://staging-api.amauta.com

# .env.production (Dokploy)
API_URL=https://amauta-api.diazignacio.ar
```

---

## 🔄 Evolución y Escalabilidad

### Escenario 1: Escalar Horizontalmente

**Necesidad**: El backend necesita escalar a 3 instancias por carga.

#### Con Opción A

```
Frontend ──► ❓ ¿Cuál backend?
            http://backend-1:4000
            http://backend-2:4000
            http://backend-3:4000
```

**Problema**: Frontend necesita:

- Implementar load balancing
- Conocer IPs de todos los backends
- Manejar health checks
- **Cambiar código**

#### Con Opción B

```
Frontend ──► https://amauta-api.diazignacio.ar
                          │
                          ▼
                   Load Balancer (Traefik)
                          │
            ┌─────────────┼─────────────┐
            ▼             ▼             ▼
        Backend 1     Backend 2     Backend 3
```

**Solución**:

- Load balancer maneja distribución
- Frontend NO cambia
- **Cero cambios en código**

---

### Escenario 2: Migrar a Kubernetes

**Necesidad**: Amauta crece, necesita Kubernetes.

#### Con Opción A

```typescript
// ❌ Código debe cambiar
const API_URL = 'http://amauta-backend-service.default.svc.cluster.local:4000';
//              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//              Nuevo nombre de servicio de Kubernetes
```

**Impacto**: Refactor completo del frontend.

#### Con Opción B

```typescript
// ✅ Código NO cambia
const API_URL = 'https://amauta-api.diazignacio.ar';
//              Solo cambiar DNS para apuntar a Kubernetes Ingress
```

**Impacto**: Cero cambios en frontend, solo DNS.

---

### Escenario 3: Multi-Region Deployment

**Necesidad**: Servir usuarios en Latinoamérica y Europa con baja latencia.

#### Con Opción A

**Imposible** sin cambiar arquitectura completamente.

#### Con Opción B

```
Frontend (América) ──► https://amauta-api.diazignacio.ar
                                  │
                        Cloudflare Geo-Routing
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
            Backend América                Backend Europa
```

**Implementación**:

- Cloudflare maneja geo-routing
- Frontend NO cambia
- **Cero cambios en código**

---

## 🎯 Patrones Anti-Patterns

### Anti-Pattern: Magic Strings

**Opción A sufre de esto**:

```typescript
// ❌ Magic string: nombre de contenedor hardcodeado
const API_URL = 'http://amauta-amautaapi-ryf48a:4000';
```

**Problemas**:

- Difícil de encontrar (no es una variable de entorno obvia)
- Fácil de romper (cambio en nombre de contenedor)
- No es evidente qué representa

### Pattern: Configuration as Code

**Opción B sigue esto**:

```typescript
// ✅ Configuración externa, clara
const API_URL = process.env.API_URL || 'https://amauta-api.diazignacio.ar';
```

**Ventajas**:

- Configuración explícita
- Fácil de cambiar sin tocar código
- Documentado en `.env.example`

---

## 📊 Matriz de Decisión Arquitectónica

| Criterio             | Peso | Opción A (Interna) | Opción B (Pública) |
| -------------------- | ---- | ------------------ | ------------------ |
| **Acoplamiento**     | 25%  | 2/10 (alto)        | 9/10 (bajo)        |
| **SOLID (DIP, OCP)** | 20%  | 3/10 (viola)       | 10/10 (respeta)    |
| **Testability**      | 15%  | 4/10 (difícil)     | 9/10 (fácil)       |
| **Portabilidad**     | 15%  | 2/10 (no portable) | 10/10 (portable)   |
| **Escalabilidad**    | 10%  | 3/10 (difícil)     | 9/10 (fácil)       |
| **Mantenibilidad**   | 10%  | 4/10 (compleja)    | 9/10 (simple)      |
| **Latencia**         | 5%   | 10/10 (3ms)        | 7/10 (30ms)        |

**Puntuación total**:

- **Opción A**: 3.6/10
- **Opción B**: 9.3/10

**Ganador claro**: Opción B (URL Pública)

---

## ✅ Recomendación Arquitectónica

### Decisión

✅ **Usar URL Pública HTTPS**

```bash
API_URL=https://amauta-api.diazignacio.ar
```

### Justificación Arquitectónica

1. **Bajo acoplamiento** → Infraestructura independiente del código
2. **Respeta SOLID** → DIP y OCP aplicados correctamente
3. **Alta testability** → Fácil mockear y testear
4. **Portable** → Funciona en cualquier entorno
5. **Escalable** → Soporta crecimiento futuro sin cambios
6. **Mantenible** → Configuración simple y clara

### Trade-off Aceptado

⚠️ **Latencia +27ms** es un precio **totalmente aceptable** por:

- Arquitectura sólida y mantenible
- Facilidad de evolución
- Testing robusto
- Portabilidad total

**Los usuarios NO perciben <100ms**, así que +27ms es imperceptible.

---

## 📚 Conceptos Arquitectónicos para Estudiar

1. **SOLID Principles** - Especialmente DIP y OCP
2. **Coupling & Cohesion** - Métricas de calidad de diseño
3. **Clean Architecture** - Independencia de frameworks e infraestructura
4. **Hexagonal Architecture** - Ports & Adapters pattern
5. **Service Mesh vs API Gateway** - Patrones de comunicación
6. **Configuration as Code** - Externalizar configuración
7. **Anti-Patterns** - Magic strings, tight coupling

---

## 🎯 Conclusión Arquitectónica

### Veredicto

✅ **URL Pública HTTPS resulta en arquitectura superior**

### Razones

1. **Bajo acoplamiento** → Infraestructura cambia sin afectar código
2. **SOLID** → Código respeta principios fundamentales
3. **Clean Architecture** → Core independiente de detalles
4. **Escalabilidad** → Soporta crecimiento sin refactor
5. **Mantenibilidad** → Simple, predecible, estándar

### Impacto a Largo Plazo

- ✅ Facilita crecimiento del proyecto
- ✅ Reduce deuda técnica
- ✅ Permite onboarding más rápido de nuevos devs
- ✅ Soporta evolución de infraestructura

**Para un proyecto educativo de largo plazo como Amauta, arquitectura sólida es fundamental.**

---

**Siguiente documento**: `004-perspectiva-contexto-amauta.md`
