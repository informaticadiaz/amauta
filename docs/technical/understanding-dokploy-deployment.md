# 🚀 Entendiendo Dokploy: Cómo Funciona el Deployment

> **Para desarrolladores nuevos en Dokploy y deployment en VPS**
> **Audiencia**: Desarrolladores que contratan VPS con Dokploy preinstalado (Hostinger, etc.)

---

## 🤔 La Pregunta

**"Si ya tengo proyectos en mi VPS con Dokploy, ¿cómo despliego un proyecto nuevo sin afectar lo que ya existe?"**

Esta es una duda muy común y totalmente válida. Vamos a resolverla paso a paso.

---

## 📦 ¿Qué es Dokploy?

**Dokploy** es un **orquestador de deployments** similar a Vercel, Netlify o Railway, pero instalado en tu propio servidor VPS.

**Analogía**:

```
Dokploy = Administrador de un edificio de apartamentos
VPS = El edificio físico
Proyectos = Los apartamentos dentro del edificio
```

### Lo Que Dokploy NO es

- ❌ NO es un proyecto/aplicación que puedas tener "varias veces"
- ❌ NO es un container más dentro de tu aplicación
- ❌ NO se "configura por proyecto"

### Lo Que Dokploy SÍ es

- ✅ Es UNA herramienta de administración
- ✅ Gestiona MÚLTIPLES proyectos desde una sola interfaz
- ✅ Cada proyecto es independiente de los otros
- ✅ Tiene su propia base de datos, Redis y Traefik

---

## 🏗️ Arquitectura de tu VPS Actual

### Vista Simplificada

```
┌─────────────────────────────────────────────────────────┐
│ VPS Hostinger (IP: 72.60.144.210)                      │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ DOKPLOY (Panel de Control)                     │    │
│  │ - UI Web: Puerto 3000                          │    │
│  │ - PostgreSQL interno (config de Dokploy)       │    │
│  │ - Redis interno (sesiones de Dokploy)          │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ TRAEFIK (Reverse Proxy - Parte de Dokploy)    │    │
│  │ - Puerto 80 (HTTP)                             │    │
│  │ - Puerto 443 (HTTPS)                           │    │
│  │ - Enruta tráfico a los proyectos              │    │
│  └────────────────────────────────────────────────┘    │
│           │                                             │
│           ├──> Proyecto 1: Supabase                    │
│           │    (supabase.TU-DOMINIO)                   │
│           │                                             │
│           ├──> Proyecto 2: ProfeApp                    │
│           │    (profeapp.TU-DOMINIO)                   │
│           │                                             │
│           └──> [Espacio para Proyecto 3: Amauta]       │
│                (amauta.TU-DOMINIO)                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Vista Detallada de Containers

```
CONTAINERS EN TU VPS:

┌─────────────────────────────────────┐
│ Dokploy (Infraestructura)          │
├─────────────────────────────────────┤
│ - dokploy (UI principal)            │
│ - dokploy-postgres (config DB)      │
│ - dokploy-redis (sesiones)          │
│ - dokploy-traefik (proxy)           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Proyecto 1: Supabase                │
├─────────────────────────────────────┤
│ - supabase-db                       │
│ - supabase-auth                     │
│ - supabase-rest                     │
│ - supabase-storage                  │
│ - supabase-kong                     │
│ - supabase-studio                   │
│ - ... (13 containers total)         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Proyecto 2: ProfeApp                │
├─────────────────────────────────────┤
│ - profeapp-nextjs                   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Proyecto 3: Amauta (a crear)        │
├─────────────────────────────────────┤
│ - amauta-web (frontend)             │
│ - amauta-api (backend)              │
│ - amauta-db (PostgreSQL)            │
│ - amauta-redis (cache)              │
└─────────────────────────────────────┘
```

---

## 🔑 Conceptos Clave

### 1. Un Solo Dokploy, Múltiples Proyectos

```
Dokploy
├── [Proyecto Supabase]
│   └── 13 containers independientes
├── [Proyecto ProfeApp]
│   └── 1 container independiente
└── [Proyecto Amauta] ← Lo vamos a crear
    └── 4 containers independientes
```

**Importante**: Cada proyecto tiene sus propios containers, bases de datos, etc.

### 2. Aislamiento entre Proyectos

```
Proyecto Supabase:
- PostgreSQL en puerto 5432 INTERNO
- No afecta a otros proyectos

