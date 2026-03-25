# 🚀 Guía de Deployment: Amauta en Dokploy UI

> **Objetivo**: Tutorial paso a paso para desplegar Amauta en producción usando Dokploy UI
> **Prerequisitos**: Secrets generados, DNS configurado, acceso a Dokploy UI
> **Tiempo estimado**: 45-60 minutos

---

## 📋 Checklist Pre-Deployment

Antes de empezar, verifica que tienes:

### En el Repositorio Privado

- ✅ Secrets generados (`deployment/credentials/secrets.md`)
- ✅ Variables de entorno preparadas (`.env.api.production.local`, `.env.web.production.local`)

### En Cloudflare (DNS)

- ✅ Registro A: `amauta.[TU-DOMINIO]` → IP del VPS
- ✅ Registro A: `amauta-api.[TU-DOMINIO]` → IP del VPS
- ✅ Proxy activado (naranja)
- ✅ SSL/TLS: Full (strict)

### Accesos

- ✅ URL de Dokploy UI (ej: `https://dokploy.[TU-DOMINIO]`)
- ✅ Credenciales de Dokploy
- ✅ Acceso SSH al VPS (para troubleshooting)

---

## 🎯 Fase 1: Acceso a Dokploy UI

### Paso 1.1: Acceder a Dokploy

```
URL: https://dokploy.[TU-DOMINIO]
O: http://[TU-VPS-IP]:3000
```

**Login** con tus credenciales.

### Paso 1.2: Verificar Estado del Sistema

En el dashboard principal:

- ✅ Verifica que Traefik esté corriendo (verde)
- ✅ Verifica espacio en disco disponible
- ✅ Verifica RAM disponible

**Nota**: Si el uso de recursos está > 80%, considera limpiar o escalar el VPS.

---

## 📦 Fase 2: Crear Proyecto Amauta

### Paso 2.1: Nuevo Proyecto

```
1. Click en "Projects" (menú izquierdo)
2. Click en "+ New Project"
3. Configurar:
   - Name: Amauta
   - Description: Sistema educativo de gestión del aprendizaje
4. Click "Create"
```

**Resultado**: Proyecto "Amauta" creado y vacío.

### Paso 2.2: Configurar Red Docker (Opcional)

Si quieres una red dedicada:

```
1. Dentro del proyecto Amauta
2. Settings → Advanced
3. Network: Seleccionar "dokploy-network" (existente)
   O crear nueva: "amauta-network"
```

**Recomendación**: Usar `dokploy-network` (red compartida, más simple).

---

## 🗄️ Fase 3: Crear Base de Datos PostgreSQL

### Paso 3.1: Agregar PostgreSQL

```
1. Dentro del proyecto Amauta
2. Click "+ Add Service"
3. Seleccionar "PostgreSQL"
4. Configurar:
   - Service Name: amauta-db
   - PostgreSQL Version: 15
   - Database Name: amauta_prod
   - Username: amauta_user
   - Password: [COPIAR desde secrets.md: POSTGRES_PASSWORD]
5. Advanced Settings:
   - Port: 5432 (interno, NO exponer)
   - Memory Limit: 512MB (ajustar según necesidad)
   - Volume: amauta-postgres-data
6. Click "Create"
```

### Paso 3.2: Verificar PostgreSQL

```
1. Esperar a que el status sea "Running" (verde)
2. Click en "amauta-db"
3. Logs → Verificar que no haya errores
4. Buscar línea: "database system is ready to accept connections"
```

### Paso 3.3: Crear Extensiones (Manual vía SSH)

**Desde tu terminal local**:

```bash
# Conectar al VPS
ssh root@[TU-VPS-IP]

# Conectar al container de PostgreSQL
docker exec -it amauta-db psql -U amauta_user -d amauta_prod

# Crear extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

# Verificar
\dx

# Salir
\q
exit
```

---

## 💾 Fase 4: Crear Redis

### Paso 4.1: Agregar Redis

```
1. Dentro del proyecto Amauta
2. Click "+ Add Service"
3. Seleccionar "Redis"
4. Configurar:
   - Service Name: amauta-redis
   - Redis Version: 7
   - Password: [COPIAR desde secrets.md: REDIS_PASSWORD]
5. Advanced Settings:
   - Port: 6379 (interno, NO exponer)
   - Memory Limit: 256MB
   - Volume: amauta-redis-data
6. Click "Create"
```

