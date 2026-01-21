# 002: Perspectiva de Seguridad - Networking Frontend-Backend

> **Perspectiva**: Especialista en Seguridad
>
> **Framework**: OWASP Top 10, Defense in Depth, Zero Trust
>
> **Fecha**: 2026-01-21

---

## 🛡️ Resumen de Seguridad

### Pregunta Central

**¿Cuál opción de networking es más segura para una plataforma educativa que maneja datos sensibles de estudiantes e instituciones?**

### Respuesta

✅ **URL Pública HTTPS** es significativamente más segura debido a:

- Encriptación TLS 1.3 end-to-end
- Defensa en profundidad (múltiples capas de seguridad)
- Logging completo de tráfico
- Mitigación de vulnerabilidades OWASP Top 10

---

## 🔒 Principios de Seguridad Aplicados

### 1. Defense in Depth (Defensa en Profundidad)

**Concepto**: Múltiples capas de seguridad para que si una falla, las otras sigan protegiendo.

#### Opción A: URL Interna Docker

```
Atacante Externo
    │
    ▼
[Layer 1] Firewall VPS ────────────────┐
    │                                  │
    ▼                                  │
[Layer 2] Traefik (SSL/TLS) ──────────┤
    │                                  │
    ▼                                  │
[Layer 3] Next.js Container ──────────┤
    │                                  │
    │ fetch(http://interno:4000)       │
    │ ⚠️ BYPASS todas las capas        │
    └──────────────────────────────────►Backend
                                       (SIN pasar por Layers 1-2)
```

**Problema crítico**: La comunicación interna **BYPASEA** las capas de seguridad externa.

**Escenario de ataque**:

1. Atacante compromete contenedor de Next.js (ej: dependency vulnerable)
2. Desde el contenedor comprometido, accede directamente al backend
3. **No pasa por**:
   - Firewall del VPS
   - Cloudflare WAF
   - Traefik rate limiting
   - SSL/TLS inspection
4. **Resultado**: Acceso directo sin restricciones

#### Opción B: URL Pública HTTPS

```
Atacante (Interno o Externo)
    │
    ▼
[Layer 1] Firewall VPS ────────────────┐
    │                                  │
    ▼                                  │
[Layer 2] Cloudflare Proxy ───────────┤
    │       - DDoS protection          │
    │       - WAF rules                │
    │       - Rate limiting            │
    ▼                                  │
[Layer 3] Traefik ────────────────────┤
    │       - SSL/TLS termination      │
    │       - Headers security         │
    │       - Access logs              │
    ▼                                  │
[Layer 4] Next.js Container ──────────┤
    │                                  │
    │ fetch(https://public-url)        │
    └──────────────────────────────────►│
                                       │
    [Layer 5] Cloudflare (again) ─────┤
    │                                  │
    ▼                                  │
    [Layer 6] Traefik (again) ────────┤
    │                                  │
    ▼                                  │
    Backend Container                  │
                                       └─ ✅ TODAS las capas activas
```

**Ventaja**: Incluso si un atacante está DENTRO del VPS, sigue pasando por TODAS las capas de seguridad.

---

### 2. Encryption in Transit (Encriptación en Tránsito)

#### Opción A: HTTP Sin Encriptar

```
Next.js ──────HTTP (texto plano)──────► Backend
         ↑
         Datos sin encriptar:
         - Authorization: Bearer eyJhbGc...
         - { "email": "estudiante@ejemplo.com" }
         - { "documento": "12345678" }
```

**Vulnerabilidad**: Sniffing de tráfico en red Docker

**Ataque práctico**:

```bash
# Atacante con acceso al VPS (ej: otra app comprometida)
docker run --rm --net=dokploy-network nicolaka/netshoot tcpdump -i eth0 -A

# Captura:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content: {"email":"admin@escuela.com","password":"temporal123"}

# ☠️ Tokens JWT y credenciales expuestas
```

**Impacto**:

- Tokens de sesión robados
- Credenciales expuestas
- Datos personales de estudiantes visibles
- Incumplimiento de GDPR/LOPD

#### Opción B: HTTPS con TLS 1.3

```
Next.js ──────HTTPS/TLS 1.3 (encriptado)──────► Backend
         ↑
         Tráfico encriptado:
         - Perfect Forward Secrecy
         - ChaCha20-Poly1305 cipher
         - Sin información legible
```