Proyecto Amauta:
- PostgreSQL en puerto 5432 INTERNO
- No choca con Supabase
```

**¿Por qué no chocan?** Porque cada uno está en su propio container (como apartamentos separados).

### 3. Traefik: El Director de Tráfico

```
Usuario solicita: https://supabase.diazignacio.ar
         ↓
    Traefik lee: "¿Quién maneja supabase.diazignacio.ar?"
         ↓
    Enruta → Container de Supabase Kong

Usuario solicita: https://amauta.diazignacio.ar
         ↓
    Traefik lee: "¿Quién maneja amauta.diazignacio.ar?"
         ↓
    Enruta → Container de Amauta Web
```

**Traefik** es parte de Dokploy y enruta el tráfico según el dominio.

---

## 🎯 Cómo Funciona el Deployment en Dokploy

### Opción 1: Desde la UI Web (Recomendado)

**Acceso**: `https://dokploy.diazignacio.ar` (o `http://72.60.144.210:3000`)

**Pasos**:

1. **Login** en Dokploy UI
2. **Click en "New Project"**
3. **Configurar proyecto**:
   - Nombre: `Amauta`
   - Descripción: `Sistema educativo LMS`
4. **Agregar aplicaciones** (dentro del proyecto):
   - App 1: `amauta-web` (Frontend)
   - App 2: `amauta-api` (Backend)
5. **Configurar cada app**:
   - Source: GitHub repo
   - Branch: main
   - Build type: Dockerfile
   - Environment variables
   - Domain

**Resultado**: Dokploy automáticamente:

- Clona tu repo
- Construye las imágenes Docker
- Crea los containers
- Configura Traefik para enrutar el tráfico
- Genera certificados SSL con Let's Encrypt

### Opción 2: Desde CLI/SSH (Manual)

También puedes crear containers manualmente vía SSH, pero **NO se verán en la UI de Dokploy** a menos que uses las APIs de Dokploy.

**Recomendación**: Usar siempre la UI para que todo esté integrado.

---

## 🔄 ¿Los Cambios se Reflejan en la UI?

### Si Usas la UI de Dokploy

✅ **SÍ**, todo aparece en la UI:

- Proyectos creados
- Aplicaciones dentro de cada proyecto
- Logs en tiempo real
- Métricas de recursos
- Configuración de dominios
- Variables de entorno

### Si Creas Containers Manualmente (SSH)

⚠️ **NO aparecen automáticamente** en Dokploy UI, porque:

- Dokploy gestiona sus propios containers con etiquetas especiales
- Containers manuales son "invisibles" para Dokploy
- Puedes verlos con `docker ps` pero no desde la UI

**Ejemplo**:

```bash
# Container creado manualmente
docker run -d --name mi-app nginx

# Este container existe, pero Dokploy UI no lo muestra
# Aparece en: docker ps
# NO aparece en: Dokploy UI
```

---

## 🛡️ Seguridad: ¿Afectará Mis Proyectos Existentes?

### Respuesta Corta

✅ **NO**, siempre que:

1. No uses los mismos nombres de containers
2. No mapees los mismos puertos del host
3. No compartas datos sensibles entre proyectos

### Separación de Proyectos

```
Proyecto Supabase:
- Containers: supabase-*
- Red Docker: supabase-network
- Datos: supabase-postgres-data (volume)
- Puertos expuestos: 5432 (pooler)

Proyecto Amauta:
- Containers: amauta-*
- Red Docker: dokploy-network
- Datos: amauta-postgres-data (volume)
- Puertos: Solo internos, acceso via Traefik
```

**NO hay cruces** entre proyectos porque:

- Nombres diferentes
- Redes diferentes (o compartidas de forma controlada)
- Volumes diferentes

### Única Excepción: Recursos del Servidor

**RAM y CPU son compartidos**:

```
VPS con 4GB RAM:
- Supabase usa ~1.5GB
- ProfeApp usa ~200MB
- Amauta usará ~600MB (estimado)
- Dokploy usa ~300MB
Total: ~2.6GB / 4GB → 65% de uso
```

**Si te quedas sin recursos**, todos los proyectos se afectan (lentitud, crashes).

**Solución**: Monitorear con `docker stats` y escalar el VPS si es necesario.

---

## 📋 Proceso de Deployment de Amauta

### Paso a Paso (UI de Dokploy)