### Paso 4.2: Verificar Redis

```
1. Esperar status "Running"
2. Logs → Buscar: "Ready to accept connections"
```

---

## 🔧 Fase 5: Desplegar Backend API

### Paso 5.1: Agregar Aplicación Backend

```
1. Dentro del proyecto Amauta
2. Click "+ Add Application"
3. Seleccionar "Git Repository"
4. Configurar Source:
   - Repository URL: https://github.com/informaticadiaz/amauta
   - Branch: master
   - Build Type: Dockerfile
   - Dockerfile Path: apps/api/Dockerfile
   - Build Context: . (raíz del repo)
```

### Paso 5.2: Configurar Variables de Entorno

**IMPORTANTE**: Abrir tu archivo privado `.env.api.production.local` y copiar las variables.

```
Environment Variables (click "Add Variable" para cada una):

NODE_ENV=production
API_PORT=4000
API_HOST=0.0.0.0
API_URL=https://amauta-api.[TU-DOMINIO]
CORS_ORIGIN=https://amauta.[TU-DOMINIO]

DATABASE_URL=postgresql://amauta_user:[POSTGRES_PASSWORD]@amauta-db:5432/amauta_prod?schema=public
REDIS_URL=redis://:[REDIS_PASSWORD]@amauta-redis:6379

JWT_SECRET=[COPIAR desde secrets.md]
SESSION_SECRET=[COPIAR desde secrets.md]
NEXTAUTH_SECRET=[COPIAR desde secrets.md]

LOG_LEVEL=info
LOG_FORMAT=json
```

**Nota**: Reemplazar `[TU-DOMINIO]`, `[POSTGRES_PASSWORD]`, `[REDIS_PASSWORD]` con valores reales de `secrets.md`.

### Paso 5.3: Configurar Dominio

```
Domains:
1. Click "Add Domain"
2. Domain: amauta-api.[TU-DOMINIO]
3. HTTPS: Enabled (auto con Let's Encrypt)
4. Redirect HTTP to HTTPS: Yes
```

### Paso 5.4: Configurar Health Check

```
Health Check:
- Enabled: Yes
- Path: /health
- Port: 4000
- Interval: 30s
- Timeout: 10s
- Retries: 3
```

### Paso 5.5: Deploy Backend

```
1. Review all settings
2. Click "Deploy"
3. Monitor build logs en tiempo real
4. Esperar a que status sea "Running"
```

**Logs a buscar**:

```
✅ Building Docker image...
✅ Image built successfully
✅ Container started
✅ Health check: OK
```

### Paso 5.6: Ejecutar Migraciones Prisma

**Desde tu terminal local** (después de que el backend esté "Running"):

```bash
# Conectar al VPS
ssh root@[TU-VPS-IP]

# Ejecutar migraciones dentro del container
docker exec -it amauta-api npx prisma migrate deploy

# Verificar tablas creadas
docker exec -it amauta-db psql -U amauta_user -d amauta_prod -c "\dt"

# (Opcional) Ejecutar seed si está configurado
docker exec -it amauta-api npx prisma db seed

# Salir
exit
```

### Paso 5.7: Verificar Backend

**Desde tu navegador**:

```
https://amauta-api.[TU-DOMINIO]/health
```

**Respuesta esperada** (ejemplo):

```json
{
  "status": "ok",
  "timestamp": "2025-12-19T...",
  "uptime": 123.45
}
```

**Desde terminal**:

```bash
curl https://amauta-api.[TU-DOMINIO]/health
```

---

## 🎨 Fase 6: Desplegar Frontend Web

### Paso 6.1: Agregar Aplicación Frontend

```
1. Dentro del proyecto Amauta
2. Click "+ Add Application"
3. Seleccionar "Git Repository"
4. Configurar Source:
   - Repository URL: https://github.com/informaticadiaz/amauta
   - Branch: master
   - Build Type: Dockerfile
   - Dockerfile Path: apps/web/Dockerfile
   - Build Context: . (raíz del repo)
```

### Paso 6.2: Configurar Variables de Entorno

**IMPORTANTE**: Abrir tu archivo privado `.env.web.production.local`.

```
Environment Variables:

NODE_ENV=production
PORT=3000

NEXTAUTH_URL=https://amauta.[TU-DOMINIO]
NEXTAUTH_SECRET=[COPIAR desde secrets.md - DEBE SER IGUAL AL BACKEND]

NEXT_PUBLIC_API_URL=https://amauta-api.[TU-DOMINIO]
NEXT_PUBLIC_APP_NAME=Amauta
NEXT_PUBLIC_PWA_ENABLED=true
```