**Protección**: Incluso con acceso a la red, el tráfico es ilegible.

**Ataque práctico**:

```bash
# Atacante intenta lo mismo
docker run --rm --net=dokploy-network nicolaka/netshoot tcpdump -i eth0 -A

# Captura:
..y8.*.f.X...k...]..R.2.......g...P.!.{....
# ✅ Solo bytes encriptados, información inútil
```

---

### 3. Principle of Least Privilege (Mínimo Privilegio)

**Concepto**: Cada componente debe tener solo los permisos mínimos necesarios.

#### Opción A: Requiere Privilegios Elevados

**Next.js necesita**:

- Acceso a red Docker interna (`dokploy-network`)
- Capacidad de resolver nombres de contenedores (DNS Docker)
- Conocimiento de topología de red (qué contenedores existen)

**Riesgo**: Si Next.js se compromete, el atacante tiene:

- Mapa de toda la infraestructura
- Acceso a todos los contenedores en la red
- Capacidad de escanear puertos internos

#### Opción B: Privilegios Estándar

**Next.js necesita**:

- Acceso a internet (ya lo tiene por default)
- Resolver DNS público (capacidad estándar)

**Ventaja**: Sin privilegios especiales, menor superficie de ataque.

---

## 🚨 Análisis OWASP Top 10

### A01: Broken Access Control

**Escenario**: Atacante intenta acceder a recursos sin autorización.

#### Opción A (Interna)

**Flujo normal**:

```
Usuario → Cloudflare → Traefik → Next.js → Backend
                        ↑
                   Guards NestJS
                   verifican JWT
```

**Ataque bypasseando guards**:

```bash
# Atacante con acceso al VPS
docker exec -it amauta-web-xxxxx /bin/sh

# Desde dentro del contenedor Next.js
curl http://amauta-amautaapi-ryf48a:4000/api/v1/admin/usuarios
# ⚠️ Puede bypasear algunos guards si no están bien configurados
```

**Problema**: Sin pasar por Traefik, puede haber rutas expuestas inadvertidamente.

#### Opción B (Pública)

**TODO tráfico** pasa por:

1. Cloudflare (rate limiting, geo-blocking)
2. Traefik (headers security)
3. NestJS Guards (JWT + RBAC)

**Ataque**:

```bash
# Atacante intenta lo mismo
curl https://amauta-api.diazignacio.ar/api/v1/admin/usuarios
# ✅ Bloqueado por JWT Guard + Traefik + Cloudflare
```

---

### A02: Cryptographic Failures

#### Opción A

❌ **Falla**: Datos sensibles en tránsito sin encriptar

**Datos expuestos**:

- Tokens JWT (sesiones robables)
- Emails de estudiantes
- Datos de asistencias
- Calificaciones
- Información institucional

**Compliance**: Violación de:

- GDPR (Europa)
- LOPD (España/Argentina)
- COPPA (EE.UU., si hay menores de 13)

#### Opción B

✅ **Protección**: TLS 1.3 en toda la comunicación

**Características**:

- Perfect Forward Secrecy
- AEAD ciphers (ChaCha20-Poly1305, AES-256-GCM)
- Certificate pinning posible
- HSTS (HTTP Strict Transport Security)

---

### A03: Injection

**No aplica directamente**, pero:

#### Opción A: Difícil Monitorear

Sin logs centralizados de tráfico interno, es difícil detectar:

- SQL injection attempts
- Command injection
- LDAP injection

#### Opción B: Detección Mejorada

Traefik + Cloudflare loggean TODO:

```
2026-01-21 15:30:45 POST /api/v1/cursos
Body: {"titulo": "Test'; DROP TABLE cursos;--"}
       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
       Detectado por WAF de Cloudflare
```

---

### A05: Security Misconfiguration

#### Opción A: Complejo de Configurar Correctamente

**Checklist de configuración**:

- [ ] Asegurar que ambos contenedores estén en la MISMA red Docker
- [ ] Configurar DNS interno de Docker
- [ ] Verificar que no hay network policies bloqueando
- [ ] Asegurar que el nombre del contenedor es estable
- [ ] Configurar firewall interno del contenedor

**Riesgo**: Fácil olvidar algún paso → misconfiguration → vulnerabilidad

#### Opción B: Configuración Estándar

**Checklist de configuración**:

- [x] Configurar dominio DNS (estándar web)
- [x] Dejar que Traefik maneje SSL
- [x] Dejar que Cloudflare maneje proxy