```
1. Login en Dokploy UI
   URL: https://dokploy.diazignacio.ar

2. Crear Proyecto Nuevo
   - Click: "New Project"
   - Nombre: Amauta
   - Descripción: Sistema educativo

3. Agregar Base de Datos
   - Click: "Add Database"
   - Tipo: PostgreSQL
   - Nombre: amauta-db
   - Password: [tu-password-generado]

4. Agregar Redis
   - Click: "Add Database"
   - Tipo: Redis
   - Nombre: amauta-redis
   - Password: [tu-password-generado]

5. Agregar Backend API
   - Click: "Add Application"
   - Nombre: amauta-api
   - Source: GitHub
   - Repo: informaticadiaz/amauta
   - Branch: main
   - Build: Dockerfile
   - Path: apps/api/Dockerfile
   - Domain: amauta-api.diazignacio.ar
   - Env vars: [configurar desde secrets]

6. Agregar Frontend Web
   - Click: "Add Application"
   - Nombre: amauta-web
   - Source: GitHub
   - Repo: informaticadiaz/amauta
   - Branch: main
   - Build: Dockerfile
   - Path: apps/web/Dockerfile
   - Domain: amauta.diazignacio.ar
   - Env vars: [configurar desde secrets]

### Validación Post-Deploy (CI/CD)

- GitHub Actions valida el deploy con un healthcheck a `/health`.
- Si el endpoint no responde HTTP 200, el job de deploy falla y queda visible en el run.

7. Deploy
   - Click: "Deploy" en cada aplicación
   - Monitorear logs
   - Verificar que todo esté "Running"

8. Verificar
   - https://amauta.diazignacio.ar
   - https://amauta-api.diazignacio.ar
```

### Lo Que Dokploy Hace Automáticamente

