# 005: Decisión Final y Plan de Acción

> **Decisión**: URL Pública HTTPS para Comunicación Frontend-Backend
>
> **Estado**: Propuesto → Pendiente de Implementación
>
> **Fecha**: 2026-01-21

---

## 🎯 Decisión Final

### Recomendación

✅ **Usar URL Pública HTTPS para TODAS las comunicaciones server-side entre Frontend y Backend**

```bash
# Configuración en Dokploy → amauta-web → Environment Variables
API_URL=https://amauta-api.diazignacio.ar
NEXT_PUBLIC_API_URL=https://amauta-api.diazignacio.ar
```

---

## 📊 Resumen del Análisis

### Matriz de Decisión Consolidada

| Criterio                   | Peso | Opción A (Interna) | Opción B (Pública) | Ganador  |
| -------------------------- | ---- | ------------------ | ------------------ | -------- |
| **Seguridad**              | 30%  | 5/10               | 9/10               | **B**    |
| **Arquitectura**           | 25%  | 4/10               | 9/10               | **B**    |
| **Offline-First (Fase 2)** | 20%  | 2/10               | 10/10              | **B**    |
| **Costos TCO**             | 15%  | 5/10               | 9/10               | **B**    |
| **Simplicidad**            | 10%  | 3/10               | 10/10              | **B**    |
| **Latencia**               | 5%   | 10/10              | 7/10               | **A**    |
| **TOTAL**                  | 100% | **4.25/10**        | **9.15/10**        | **🏆 B** |

**Conclusión**: Opción B gana en **TODOS** los criterios excepto latencia (que tiene peso mínimo).

---

## 📋 Justificación Multi-Perspectiva

### 🔒 Desde Seguridad

**Opción B es significativamente más segura**:

- ✅ TLS 1.3 end-to-end (vs HTTP plano)
- ✅ Defense in Depth - múltiples capas (vs bypass de capas)
- ✅ Logging completo (vs punto ciego)
- ✅ Mitiga OWASP Top 10 vulnerabilidades

**Riesgos de Opción A**:

- Sniffing de tokens JWT
- Bypass de Cloudflare WAF
- Datos sensibles sin encriptar
- Compliance issues (GDPR/LOPD)

---

### 🏗️ Desde Arquitectura

**Opción B resulta en arquitectura superior**:

- ✅ Bajo acoplamiento (independiente de infra)
- ✅ Respeta SOLID (DIP, OCP)
- ✅ Alta testability (fácil mockear)
- ✅ Portable (funciona en cualquier entorno)
- ✅ Escalable (soporta crecimiento)

**Problemas de Opción A**:

- Alto acoplamiento a Docker
- Viola Dependency Inversion Principle
- Difícil de testear
- No portable

---

### 🎓 Desde Contexto de Amauta

**Opción B alineada con misión social**:

- ✅ Replicable por instituciones (setup simple)
- ✅ Offline-First compatible (Fase 2 PWA)
- ✅ TCO 5x menor ($254 vs $1,274/año)
- ✅ Sostenible a largo plazo
- ✅ Soporta roadmap completo

**Limitaciones de Opción A**:

- Complejo para instituciones pequeñas
- Bloquea Fase 2 Offline-First
- TCO alto por debugging
- Introduce deuda técnica masiva ($600)

---

## ⚖️ El Trade-off: Latencia

### Análisis del Costo

**Latencia adicional**: +27ms (3ms → 30ms)

**¿Es significativo?**
❌ **NO**, porque:

- Threshold de percepción humana: 100ms
- 30ms sigue siendo "instantáneo"
- Se puede mitigar fácilmente con caché

**Mitigación**:

```typescript
// Cloudflare + Browser cache
Cache-Control: public, max-age=86400, immutable

// Resultado:
// Primera carga: 30ms
// Cargas subsiguientes: 0ms (cache hit)
```

### Beneficios que Justifican el Costo

Por +27ms, ganamos:

- Seguridad robusta (TLS, WAF, logging)
- Arquitectura limpia (SOLID, bajo acoplamiento)
- Compatibilidad con roadmap (PWA Offline-First)
- Simplicidad operacional (fácil debugging)
- TCO $1,020/año menor

**ROI (Return on Investment)**: **Excelente**

---

## 📝 Plan de Acción

### Paso 1: Cambiar Variable en Dokploy

**Acción**:

1. Ir a Dokploy UI
2. Navegar a: `amauta-web` → Environment Variables
3. Buscar variable: `API_URL`
4. Cambiar valor de:
   ```
   http://amauta-amautaapi-ryf48a:4000
   ```
   A:
   ```
   https://amauta-api.diazignacio.ar
   ```
5. Click "Save"

**Tiempo estimado**: 2 minutos

---

### Paso 2: Rebuild del Frontend

**Acción**:

1. En Dokploy, en la página de `amauta-web`
2. Click en botón "Redeploy" o "Rebuild"
3. Esperar a que termine el build

**Tiempo estimado**: 3-5 minutos

**¿Por qué es necesario?**
`API_URL` es una variable server-side (sin `NEXT_PUBLIC_`), por lo que Next.js la lee en **build time**. Un rebuild es necesario para que tome el nuevo valor.

---

### Paso 3: Verificar que Funciona

**Verificación inmediata**:

```bash
# 1. Abrir en navegador
https://amauta.diazignacio.ar/dashboard/cursos

# 2. Verificar imágenes
# ✅ Las imágenes de cursos deberían cargar correctamente

# 3. Abrir DevTools → Console
# Buscar errores de red (Network tab)
# No debería haber 404 o 500 en /api/image/*
```

**Verificación de logs**:

```bash
# En Dokploy → amauta-web → Logs
# Buscar líneas como:
# "Fetching image from https://amauta-api.diazignacio.ar/uploads/..."
# ✅ Confirma que usa URL pública
```

**Tiempo estimado**: 3 minutos

---

### Paso 4: Documentar Decisión (ADR)

**Acción**: Crear Architecture Decision Record formal

```bash
# En tu repo local
touch docs/technical/adr/006-url-publica-frontend-backend.md

# Copiar el ADR template (ver documento separado)
# Commit y push
git add docs/technical/adr/006-url-publica-frontend-backend.md
git commit -m "docs(adr): agregar ADR-006 sobre URL pública para networking"
git push
```

**Tiempo estimado**: 5 minutos

---

### Paso 5: Monitorear Rendimiento (Opcional)

**Acción**: Medir latencia real en producción

```typescript
// apps/web/src/app/api/image/[...path]/route.ts

export async function GET(_request, { params }) {
  const start = performance.now();

  const { path } = await params;
  const imagePath = path.join('/');

  const response = await fetch(`${API_URL}/${imagePath}`);

  const end = performance.now();
  const latency = end - start;

  console.log(`[API Image Proxy] Latency: ${latency}ms`);

  // ... resto del código
}
```

**Revisar logs** después de 1 semana para confirmar latencia promedio.

**Tiempo estimado**: 10 minutos

---

## ✅ Checklist de Implementación

### Pre-implementación

- [ ] Leer este documento completo
- [ ] Entender la justificación
- [ ] Tener acceso a Dokploy UI

### Implementación

- [ ] Cambiar `API_URL` en Dokploy (amauta-web)
- [ ] Rebuild de amauta-web
- [ ] Verificar que imágenes cargan en `/dashboard/cursos`
- [ ] Verificar logs (no errores de red)

### Post-implementación

- [ ] Crear ADR-006 en `docs/technical/adr/`
- [ ] Commit y push el ADR
- [ ] (Opcional) Agregar logging de latencia
- [ ] (Opcional) Revisar métricas después de 1 semana

---

## 🚨 Troubleshooting

### Problema: Imágenes Aún No Cargan

**Posibles causas**:

1. **El rebuild no terminó**
   - Verificar en Dokploy → Logs que el build completó exitosamente
   - Buscar línea: "Build completed successfully"

2. **Variable no se guardó**
   - Ir a Environment Variables
   - Verificar que `API_URL` tiene el valor correcto
   - Re-guardar si es necesario

3. **Cache del browser**
   - Hacer hard refresh: Ctrl+Shift+R (Windows/Linux) o Cmd+Shift+R (Mac)
   - O abrir en ventana incógnita

4. **Problema de DNS**

   ```bash
   # Verificar que el dominio resuelve
   nslookup amauta-api.diazignacio.ar

   # Debería mostrar la IP del VPS
   ```

5. **Backend no responde**

   ```bash
   # Verificar health del backend
   curl https://amauta-api.diazignacio.ar/health

   # Debería retornar 200 OK
   ```

---

### Problema: Latencia Muy Alta

**Si la latencia es >100ms**:

1. **Verificar ubicación del VPS**
   - ¿El VPS está geográficamente cerca de los usuarios?
   - Si no, considerar Cloudflare Argo (optimiza routing)

2. **Verificar caché**

   ```bash
   # Headers de respuesta deberían incluir:
   curl -I https://amauta-api.diazignacio.ar/uploads/image.jpg

   # Buscar:
   Cache-Control: public, max-age=...
   ```

3. **Agregar caché más agresivo**
   ```typescript
   // En el API route del proxy
   return new NextResponse(buffer, {
     headers: {
       'Cache-Control': 'public, max-age=86400, immutable',
       'Content-Type': contentType,
     },
   });
   ```

---

## 📈 Seguimiento Post-Implementación

### Métricas a Monitorear

| Métrica               | Cómo Medir              | Objetivo  |
| --------------------- | ----------------------- | --------- |
| **Latencia promedio** | Logs de latencia        | <50ms     |
| **Errores de red**    | DevTools Network        | 0 errores |
| **Cache hit rate**    | Cloudflare Analytics    | >80%      |
| **Uptime**            | Monitoreo (UptimeRobot) | >99.5%    |

### Revisión Semanal (Primera Semana)

- [ ] Día 1: Verificar que no hay errores
- [ ] Día 3: Revisar latencia promedio en logs
- [ ] Día 7: Confirmar que cache está funcionando

### Revisión Mensual

- [ ] Revisar métricas de Cloudflare Analytics
- [ ] Verificar que no hay reportes de problemas de usuarios
- [ ] Confirmar que el costo de bandwidth sigue en Free Tier

---

## 🎓 Lecciones Aprendidas

### Para Futuros Desarrolladores

**Decisiones arquitectónicas deben considerar**:

1. ✅ **Seguridad** - Siempre priorizar encriptación y defensa en profundidad
2. ✅ **Roadmap** - Diseñar para features futuras conocidas (PWA Offline-First)
3. ✅ **Contexto** - Entender la misión del proyecto (educación accesible)
4. ✅ **TCO** - Calcular costos ocultos, no solo directos
5. ✅ **Simplicidad** - KISS es clave para proyectos de impacto social

**Anti-patterns a evitar**:

- ❌ Optimización prematura (elegir latencia sobre arquitectura sólida)
- ❌ Coupling a infraestructura (hardcodear nombres de contenedores)
- ❌ Ignorar roadmap (no pensar en Fase 2)
- ❌ Solo costos directos (olvidar TCO)

---

## 📚 Referencias

### Documentos de Análisis

- `001-analisis-networking-frontend-backend.md` - Análisis completo
- `002-perspectiva-seguridad.md` - Análisis de seguridad
- `003-perspectiva-arquitectura.md` - Análisis arquitectónico
- `004-perspectiva-contexto-amauta.md` - Contexto específico

### Documentación del Proyecto

- `README.md` - Visión y filosofía de Amauta
- `docs/technical/architecture.md` - Arquitectura general
- `docs/technical/adr/005-deployment-dokploy.md` - ADR de deployment
- `docs/project-management/roadmap.md` - Roadmap completo

### Recursos Externos

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Cloudflare Cache](https://developers.cloudflare.com/cache/)

---

## 🎯 Conclusión Final

### La Decisión Correcta para Amauta

✅ **Usar URL Pública HTTPS** es la decisión correcta porque:

1. **Seguridad**: Protege datos sensibles de estudiantes
2. **Arquitectura**: Código limpio, mantenible, escalable
3. **Roadmap**: Soporta Fase 2 PWA Offline-First sin refactor
4. **Sostenibilidad**: TCO 5x menor, accesible para instituciones
5. **Misión**: Alineado con valores de educación como derecho social

### El Precio es Justo

**Trade-off aceptado**: +27ms de latencia

**Beneficios obtenidos**:

- Seguridad robusta
- Arquitectura sólida
- Compatibilidad futura
- Simplicidad operacional
- Ahorro de $1,020/año

**ROI**: Excelente

### Próximos Pasos

1. ✅ Implementar cambio en Dokploy (5 minutos)
2. ✅ Verificar que funciona (3 minutos)
3. ✅ Documentar decisión (ADR-006)
4. ✅ Continuar con Fase 1 del roadmap

**El camino está claro. Adelante con confianza.**

---

**Fin del análisis - NotebookLM Sources completas**