**Nota**: `NEXTAUTH_SECRET` DEBE ser idéntico al del backend.

### Paso 6.3: Configurar Dominio

```
Domains:
1. Click "Add Domain"
2. Domain: amauta.[TU-DOMINIO]
3. HTTPS: Enabled
4. Redirect HTTP to HTTPS: Yes
```

### Paso 6.4: Configurar Build Settings (Next.js)

```
Build Settings:
- Node Version: 20
- Install Command: npm ci
- Build Command: npm run build --workspace=@amauta/web
- Output Directory: apps/web/.next
```

### Paso 6.5: Deploy Frontend

```
1. Review all settings
2. Click "Deploy"
3. Monitor build logs
4. Esperar status "Running"
```

**Build puede tardar 5-10 minutos** (Next.js compila en build time).

### Paso 6.6: Verificar Frontend

**Desde navegador**:

```
https://amauta.[TU-DOMINIO]
```

**Deberías ver**:

- ✅ Página carga sin errores
- ✅ SSL/HTTPS activo (candado verde)
- ✅ Sin errores en consola del navegador

---

## 🔍 Fase 7: Verificación Post-Deployment

### Checklist de Verificación

#### Sistema General

```bash
# Desde tu terminal local
ssh root@[TU-VPS-IP]

# Ver todos los containers de Amauta
docker ps | grep amauta

# Deberías ver 4 containers corriendo:
# - amauta-db
# - amauta-redis
# - amauta-api
# - amauta-web

# Ver recursos consumidos
docker stats --no-stream | grep amauta
```

#### Health Checks

```bash
# Backend health
curl https://amauta-api.[TU-DOMINIO]/health

# Frontend accessible
curl https://amauta.[TU-DOMINIO]

# PostgreSQL
docker exec amauta-db pg_isready -U amauta_user

# Redis
docker exec amauta-redis redis-cli ping
# Respuesta esperada: PONG
```

#### CI/CD Healthcheck

- GitHub Actions valida el deploy con un healthcheck a `/health`.
- Si el endpoint no responde HTTP 200, el job de deploy falla.

#### SSL/TLS

```bash
# Verificar certificado SSL
curl -vI https://amauta.[TU-DOMINIO] 2>&1 | grep -i 'subject\|issuer'

# Deberías ver:
# - Issuer: Let's Encrypt
# - Subject: *.amauta.[TU-DOMINIO]
```

#### Logs

**En Dokploy UI**:

```
1. Project Amauta → amauta-api → Logs
   - Buscar errores (líneas rojas)
   - Verificar que Prisma conectó a DB
   - Verificar que Redis conectó

2. Project Amauta → amauta-web → Logs
   - Verificar que Next.js compiló
   - Sin errores de conexión a API
```

---

## 🎯 Fase 8: Testing Funcional

### Test de Registro/Login

```
1. Ir a https://amauta.[TU-DOMINIO]
2. Intentar crear cuenta de usuario
3. Verificar que el registro funcione
4. Intentar login
5. Verificar que autentica correctamente
```

### Test de API Endpoints

```bash
# Test de endpoint público (si existe)
curl https://amauta-api.[TU-DOMINIO]/api/institutions

# Test de endpoint protegido (requiere auth)
curl -H "Authorization: Bearer TOKEN" \
     https://amauta-api.[TU-DOMINIO]/api/users
```

### Test de Performance

```bash
# Test de carga básico
ab -n 100 -c 10 https://amauta.[TU-DOMINIO]/

# Tiempo de respuesta
curl -w "@-" -o /dev/null -s https://amauta.[TU-DOMINIO]/ <<'EOF'
    time_namelookup:  %{time_namelookup}\n
       time_connect:  %{time_connect}\n
    time_appconnect:  %{time_appconnect}\n
      time_redirect:  %{time_redirect}\n
 time_starttransfer:  %{time_starttransfer}\n
                    ----------\n
         time_total:  %{time_total}\n
EOF
```

---

## 🔄 Fase 9: Configurar Auto-Deploy (Webhooks)

### Paso 9.1: Configurar Webhook en GitHub