✅ Clona el repositorio
✅ Construye las imágenes Docker
✅ Crea los containers
✅ Conecta a la red dokploy-network
✅ Configura Traefik (routing automático)
✅ Genera certificados SSL (Let's Encrypt)
✅ Reinicia automáticamente si hay crashes
✅ Permite rollback a versiones anteriores

---

## 🎨 Vista de la UI de Dokploy

### Dashboard Principal

```
┌────────────────────────────────────────┐
│ Dokploy                                │
├────────────────────────────────────────┤
│                                        │
│ Proyectos:                             │
│                                        │
│ ┌────────────────────────────────────┐│
│ │ 📦 Supabase                        ││
│ │ Status: Running                    ││
│ │ Apps: 13 containers                ││
│ └────────────────────────────────────┘│
│                                        │
│ ┌────────────────────────────────────┐│
│ │ 📦 ProfeApp                        ││
│ │ Status: Running                    ││
│ │ Apps: 1 container                  ││
│ └────────────────────────────────────┘│
│                                        │
│ ┌────────────────────────────────────┐│
│ │ 📦 Amauta (nuevo)                  ││
│ │ Status: Running                    ││
│ │ Apps: 4 containers                 ││
│ └────────────────────────────────────┘│
│                                        │
│ [+ New Project]                        │
│                                        │
└────────────────────────────────────────┘
```

### Dentro de Proyecto Amauta

```
┌────────────────────────────────────────┐
│ Amauta                                 │
├────────────────────────────────────────┤
│                                        │
│ Applications:                          │
│                                        │
│ • amauta-web                           │
│   Status: ✅ Running                   │
│   Domain: amauta.diazignacio.ar        │
│   [Logs] [Restart] [Redeploy]         │
│                                        │
│ • amauta-api                           │
│   Status: ✅ Running                   │
│   Domain: amauta-api.diazignacio.ar    │
│   [Logs] [Restart] [Redeploy]         │
│                                        │
│ Databases:                             │
│                                        │
│ • amauta-db (PostgreSQL 15)            │
│   Status: ✅ Running                   │
│                                        │
│ • amauta-redis (Redis 7)               │
│   Status: ✅ Running                   │
│                                        │
│ [+ Add Application]                    │
│ [+ Add Database]                       │
│                                        │
└────────────────────────────────────────┘
```

---

## ❓ FAQ: Dudas Comunes

### P1: ¿Puedo gestionar todo desde terminal sin usar la UI?

**R**: Técnicamente sí, pero **NO es recomendado** porque:

- Pierdes las ventajas de Dokploy (UI, logs, métricas)
- Los containers manuales no aparecen en Dokploy
- Tienes que configurar Traefik manualmente
- No hay webhooks automáticos de GitHub

**Recomendación**: Usa la UI de Dokploy. Es para lo que está diseñada.

### P2: ¿Los cambios que hago en la UI se ven via SSH?

**R**: ✅ **SÍ**, porque la UI de Dokploy ejecuta comandos Docker en el servidor.

```bash
# En la UI: Click "Deploy" en amauta-web
# En el servidor (vía SSH):
docker ps | grep amauta-web
# Verás el container recién creado
```

### P3: ¿Puedo tener múltiples Dokploy en el mismo VPS?

**R**: ❌ **NO tiene sentido**. Sería como tener dos administradores de edificio para el mismo edificio.

Dokploy está diseñado para:

- Una instancia por VPS
- Gestionar múltiples proyectos
- Compartir infraestructura (Traefik, etc.)

### P4: ¿Cómo sé cuántos proyectos puedo tener?

**R**: Depende de los **recursos del VPS**:

```
VPS pequeño (2GB RAM):
- 2-3 proyectos pequeños

VPS mediano (4GB RAM):
- 4-6 proyectos medianos
- O 1-2 proyectos grandes (ej: Supabase)

VPS grande (8GB+ RAM):
- 10+ proyectos pequeños
- O varios proyectos grandes
```

**Comando para monitorear**:

```bash
ssh root@TU-VPS "docker stats --no-stream"
```

### P5: ¿Puedo desplegar desde CLI y que aparezca en Dokploy?

**R**: ⚠️ **Solo si usas la API de Dokploy**.

Opciones:

1. **UI Web** → ✅ Recomendado
2. **API de Dokploy** → ✅ Para automatización avanzada
3. **Docker directo** → ❌ No integrado con Dokploy

---

## 🎯 Recomendación Final

Para desplegar Amauta:

### Opción Recomendada: UI de Dokploy

1. **Accede a Dokploy UI**
2. **Crea proyecto "Amauta"**
3. **Agrega aplicaciones (web, api) y bases de datos**
4. **Configura desde la interfaz**
5. **Deploy con un click**

**Ventajas**:

- ✅ Visual y fácil
- ✅ Todo integrado
- ✅ Logs en tiempo real
- ✅ Rollback fácil
- ✅ SSL automático
- ✅ Monitoring incluido

### Alternativa: docker-compose.production.yml

Si prefieres control total desde código:

1. **Subir código a GitHub**
2. **Crear proyecto en Dokploy UI**
3. **Usar tipo "Docker Compose"**
4. **Dokploy ejecuta tu docker-compose.yml**

**Ventaja**: Control desde código (Infrastructure as Code)
**Desventaja**: Tienes que configurar Traefik labels manualmente

---

## 📊 Diagrama de Flujo de Deployment

```
┌─────────────────┐
│ Código en       │
│ GitHub          │
└────────┬────────┘
         │
         │ git push
         ↓
┌─────────────────┐
│ GitHub trigger  │
│ webhook         │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Dokploy recibe  │
│ notificación    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Dokploy clona   │
│ repo            │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Dokploy build   │
│ Docker image    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Dokploy crea    │
│ containers      │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Traefik detecta │
│ nuevo servicio  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ SSL generado    │
│ (Let's Encrypt) │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ ✅ App online   │
│ https://...     │
└─────────────────┘
```

---

## 🔗 Recursos

### Documentación Oficial

- [Dokploy Docs](https://docs.dokploy.com/)
- [Dokploy GitHub](https://github.com/Dokploy/dokploy)

### Comandos Útiles

```bash
# Ver proyectos en ejecución
docker ps

# Ver recursos por proyecto
docker stats

# Ver logs de Dokploy
docker logs dokploy -f

# Ver configuración de Traefik
docker logs dokploy-traefik | tail -100
```

---

## ✅ Conclusión

**Respuestas directas a tus dudas**:

1. ❓ **"¿Cómo interfiere con mi deploy actual?"**
   → ✅ NO interfiere. Cada proyecto es independiente.

2. ❓ **"¿Voy a tener dos Dokploy?"**
   → ❌ NO. Solo hay UN Dokploy que gestiona MÚLTIPLES proyectos.

3. ❓ **"¿Puedo configurar todo desde terminal sin UI?"**
   → ⚠️ Sí, pero NO recomendado. La UI es más fácil y segura.

4. ❓ **"¿Los cambios se reflejan en la UI?"**
   → ✅ SÍ, si usas la UI o API de Dokploy.
   → ❌ NO, si creas containers manualmente con docker.

5. ❓ **"¿Puedo romper mi configuración actual?"**
   → ✅ NO, siempre que uses nombres únicos y no compartas puertos del host.

**Recomendación final**: Usa la UI de Dokploy para deployment. Es segura, fácil y para eso está diseñada.

---

**Última actualización**: 2025-12-19
**Autor**: Equipo Amauta
