# 🐳 Guía de Puertos y Redes en Docker para Desarrolladores

> **Objetivo**: Explicar conceptos de networking en Docker de forma clara y práctica
> **Audiencia**: Desarrolladores nuevos en Docker y deployment
> **Nivel**: Principiante a Intermedio

---

## 🤔 Pregunta Inicial

**"¿Los puertos internos de mis containers van a chocar con otros servicios en el servidor?"**

Esta es una pregunta común y muy válida cuando empiezas con Docker. La respuesta corta es: **No, gracias al aislamiento de Docker**. Pero entendamos por qué.

---

## 📚 Conceptos Básicos

### 1. ¿Qué es un Puerto?

Un puerto es como una "puerta de entrada" para comunicación en red.

**Analogía del edificio de departamentos**:

```
Edificio (Servidor)
├── Dirección: Calle Principal 123 (IP del servidor)
└── Departamentos
    ├── Depto 101 (Puerto 80)  → Servicio Web
    ├── Depto 102 (Puerto 443) → Servicio Web Seguro
    └── Depto 103 (Puerto 3000) → Aplicación Node.js
```

### 2. Puerto del Host vs Puerto del Container

**Host**: El servidor físico o VPS donde corre Docker
**Container**: Una "caja" aislada donde corre tu aplicación

```
┌─────────────────────────────────────────┐
│ HOST (Tu VPS)                           │
│ IP: 123.45.67.89                        │
│                                         │
│  Puerto 80 (HOST)                       │
│      ↓                                  │
│  ┌──────────────────────────────────┐  │
│  │ Container: nginx                 │  │
│  │ Puerto 80 (INTERNO)              │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ Container: app-nodejs            │  │
│  │ Puerto 3000 (INTERNO)            │  │
│  │ NO expuesto al host              │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ Container: otra-app-nodejs       │  │
│  │ Puerto 3000 (INTERNO)            │  │
│  │ NO expuesto al host              │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Observación clave**: Los dos containers pueden usar puerto 3000 **internamente** sin conflicto.

---

## 🔍 Análisis: ¿Por Qué No Hay Conflictos?

### Caso 1: Puertos Internos (Sin Mapeo)

**Configuración**:

```yaml
# docker-compose.yml
services:
  app1:
    image: node:22.22.1
    # NO hay 'ports:' → Puerto NO expuesto al host
    # La app escucha en puerto 3000 INTERNO

  app2:
    image: node:22.22.1
    # NO hay 'ports:' → Puerto NO expuesto al host
    # La app también escucha en puerto 3000 INTERNO
```

**Resultado**: ✅ **Sin conflicto**. Cada container tiene su propio "espacio" aislado.

### Caso 2: Puertos Mapeados al Host (Con Conflicto)

**Configuración conflictiva**:

```yaml
services:
  app1:
    image: node:22.22.1
    ports:
      - '3000:3000' # Host:Container

  app2:
    image: node:22.22.1
    ports:
      - '3000:3000' # ❌ ERROR! Puerto 3000 del host ya ocupado
```

**Resultado**: ❌ **Conflicto**. Solo un servicio puede usar el puerto 3000 del host.

**Solución**:

```yaml
services:
  app1:
    ports:
      - '3000:3000' # ✅ OK

  app2:
    ports:
      - '3001:3000' # ✅ OK - Puerto 3001 del host → 3000 del container
```

---

## 🌐 Networking con Reverse Proxy (Traefik)

### El Problema a Resolver

Con muchas aplicaciones, mapear puertos manualmente se vuelve complicado:

```
app1 → 3000:3000
app2 → 3001:3000
app3 → 3002:3000
api1 → 4000:4000
api2 → 4001:4000
```

### La Solución: Reverse Proxy

Un **reverse proxy** (como Traefik, Nginx) funciona como un "recepcionista del edificio":

```
Usuario solicita: https://app1.midominio.com
                         ↓
                  Cloudflare/DNS
                         ↓
            Reverse Proxy (Traefik)
        Lee: "¿A dónde va app1.midominio.com?"
                         ↓
            Enruta al Container correcto
                         ↓
          Container app1 (puerto 3000 interno)
```

**Ventajas**:

- ✅ No necesitas mapear puertos al host
- ✅ Múltiples apps usan el mismo puerto interno sin conflicto
- ✅ SSL/HTTPS automático
- ✅ Dominios legibles (no puertos raros)

### Configuración con Traefik

```yaml
# docker-compose.yml
services:
  traefik:
    image: traefik:v2.10
    ports:
      - '80:80' # HTTP
      - '443:443' # HTTPS
    networks:
      - web

  app1:
    image: myapp:latest
    networks:
      - web
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.app1.rule=Host(`app1.midominio.com`)'
      - 'traefik.http.services.app1.loadbalancer.server.port=3000'
    # NO necesitas 'ports:' - Traefik se conecta internamente

  app2:
    image: myapp:latest
    networks:
      - web
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.app2.rule=Host(`app2.midominio.com`)'
      - 'traefik.http.services.app2.loadbalancer.server.port=3000'
    # Mismo puerto 3000 interno - Sin problema!