```
1. En Dokploy UI:
   - Project Amauta → amauta-api → Settings
   - Copiar "Webhook URL"

2. En GitHub (repo amauta):
   - Settings → Webhooks → Add webhook
   - Payload URL: [URL copiada de Dokploy]
   - Content type: application/json
   - Secret: [Opcional, generado por Dokploy]
   - Events: Just the push event
   - Active: ✅

3. Repetir para amauta-web
```

### Paso 9.2: Probar Auto-Deploy

```bash
# Desde tu máquina local
cd ~/amauta

# Hacer un cambio pequeño
echo "# Test auto-deploy" >> README.md

# Commit y push
git add README.md
git commit -m "test: verificar auto-deploy de Dokploy"
git push origin master

# En Dokploy UI:
# - Deberías ver nuevo deployment iniciado automáticamente
# - Monitor logs
# - Verificar que redeploya correctamente
```

---

## 🛡️ Fase 10: Seguridad Post-Deployment

### Verificar Firewall (UFW)

```bash
ssh root@[TU-VPS-IP]

# Ver reglas activas
sudo ufw status verbose

# Deberías tener SOLO:
# - 22/tcp (SSH)
# - 80/tcp (HTTP)
# - 443/tcp (HTTPS)
# - 443/udp (HTTP/3)

# Si hay otros puertos abiertos (ej: 5432, 6379), cerrarlos:
sudo ufw delete allow 5432/tcp
sudo ufw delete allow 6379/tcp
```

### Verificar Puertos Expuestos

```bash
# Ver qué puertos están escuchando en 0.0.0.0 (público)
netstat -tuln | grep LISTEN | grep "0.0.0.0"

# Deberías ver SOLO:
# - 0.0.0.0:80   (Traefik HTTP)
# - 0.0.0.0:443  (Traefik HTTPS)
# - 0.0.0.0:3000 (Dokploy UI - considerar restringir)
# - 0.0.0.0:22   (SSH)

# PostgreSQL y Redis NO deben aparecer aquí
```

### Restringir Acceso a Dokploy UI (Opcional)

```bash
# Permitir acceso a Dokploy solo desde tu IP
sudo ufw delete allow 3000/tcp
sudo ufw allow from [TU-IP-CASA] to any port 3000 proto tcp

# O configurar autenticación adicional en Traefik
```

---

## 📊 Fase 11: Monitoreo y Alertas

### Configurar Monitoreo de Recursos

**En Dokploy UI**:

```
1. Dashboard → Metrics
2. Configurar alertas (si disponible):
   - CPU > 80%: Warning
   - RAM > 80%: Warning
   - Disk > 80%: Critical
```

### Script de Health Check

**Crear en tu máquina local** (`~/amauta-health-check.sh`):

```bash
#!/bin/bash

echo "🔍 Amauta Health Check $(date)"
echo "================================"

# Backend API
echo -n "Backend API: "
if curl -sf https://amauta-api.[TU-DOMINIO]/health > /dev/null; then
    echo "✅ OK"
else
    echo "❌ FAIL"
fi

# Frontend Web
echo -n "Frontend Web: "
if curl -sf https://amauta.[TU-DOMINIO] > /dev/null; then
    echo "✅ OK"
else
    echo "❌ FAIL"
fi

# PostgreSQL
echo -n "PostgreSQL: "
ssh root@[TU-VPS-IP] "docker exec amauta-db pg_isready -U amauta_user" &> /dev/null
if [ $? -eq 0 ]; then
    echo "✅ OK"
else
    echo "❌ FAIL"
fi

# Redis
echo -n "Redis: "
ssh root@[TU-VPS-IP] "docker exec amauta-redis redis-cli ping" &> /dev/null
if [ $? -eq 0 ]; then
    echo "✅ OK"
else
    echo "❌ FAIL"
fi

echo "================================"
```

```bash
chmod +x ~/amauta-health-check.sh
~/amauta-health-check.sh
```

---

## 🔧 Troubleshooting Común

### Problema: Backend no inicia

**Síntomas**: Container en estado "Restarting" o "Exited"

**Solución**:

```bash
# Ver logs del container
ssh root@[TU-VPS-IP]
docker logs amauta-api --tail 100

# Errores comunes:
# - "Connection refused" → PostgreSQL no está listo
# - "Invalid DATABASE_URL" → Variable mal configurada
# - "Module not found" → Build incompleto
```

**Fix**:

```bash
# Verificar que PostgreSQL esté corriendo
docker ps | grep amauta-db

# Verificar conexión desde API a DB
docker exec -it amauta-api nc -zv amauta-db 5432

# Reconstruir imagen
# En Dokploy UI: amauta-api → Redeploy
```

### Problema: Frontend 502 Bad Gateway

**Síntomas**: Frontend muestra "502 Bad Gateway"

**Causas posibles**:

1. Container no está corriendo
2. Puerto incorrecto
3. Health check falla

**Solución**:

```bash
# Ver estado del container
docker ps | grep amauta-web

# Ver logs
docker logs amauta-web --tail 50

# Verificar puerto interno
docker port amauta-web

# Verificar labels de Traefik
docker inspect amauta-web | grep -A 10 traefik
```

### Problema: SSL no funciona

**Síntomas**: "Your connection is not private" o "NET::ERR_CERT_AUTHORITY_INVALID"

**Solución**:

```bash
# Ver logs de Traefik
docker logs dokploy-traefik | grep -i "amauta\|letsencrypt"

# Verificar que el dominio apunta correctamente
dig amauta.[TU-DOMINIO]

# Verificar configuración en Cloudflare:
# - Proxy: ON (naranja)
# - SSL/TLS: Full (strict)
```

### Problema: NEXTAUTH_SECRET mismatch

**Síntomas**: Login no funciona, errores de sesión

**Solución**:

```bash
# Verificar que el secret sea IDÉNTICO en ambas apps
ssh root@[TU-VPS-IP]

docker exec amauta-api env | grep NEXTAUTH_SECRET
docker exec amauta-web env | grep NEXTAUTH_SECRET

# Si son diferentes, actualizar en Dokploy UI:
# 1. amauta-web → Environment Variables
# 2. NEXTAUTH_SECRET = [mismo valor que backend]
# 3. Restart container
```

---

## 📚 Recursos Post-Deployment

### Comandos Útiles

```bash
# Reiniciar un servicio
# En Dokploy UI: Service → Restart

# O via SSH:
docker restart amauta-api

# Ver logs en tiempo real
docker logs -f amauta-api

# Acceder a shell del container
docker exec -it amauta-api sh

# Backup manual de DB
docker exec amauta-db pg_dump -U amauta_user amauta_prod > backup.sql

# Restore DB
cat backup.sql | docker exec -i amauta-db psql -U amauta_user -d amauta_prod
```

### Documentación Relacionada

- [Entendiendo Dokploy](./understanding-dokploy-deployment.md)
- [Análisis VPS y Deployment](./vps-deployment-analysis.md)
- [Repositorio Privado - Secrets](../../../amauta-deployment-private/deployment/credentials/secrets.md)
- [Plan Detallado de Deployment](../../../amauta-deployment-private/deployment/AMAUTA_DEPLOYMENT_PLAN.md)

---

## ✅ Checklist Final

### Deployment Exitoso

- [ ] Todos los containers en estado "Running"
- [ ] Frontend accesible en https://amauta.[TU-DOMINIO]
- [ ] Backend accesible en https://amauta-api.[TU-DOMINIO]
- [ ] SSL válido (candado verde)
- [ ] Base de datos con schema aplicado
- [ ] Seed data cargado (si corresponde)
- [ ] Login/Registro funcional
- [ ] Sin errores en logs
- [ ] Webhooks configurados (auto-deploy)

### Seguridad

- [ ] Firewall UFW activo
- [ ] PostgreSQL NO expuesto públicamente
- [ ] Redis NO expuesto públicamente
- [ ] SSL/TLS configurado correctamente
- [ ] Secrets configurados (no hardcodeados)
- [ ] Cloudflare proxy activo

### Monitoreo

- [ ] Health checks configurados
- [ ] Logs accesibles
- [ ] Métricas de recursos monitoreadas
- [ ] Script de health check funcionando

---

## 🎉 ¡Deployment Completado!

Si llegaste hasta aquí y todos los checks están ✅, ¡felicitaciones!

**Amauta está en producción.**

### Próximos Pasos

1. **Monitorear primeras 24 horas** - Revisar logs, recursos, errores
2. **Configurar backups automáticos** - Ver documentación de backups
3. **Optimizar performance** - Según métricas reales
4. **Documentar incidentes** - Llevar registro de problemas y soluciones

---

**Última actualización**: 2025-12-19
**Autor**: Equipo Amauta
**Versión**: 1.0