**Ventaja**: Stack estándar, bien documentado, difícil de misconfigar.

---

### A07: Identification and Authentication Failures

#### Opción A: Tokens en HTTP Plano

```http
GET /api/v1/cursos/mis-cursos HTTP/1.1
Host: amauta-amautaapi-ryf48a:4000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM...
              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
              Token en TEXTO PLANO, sniffeable
```

**Ataque**: Session hijacking vía network sniffing

#### Opción B: Tokens en HTTPS

```http
GET /api/v1/cursos/mis-cursos HTTP/1.1
Host: amauta-api.diazignacio.ar
Authorization: Bearer <ENCRYPTED BY TLS>
              ^^^^^^^^^^^^^^^^^^^^^^^^^^
              Token encriptado por TLS
```

**Protección**: Tokens solo legibles por endpoints legítimos

---

### A09: Security Logging and Monitoring Failures

#### Opción A: Logging Incompleto

**Traefik NO loggea** tráfico interno entre contenedores.

```bash
# Logs de Traefik
tail -f /var/log/traefik/access.log

# Se ve:
- Usuario → Frontend ✅
- Usuario → Backend ✅
- Frontend → Backend ❌ (NO loggeado)
```

**Problema**: Punto ciego en monitoring.

#### Opción B: Logging Completo

**TODO tráfico** pasa por Traefik → logs completos

```bash
# Logs de Traefik
tail -f /var/log/traefik/access.log

# Se ve:
- Usuario → Frontend ✅
- Usuario → Backend ✅
- Frontend → Backend ✅ (loggeado como request externa)
```

**Ventaja**: Visibilidad completa, facilita incident response.

---

## 🎯 Escenarios de Ataque Específicos

### Escenario 1: Compromiso de Dependency en Next.js

**Setup**: Un paquete npm usado por Next.js tiene una vulnerabilidad RCE.

#### Con Opción A (Interna)

1. Atacante ejecuta código en contenedor Next.js
2. Escanea red Docker:

```bash
nmap -p- amauta-amautaapi-ryf48a
```

3. Descubre puertos abiertos, servicios, versiones
4. Ataca backend directamente (sin Cloudflare, sin Traefik)
5. **Impacto**: Alto - acceso completo a backend

#### Con Opción B (Pública)

1. Atacante ejecuta código en contenedor Next.js
2. Intenta acceder a backend:

```bash
curl https://amauta-api.diazignacio.ar/api/v1/admin/...
```

3. **Bloqueado por**:
   - Cloudflare WAF (detecta patrón de ataque)
   - Traefik rate limiting
   - NestJS Guards (require JWT válido)
4. **Impacto**: Bajo - ataque loggeado y bloqueado

---

### Escenario 2: Insider Threat (Amenaza Interna)

**Setup**: Un desarrollador con acceso al VPS actúa maliciosamente.

#### Con Opción A (Interna)

1. Desarrollador malicioso accede al VPS
2. Ejecuta:

```bash
docker exec -it amauta-web /bin/sh
curl http://amauta-amautaapi-ryf48a:4000/api/v1/usuarios > /tmp/dump.json
```

3. Exfiltra datos de usuarios
4. **No queda evidencia** en logs de Traefik/Cloudflare

#### Con Opción B (Pública)

1. Desarrollador malicioso accede al VPS
2. Ejecuta:

```bash
curl https://amauta-api.diazignacio.ar/api/v1/usuarios > /tmp/dump.json
```

3. **Evidencia clara** en logs:

```
[ALERT] Traefik: Unusual request from internal IP to /api/v1/usuarios
[ALERT] Cloudflare: Scraping pattern detected
[ALERT] NestJS: Multiple 401 Unauthorized from same origin
```

4. Alerta a equipo de seguridad

---

### Escenario 3: Man-in-the-Middle (Ataque MITM)

**Setup**: Atacante con acceso a red Docker intenta interceptar comunicación.

#### Con Opción A (Interna)

HTTP sin TLS → **VULNERABLE a MITM**

```bash
# Atacante en red Docker
docker run --rm --net=dokploy-network --privileged mitm-proxy

# Intercepta y modifica tráfico:
Frontend envía: {"publicar": false}
MITM modifica: {"publicar": true}
Backend recibe: {"publicar": true}
```

**Impacto**: Integridad de datos comprometida.