networks:
  web:
    driver: bridge
```

**Flujo completo**:

```
Usuario → https://app1.midominio.com
    ↓
Traefik (lee labels de Docker)
    ↓
Encuentra container con label: Host(`app1.midominio.com`)
    ↓
Se conecta al puerto 3000 INTERNO del container
    ↓
Responde al usuario
```

---

## 🎯 Caso Práctico: Deployment Real

### Escenario

Tienes un VPS con:

- Dokploy (UI en puerto 3000)
- Supabase (varios servicios internos)
- Tu nueva app (frontend + backend)

### Pregunta

**"¿Mi frontend que usa puerto 3000 va a chocar con Dokploy que también usa 3000?"**

### Análisis

**Estado actual del servidor**:

```bash
# Puertos expuestos en el HOST
0.0.0.0:80    → traefik (HTTP)
0.0.0.0:443   → traefik (HTTPS)
0.0.0.0:3000  → dokploy-ui

# Puertos internos de containers
3000 → supabase-rest (INTERNO)
3000 → supabase-studio (INTERNO)
5432 → postgres (INTERNO)
6379 → redis (INTERNO)
```

**Tu nueva aplicación**:

```yaml
services:
  mi-frontend:
    build: ./frontend
    networks:
      - dokploy-network
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.mifrontend.rule=Host(`miapp.midominio.com`)'
      - 'traefik.http.services.mifrontend.loadbalancer.server.port=3000'
    # Puerto 3000 INTERNO - Sin mapeo al host

  mi-backend:
    build: ./backend
    networks:
      - dokploy-network
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.mibackend.rule=Host(`api.miapp.midominio.com`)'
      - 'traefik.http.services.mibackend.loadbalancer.server.port=4000'
    # Puerto 4000 INTERNO
```

### Respuesta

✅ **NO hay conflicto** porque:

1. **Dokploy UI (puerto 3000)** → Mapeado al host (0.0.0.0:3000)
2. **Supabase services (puerto 3000)** → Internos, no expuestos
3. **Tu frontend (puerto 3000)** → Interno, acceso via Traefik
4. **Tu backend (puerto 4000)** → Interno, acceso via Traefik

**Distribución de puertos del host**:

```
Puerto 80   → Traefik (enruta a todos)
Puerto 443  → Traefik (enruta a todos)
Puerto 3000 → Dokploy UI (directo)
```

**Distribución interna** (sin conflicto):

```
Container: dokploy        → 3000 (mapeado a host:3000)
Container: supabase-rest  → 3000 (solo interno)
Container: supabase-studio→ 3000 (solo interno)
Container: mi-frontend    → 3000 (solo interno, via Traefik)
Container: mi-backend     → 4000 (solo interno, via Traefik)
```

---

## 🛠️ Cómo Verificar Puertos en Tu Servidor

### 1. Ver Puertos del Host

```bash
# Ver qué puertos están en escucha en el HOST
netstat -tuln | grep LISTEN

# Ejemplo de salida:
# tcp   0.0.0.0:80     LISTEN  ← Puerto 80 ocupado
# tcp   0.0.0.0:443    LISTEN  ← Puerto 443 ocupado
# tcp   0.0.0.0:3000   LISTEN  ← Puerto 3000 ocupado
```

### 2. Ver Puertos de Containers

```bash
# Ver containers y sus puertos mapeados
docker ps --format 'table {{.Names}}\t{{.Ports}}'

# Ejemplo de salida:
# nginx-proxy    0.0.0.0:80->80/tcp   ← Mapeo al host
# mi-app         3000/tcp              ← Solo interno
# postgres       5432/tcp              ← Solo interno
```

**Cómo leer la salida**:

- `0.0.0.0:80->80/tcp` → Puerto 80 del host conectado al puerto 80 del container (**expuesto**)
- `3000/tcp` → Puerto 3000 solo interno (**no expuesto**)

### 3. Ver Redes Docker

```bash
# Listar redes
docker network ls

# Ver qué containers están en una red
docker network inspect nombre-red
```

---

## ❓ FAQ: Preguntas Frecuentes

### P1: ¿Cuándo debo mapear un puerto al host?

**R**: Solo cuando necesitas acceso **directo** desde fuera del servidor:

✅ **Sí mapear**:

- Reverse proxy (Traefik/Nginx) → Puertos 80, 443
- Herramientas de admin (ej: Dokploy UI) → Puerto custom
- SSH → Puerto 22 (o custom)

❌ **No mapear**:

- Aplicaciones web/API (usa reverse proxy)
- Bases de datos (seguridad)
- Servicios internos (Redis, workers)

### P2: ¿Es seguro exponer PostgreSQL/Redis?

**R**: ❌ **NO**. Nunca expongas bases de datos directamente:

```yaml
# ❌ INSEGURO
postgres:
  ports:
    - "5432:5432"  # Expuesto a Internet!

# ✅ SEGURO
postgres:
  # Sin 'ports:' → Solo accesible desde otros containers
  networks:
    - backend
