# Evaluaciones

> Las evaluaciones permiten a los educadores crear exámenes, quizzes y trabajos prácticos para medir el aprendizaje de sus estudiantes.

**Estado**: ✅ Funcional
**Última actualización**: 2026-03-26

---

## ¿Qué puedo hacer?

### Como Educador

- Crear evaluaciones para tus cursos
- Definir preguntas y respuestas
- Establecer puntaje y criterios de aprobación
- Publicar evaluaciones para que los estudiantes las vean
- Despublicar evaluaciones temporalmente
- Ver el listado de evaluaciones por curso
- Ver el detalle de cada evaluación

### Como Estudiante

- Ver las evaluaciones disponibles en tus cursos
- (Próximamente) Realizar evaluaciones
- (Próximamente) Ver tus resultados y calificaciones

### Como Administrador

- Ver todas las evaluaciones del sistema
- Gestionar evaluaciones de cualquier curso

---

## Funcionalidades Detalladas

### Crear una Evaluación

**¿Qué es?**
Crear un nuevo examen o quiz para un curso.

**¿Cómo accedo?**
Desde el panel de educador: "Mis Cursos" → seleccioná un curso → "Evaluaciones" → "Nueva Evaluación".

**¿Quién puede usarlo?**
Educadores (en sus propios cursos) y administradores.

**¿Qué necesito completar?**

- **Título** (obligatorio): Nombre de la evaluación
- **Descripción** (opcional): Instrucciones o contexto
- **Curso** (obligatorio): El curso al que pertenece
- **Puntaje máximo** (opcional): Puntos totales de la evaluación
- **Fecha límite** (opcional): Hasta cuándo se puede realizar

---

### Ver Listado de Evaluaciones

**¿Qué es?**
Ver todas las evaluaciones de un curso específico.

**¿Cómo accedo?**
Desde "Mis Cursos" → seleccioná un curso → pestaña "Evaluaciones".

**¿Quién puede usarlo?**
Educadores y administradores.

**¿Qué veo?**

- Lista de evaluaciones del curso
- Estado de cada una (borrador/publicada)
- Fecha de creación
- Acciones rápidas (ver detalle, publicar, editar)

---

### Ver Detalle de Evaluación

**¿Qué es?**
Ver toda la información de una evaluación específica.

**¿Cómo accedo?**
Hacé clic en una evaluación del listado.

**¿Quién puede usarlo?**
El educador dueño del curso o administradores.

**¿Qué veo?**

- Título y descripción
- Curso asociado
- Estado (borrador/publicada)
- Fecha de creación
- Puntaje máximo
- (Próximamente) Preguntas y respuestas

---

### Publicar una Evaluación

**¿Qué es?**
Hacer visible la evaluación para los estudiantes del curso.

**¿Cómo accedo?**
Desde el detalle de la evaluación, hacé clic en "Publicar".

**¿Quién puede usarlo?**
El educador dueño del curso.

**¿Qué pasa?**

- La evaluación aparece en el curso para los estudiantes
- Los estudiantes pueden verla y (próximamente) realizarla
- Se registra la fecha de publicación

---

### Despublicar una Evaluación

**¿Qué es?**
Ocultar temporalmente una evaluación de los estudiantes.

**¿Cómo accedo?**
Desde el detalle de la evaluación, hacé clic en "Despublicar".

**¿Quién puede usarlo?**
El educador dueño del curso.

**¿Qué pasa?**

- La evaluación vuelve a estado borrador
- Los estudiantes ya no pueden verla
- No se pierden datos

---

## Estados de una Evaluación

| Estado        | Significado                     | ¿Estudiantes la ven? |
| ------------- | ------------------------------- | -------------------- |
| **Borrador**  | En edición, no visible          | No                   |
| **Publicada** | Disponible para los estudiantes | Sí                   |

### Transiciones posibles

```
Borrador → Publicada (al publicar)
Publicada → Borrador (al despublicar)
```

---

## Flujos Comunes

### Crear y publicar una evaluación

1. Iniciá sesión como educador
2. Andá a "Mis Cursos" y seleccioná un curso
3. Hacé clic en la pestaña "Evaluaciones"
4. Hacé clic en "Nueva Evaluación"
5. Completá título, descripción y puntaje
6. Guardá la evaluación (queda en borrador)
7. (Próximamente) Agregá preguntas
8. Hacé clic en "Publicar"

### Ocultar una evaluación temporalmente

1. Andá al detalle de la evaluación
2. Hacé clic en "Despublicar"
3. La evaluación vuelve a borrador
4. Podés publicarla de nuevo cuando quieras

---

## Preguntas Frecuentes

### ¿Puedo crear evaluaciones sin preguntas?

Sí, por ahora podés crear la estructura de la evaluación. El sistema de preguntas está en desarrollo.

### ¿Los estudiantes pueden ver evaluaciones en borrador?

No. Solo el educador ve las evaluaciones en borrador.

### ¿Puedo editar una evaluación ya publicada?

Sí, pero tené cuidado si los estudiantes ya la están realizando.

### ¿Cuántas evaluaciones puedo crear por curso?

No hay límite.

---

## Limitaciones Conocidas

- Aún no se pueden agregar preguntas a las evaluaciones
- Los estudiantes no pueden realizar evaluaciones todavía
- No hay sistema de calificación automática
- No hay límite de tiempo para evaluaciones

---

## Próximas Mejoras

- [ ] Sistema de preguntas (múltiple opción, verdadero/falso, desarrollo)
- [ ] Realización de evaluaciones por estudiantes
- [ ] Calificación automática para preguntas objetivas
- [ ] Límite de tiempo para evaluaciones
- [ ] Retroalimentación por pregunta
- [ ] Banco de preguntas reutilizables
