# Inscripciones

> Las inscripciones conectan a los estudiantes con los cursos. Cuando te inscribís a un curso, podés acceder a sus lecciones y el sistema registra tu progreso.

**Estado**: ✅ Funcional
**Última actualización**: 2026-03-20

---

## ¿Qué puedo hacer?

### Como Estudiante

- Inscribirte a cualquier curso publicado
- Ver la lista de tus cursos inscriptos
- Ver tu progreso en cada curso
- Cancelar tu inscripción si ya no querés continuar
- Retomar un curso que habías abandonado

### Como Educador

Todo lo anterior (para tus propios cursos), más:

- Ver cuántos estudiantes hay inscriptos en tus cursos
- Ver el progreso de cada estudiante

### Como Administrador

Todo lo anterior, más:

- Ver estadísticas generales de inscripciones

---

## Funcionalidades Detalladas

### Inscribirte a un Curso

**¿Qué es?**
Registrarte como estudiante de un curso para acceder a todo su contenido.

**¿Cómo accedo?**

1. Entrá al catálogo de cursos (`/cursos`)
2. Hacé clic en el curso que te interesa
3. En la página del curso, hacé clic en "Inscribirme"

**¿Quién puede usarlo?**
Cualquier usuario con cuenta (estudiantes, educadores, administradores).

**¿Qué necesito?**

- Tener una cuenta y haber iniciado sesión
- El curso debe estar publicado

**¿Qué pasa después?**

- El curso aparece en tu sección "Mis Cursos"
- Podés acceder a todas las lecciones
- Tu progreso comienza en 0%

---

### Ver Mis Cursos

**¿Qué es?**
Una página donde ves todos los cursos en los que estás inscripto.

**¿Cómo accedo?**
Desde el panel, hacé clic en "Mis Cursos" o andá a `/dashboard/mis-cursos`.

**¿Quién puede usarlo?**
Cualquier usuario con cuenta.

**¿Qué veo?**

- **Cursos en progreso**: Los que estás cursando actualmente
- **Cursos completados**: Los que ya terminaste (100% de lecciones)
- Para cada curso:
  - Imagen y título
  - Barra de progreso visual
  - Porcentaje completado
  - Nombre del educador
  - Cantidad de lecciones

**Acciones disponibles:**

- Hacer clic en un curso para continuar donde lo dejaste
- Cancelar inscripción desde el menú del curso

---

### Ver Tu Progreso

**¿Qué es?**
Un indicador que muestra cuánto avanzaste en un curso.

**¿Cómo se calcula?**
El progreso es el porcentaje de lecciones que marcaste como completadas. Si un curso tiene 10 lecciones y completaste 3, tu progreso es 30%.

**¿Dónde lo veo?**

- En la tarjeta del curso en "Mis Cursos"
- En la barra lateral cuando estás viendo una lección
- En el dashboard de estudiante

**Estados del progreso:**
| Progreso | Significado |
|----------|-------------|
| 0% | Recién inscripto, no empezaste |
| 1-99% | En progreso |
| 100% | Curso completado |

---

### Cancelar una Inscripción

**¿Qué es?**
Darte de baja de un curso en el que ya no querés participar.

**¿Cómo accedo?**
En "Mis Cursos", hacé clic en el menú del curso (tres puntos) y seleccioná "Cancelar inscripción".

**¿Quién puede usarlo?**
Solo vos podés cancelar tus propias inscripciones.

**¿Qué pasa?**

- El sistema te pide confirmación
- El curso desaparece de "Mis Cursos"
- Ya no podés acceder a las lecciones
- Tu progreso se guarda (por si querés volver)

**¿Es reversible?**
Sí. Podés volver a inscribirte y tu progreso anterior se mantiene.

---

### Retomar un Curso Abandonado

**¿Qué es?**
Volver a inscribirte en un curso del que te habías dado de baja.

**¿Cómo funciona?**
Simplemente volvé al catálogo, buscá el curso y hacé clic en "Inscribirme" de nuevo.

**¿Qué pasa con mi progreso anterior?**
Se mantiene. Si habías completado 5 lecciones antes de cancelar, esas lecciones siguen marcadas como completadas.

---

### Continuar un Curso

**¿Qué es?**
Retomar el estudio desde donde lo dejaste.

**¿Cómo accedo?**

1. Desde "Mis Cursos", hacé clic en el curso
2. O desde el Dashboard, en la sección "Continuar Aprendiendo"

**¿Qué pasa?**
Te lleva directamente a la primera lección que todavía no completaste.

---

## Estados de una Inscripción

| Estado         | Significado                    | ¿Qué puedo hacer?                           |
| -------------- | ------------------------------ | ------------------------------------------- |
| **Activo**     | Estás cursando activamente     | Acceder a lecciones, marcar progreso        |
| **Completado** | Terminaste todas las lecciones | Revisar contenido, ver certificado (futuro) |
| **Abandonado** | Cancelaste la inscripción      | Volver a inscribirte                        |

### Transiciones posibles

```
(nuevo) → Activo (al inscribirte)
Activo → Completado (al completar 100%)
Activo → Abandonado (al cancelar)
Abandonado → Activo (al reinscribirte)
```

---

## Flujos Comunes

### Inscribirme y empezar un curso

1. Andá al catálogo de cursos
2. Buscá un curso que te interese
3. Hacé clic para ver el detalle
4. Hacé clic en "Inscribirme"
5. Aparece un mensaje de confirmación
6. Hacé clic en "Continuar curso" o "Ir a la primera lección"
7. Comenzá a estudiar

### Ver mi progreso general

1. Andá al Dashboard
2. Mirá la sección "Resumen de Progreso"
3. Ves: cursos en progreso, completados, total inscripto

### Retomar donde lo dejé

1. Andá a "Mis Cursos" o al Dashboard
2. En "Continuar Aprendiendo" ves tus cursos activos
3. Hacé clic en "Continuar"
4. Te lleva a la siguiente lección pendiente

---

## Preguntas Frecuentes

### ¿Puedo inscribirme a varios cursos a la vez?

Sí, no hay límite de cursos simultáneos.

### ¿Las inscripciones tienen costo?

No. Todos los cursos en Amauta son gratuitos.

### ¿Puedo inscribirme a un curso que no está publicado?

No. Solo podés inscribirte a cursos publicados.

### ¿Qué pasa si el educador despublica un curso donde estoy inscripto?

Seguís teniendo acceso al contenido. Solo se oculta para nuevas inscripciones.

### ¿Puedo inscribirme dos veces al mismo curso?

No. Si ya estás inscripto, no podés duplicar la inscripción.

### ¿Pierdo mi progreso si cancelo la inscripción?

No. El progreso se guarda. Si te volvés a inscribir, recuperás donde estabas.

### ¿Cómo sé que completé un curso?

Cuando tu progreso llega al 100%, el curso pasa a la sección "Completados" y cambia de estado.

### ¿Hay límite de tiempo para completar un curso?

No. Podés tomarte el tiempo que necesites.

---

## Limitaciones Conocidas

- No hay notificaciones cuando te inscribís (solo mensaje en pantalla)
- No podés ver el historial de inscripciones canceladas
- No hay filtros avanzados en "Mis Cursos" (por categoría, educador, etc.)
- No hay opción de "pausar" un curso sin cancelar

---

## Próximas Mejoras

- [ ] Certificados al completar cursos
- [ ] Notificaciones por email al inscribirte
- [ ] Recordatorios si no entrás hace tiempo
- [ ] Filtros y búsqueda en "Mis Cursos"
- [ ] Ver historial de cursos abandonados