#### Con Opción B (Pública)

HTTPS con TLS → **PROTEGIDO contra MITM**

```bash
# Atacante intenta lo mismo
# TLS verifica certificado → falla
# Certificate pinning → detecta ataque
```

**Protección**: Integridad garantizada por TLS.

---

## 📊 Matriz de Riesgos

| Amenaza                     | Probabilidad | Impacto | Riesgo (Opción A) | Riesgo (Opción B) |
| --------------------------- | ------------ | ------- | ----------------- | ----------------- |
| **Sniffing de red**         | Media        | Alto    | 🔴 Alto           | 🟢 Muy Bajo       |
| **Session hijacking**       | Media        | Alto    | 🔴 Alto           | 🟢 Muy Bajo       |
| **Bypass de WAF**           | Alta         | Medio   | 🔴 Alto           | 🟢 Muy Bajo       |
| **Insider threat**          | Baja         | Alto    | 🟡 Medio          | 🟢 Bajo           |
| **Compromiso de container** | Media        | Alto    | 🔴 Alto           | 🟡 Medio          |
| **MITM**                    | Baja         | Alto    | 🔴 Alto           | 🟢 Muy Bajo       |
| **Data exfiltration**       | Media        | Alto    | 🟡 Medio          | 🟢 Bajo           |

**Puntuación de riesgo**:

- **Opción A**: 6.5/10 (Alto)
- **Opción B**: 2.5/10 (Bajo)

---

## ✅ Recomendaciones de Seguridad

### 1. Usar URL Pública HTTPS

```bash
API_URL=https://amauta-api.diazignacio.ar
```

**Justificación**: Maximiza seguridad con TLS, WAF, logging.

### 2. Configurar Headers de Seguridad

En Traefik:

```yaml
http:
  middlewares:
    security-headers:
      headers:
        sslRedirect: true
        stsSeconds: 31536000
        stsIncludeSubdomains: true
        stsPreload: true
        contentTypeNosniff: true
        browserXssFilter: true
        referrerPolicy: 'strict-origin-when-cross-origin'
```

### 3. Implementar Rate Limiting Agresivo

```typescript
// Backend NestJS
@Throttle(10, 60) // 10 requests por minuto
@Get('mis-cursos')
getMisCursos() { ... }
```

### 4. Monitoring y Alertas

```bash
# Alertas en caso de:
- Múltiples 401/403 desde misma IP
- Requests a endpoints admin desde IPs inusuales
- Patrones de scraping
- Volumen inusual de requests
```

### 5. Auditorías Periódicas

- **Mensual**: Revisar logs de Traefik/Cloudflare
- **Trimestral**: Penetration testing
- **Semestral**: Dependency audit (npm audit, Snyk)

---

## 📚 Conceptos de Seguridad para Estudiar

1. **Defense in Depth**: Múltiples capas de seguridad
2. **TLS/SSL**: Cómo funciona el handshake, ciphers, certificates
3. **WAF (Web Application Firewall)**: Qué ataques detecta
4. **OWASP Top 10**: Vulnerabilidades más comunes
5. **Zero Trust Architecture**: "Never trust, always verify"
6. **Least Privilege**: Mínimos permisos necesarios
7. **Security Logging**: Qué loggear, cómo detectar ataques

---

## 🎯 Conclusión de Seguridad

### Veredicto

✅ **URL Pública HTTPS es significativamente más segura**

**Razones**:

1. TLS 1.3 end-to-end (vs HTTP plano)
2. Defense in Depth (vs bypass de capas)
3. Logging completo (vs punto ciego)
4. Mitigación OWASP Top 10 (A02, A05, A07, A09)
5. Menor superficie de ataque

### Riesgos de Opción A

⚠️ **Usar URL interna** expone Amauta a:

- Sniffing de tokens y datos sensibles
- Bypass de WAF y protecciones Cloudflare
- Dificultad para detectar/responder a incidentes
- Posible incumplimiento de regulaciones (GDPR/LOPD)

### Beneficio de Opción B

✅ **Usar URL pública** garantiza:

- Encriptación robusta de datos en tránsito
- Múltiples capas de defensa activas
- Visibilidad completa para incident response
- Compliance con estándares de seguridad

**Para una plataforma educativa con datos de estudiantes, seguridad no es opcional.**

---

**Siguiente documento**: `003-perspectiva-arquitectura.md`