```

### P3: ¿Cómo se comunican containers entre sí?

**R**: A través de **redes Docker**:

```yaml
services:
  backend:
    networks:
      - app-network
    environment:
      DATABASE_URL: postgresql://user:pass@postgres:5432/db
      #                                     ↑
      #                        Nombre del container (como hostname)

  postgres:
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

**Nota**: Los containers se conectan por **nombre del servicio**, no por IP.

### P4: ¿Qué es una red overlay vs bridge?

**R**:

- **Bridge**: Red local en un solo servidor (default)
- **Overlay**: Red distribuida en múltiples servidores (Docker Swarm/Kubernetes)

```yaml
# Red local (un servidor)
networks:
  mi-red:
    driver: bridge

# Red distribuida (cluster)
networks:
  mi-red:
    driver: overlay
```

### P5: Mi app no puede conectarse a la base de datos, ¿qué reviso?

**Checklist**:

1. ✅ ¿Están en la misma red?

   ```bash
   docker network inspect mi-red
   ```

2. ✅ ¿El nombre del host es correcto?

   ```bash
   # Desde container de la app
   docker exec -it mi-app ping postgres
   ```

3. ✅ ¿La base de datos está lista?

   ```bash
   docker logs postgres
   ```

4. ✅ ¿Las credenciales son correctas?
   ```yaml
   # Verificar variables de entorno
   docker exec mi-app env | grep DATABASE_URL
   ```

---

## 🎓 Ejercicio Práctico

### Escenario

Tienes que desplegar:

- Frontend Next.js (puerto 3000)
- Backend NestJS (puerto 4000)
- PostgreSQL (puerto 5432)
- Redis (puerto 6379)

**Objetivo**: Configurar docker-compose sin conflictos y de forma segura.

### Solución

```yaml
version: '3.8'

services:
  # Reverse Proxy
  traefik:
    image: traefik:v2.10
    ports:
      - '80:80'
      - '443:443'
    networks:
      - web

  # Frontend
  frontend:
    build: ./frontend
    networks:
      - web
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.frontend.rule=Host(`miapp.com`)'
      - 'traefik.http.services.frontend.loadbalancer.server.port=3000'
    depends_on:
      - backend

  # Backend
  backend:
    build: ./backend
    networks:
      - web
      - backend
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.backend.rule=Host(`api.miapp.com`)'
      - 'traefik.http.services.backend.loadbalancer.server.port=4000'
    environment:
      DATABASE_URL: postgresql://user:pass@postgres:5432/mydb
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

  # PostgreSQL (NO expuesta públicamente)
  postgres:
    image: postgres:15-alpine
    networks:
      - backend
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: mydb
    volumes:
      - postgres-data:/var/lib/postgresql/data

  # Redis (NO expuesta públicamente)
  redis:
    image: redis:7-alpine
    networks:
      - backend
    volumes:
      - redis-data:/data

networks:
  web:
    driver: bridge
  backend:
    driver: bridge

volumes:
  postgres-data:
  redis-data:
```

**Análisis**:

✅ **Puertos del host**:

- Solo 80 y 443 (Traefik)

✅ **Puertos internos**:

- Frontend: 3000
- Backend: 4000
- Postgres: 5432
- Redis: 6379

✅ **Seguridad**:

- DB y Redis NO expuestos
- Acceso via Traefik con dominios

✅ **Comunicación**:

- Backend → Postgres (red `backend`)
- Backend → Redis (red `backend`)
- Frontend → Backend (via Traefik)
- Usuario → Frontend/Backend (via Traefik)

---

## 📖 Recursos Adicionales

### Documentación Oficial

- [Docker Networking](https://docs.docker.com/network/)
- [Docker Compose Networking](https://docs.docker.com/compose/networking/)
- [Traefik Documentation](https://doc.traefik.io/traefik/)

### Comandos Útiles

```bash
# Ver puertos en uso
netstat -tuln | grep LISTEN
ss -tuln | grep LISTEN

# Ver containers y puertos
docker ps --format 'table {{.Names}}\t{{.Ports}}'

# Ver redes
docker network ls
docker network inspect <red>

# Logs de container
docker logs <container> --tail 100 -f

# Ejecutar comando en container
docker exec -it <container> sh

# Test de conectividad entre containers
docker exec <container1> ping <container2>
docker exec <container1> nc -zv <container2> <puerto>
```

---

## 🎯 Conclusión

**Puntos clave**:

1. ✅ **Puertos internos de containers están aislados** - No hay conflictos
2. ✅ **Solo mapea al host lo estrictamente necesario** - Seguridad
3. ✅ **Usa reverse proxy (Traefik)** - Escalable y seguro
4. ✅ **Nunca expongas bases de datos** - Usa redes Docker
5. ✅ **Verifica antes de desplegar** - `netstat`, `docker ps`

**Regla de oro**: Si tienes dudas, mantén el puerto **solo interno** y accede via reverse proxy.

---

**Última actualización**: 2025-12-19
**Mantenido por**: Equipo Amauta
