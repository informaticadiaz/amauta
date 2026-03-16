# F3-003: Diseño funcional de flujos de evaluación (roles)

## Objetivo

Definir el flujo mínimo viable de evaluaciones por rol para orientar UI, backend y criterios de aceptación en Fase 3.

## Alcance

- Documentación funcional y de gestión.
- Sin cambios de código.
- Aplica a evaluaciones dentro de cursos.

## Roles involucrados

- **Educador**: crea, edita, publica y cierra evaluaciones; revisa resultados.
- **Estudiante**: rinde evaluaciones y recibe feedback/resultado.

## Flujo Educador: crear/editar/publicar evaluación

1. Entrar al curso → sección **Evaluaciones**.
2. **Crear evaluación**.
3. Definir **configuración**:
   - Título y descripción.
   - Puntaje mínimo para aprobar.
   - Intentos máximos.
   - Tiempo límite (minutos).
   - Feedback: inmediato o diferido.
   - Ventana de disponibilidad (opcional).
4. **Construir preguntas** desde el banco o crear nuevas.
5. **Previsualizar** la evaluación.
6. **Guardar como borrador**.
7. **Publicar** cuando esté lista.
8. **Editar**:
   - Si no hay intentos en curso, se permiten cambios.
   - Si hay intentos en curso, solo cambios menores (título/descripcion). Preguntas bloqueadas.
9. **Cerrar evaluación** manualmente o por fin de ventana.

## Flujo Estudiante: rendir/ver feedback/resultado

1. Ir al curso → sección **Evaluaciones**.
2. Ver estado y condiciones:
   - Intentos restantes.
   - Tiempo límite.
   - Puntaje mínimo.
3. **Iniciar intento** (confirmación previa).
4. Resolver preguntas con navegación clara y autosave.
5. **Finalizar** intento (confirmación) o auto-finalización por tiempo.
6. Ver **resultado**:
   - Puntaje total.
   - Estado: aprobado/reprobado.
   - Feedback según configuración (inmediato o diferido).
7. Acceder a **historial de intentos**.

## Casos límite (MVP)

- **Intentos máximos**:
  - Si se alcanzan, se bloquea el inicio y se informa el motivo.
- **Tiempo límite**:
  - Se muestra contador visible.
  - Al expirar, el intento se finaliza automáticamente.
- **Puntaje mínimo**:
  - Define aprobado/reprobado.
  - Si no se alcanza y hay intentos restantes, se habilita reintento.
- **Feedback diferido**:
  - El estudiante ve resultado general, pero no ve respuestas hasta habilitarse.
- **Ediciones con intentos activos**:
  - No se permiten cambios de preguntas para evitar inconsistencias.

## Estados funcionales

**Evaluación**: Borrador → Publicada → Cerrada

**Intento**: En curso → Finalizado / Expirado

**Resultado**: Aprobado / Reprobado

## Salidas esperadas

- **Educador**: panel de resultados por evaluación e histórico de intentos.
- **Estudiante**: resultado inmediato o diferido y acceso a historial.

## Decisiones MVP

- Sin puntaje parcial salvo definición explícita por pregunta.
- Sin reintentos ilimitados.
- Sin evaluación offline.

## Referencias

- `docs/project-management/roadmap.md` → Fase 3
- `docs/human-context/issue-54-diseno-funcional-flujos-evaluacion-roles.md`
