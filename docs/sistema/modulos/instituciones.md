# Configuración Institucional

> La configuración institucional permite a cada escuela o institución personalizar períodos académicos y escalas de calificación según sus necesidades.

**Estado**: ✅ Funcional (API)
**Última actualización**: 2026-03-28

---

## ¿Qué puedo hacer?

### Como Administrador de Escuela

- Crear y gestionar períodos académicos
- Configurar la escala de calificación de tu institución
- Activar o desactivar períodos académicos
- Ver el historial de períodos anteriores
- Listar estudiantes y educadores de tu institución para asignarlos a grupos

### Como Super Administrador

Todo lo anterior para cualquier institución del sistema.

---

## Funcionalidades Detalladas

### Períodos Académicos

#### ¿Qué son?

Los períodos académicos dividen el año escolar en segmentos (bimestres, trimestres, semestres, cuatrimestres) para organizar calificaciones y actividades.

#### Crear un Período Académico

**¿Cómo accedo?**
Desde el panel de administración: "Configuración" → "Períodos Académicos" → "Nuevo Período".

**¿Quién puede usarlo?**
Administradores de escuela y Super administradores.

**¿Qué necesito completar?**

- **Nombre** (obligatorio): Ej: "Primer Bimestre 2026", "Semestre 1"
- **Fecha de inicio** (obligatorio): Cuándo comienza el período
- **Fecha de fin** (obligatorio): Cuándo termina el período
- **Activo** (por defecto: Sí): Si el período está en uso

---

#### Editar un Período Académico

**¿Qué puedo cambiar?**

- Nombre
- Fechas de inicio y fin
- Estado (activo/inactivo)

**Nota**: No se recomienda cambiar fechas de períodos con calificaciones ya cargadas.

---

#### Desactivar un Período

**¿Qué es?**
Marcar un período como inactivo (generalmente al terminar).

**¿Qué pasa?**

- El período no aparece como opción para nuevas cargas
- Se conservan todas las calificaciones históricas
- Podés reactivarlo si es necesario

---

### Escala de Calificación

#### ¿Qué es?

La escala define cómo se califican los estudiantes en tu institución. Cada institución tiene una única escala configurada.

#### Configurar la Escala

**¿Cómo accedo?**
Desde el panel de administración: "Configuración" → "Escala de Calificación".

**¿Quién puede usarlo?**
Administradores de escuela y Super administradores.

**¿Qué puedo configurar?**

- **Nota mínima**: El valor más bajo posible (ej: 1, 0)
- **Nota máxima**: El valor más alto posible (ej: 10, 100)
- **Nota de aprobación**: El mínimo para aprobar (ej: 6, 60)
- **Descripción** (opcional): Información adicional sobre la escala

---

#### Ejemplos de Escalas Comunes

| Tipo           | Mínima | Máxima | Aprobación |
| -------------- | ------ | ------ | ---------- |
| Decimal (1-10) | 1      | 10     | 6          |
| Centesimal     | 0      | 100    | 60         |
| Conceptual     | 1      | 5      | 3          |

---

### Listado de Usuarios de la Institución

#### ¿Qué es?

Un listado filtrable de estudiantes y educadores disponibles para asignarlos a grupos y clases.

#### ¿Quién puede usarlo?

Administradores de escuela y Super administradores.

#### ¿Qué filtros existen?

- **Buscar** por nombre, apellido o email
- **Paginación** para navegar grandes listados

#### ¿Qué datos se muestran?

- ID del usuario
- Nombre y apellido
- Email
- Estado activo

---

## Flujos Comunes

### Configurar tu institución para el nuevo año

1. Iniciá sesión como administrador de escuela
2. Andá a "Configuración" → "Períodos Académicos"
3. Desactivá los períodos del año anterior
4. Creá los nuevos períodos (bimestres, trimestres, etc.)
5. Verificá que la escala de calificación esté correcta
6. Empezá a crear grupos para el nuevo año

### Cerrar un período académico

1. Asegurate de que todas las calificaciones estén cargadas
2. Andá a "Períodos Académicos"
3. Seleccioná el período a cerrar
4. Hacé clic en "Desactivar"
5. El período queda cerrado pero con historial accesible

---

## Preguntas Frecuentes

### ¿Puedo tener varios períodos activos a la vez?

Sí. Por ejemplo, podés tener activo el "Primer Semestre" y dentro de él el "Primer Bimestre".

### ¿Puedo cambiar la escala de calificación después de cargar notas?

Técnicamente sí, pero no es recomendable. Las notas existentes no se recalculan automáticamente.

### ¿Cada institución tiene su propia escala?

Sí. Cada institución configura su escala de forma independiente.

### ¿Puedo eliminar un período académico?

No se pueden eliminar, solo desactivar. Esto preserva el historial de calificaciones.

### ¿Los períodos académicos afectan a los grupos?

Sí. Los grupos están asociados a un período académico específico.

---

## Limitaciones Conocidas

- Solo una escala de calificación por institución
- No hay soporte para escalas mixtas (numérica + conceptual)
- No se pueden crear subperíodos (ej: semanas dentro de bimestres)

---

## Próximas Mejoras

- [ ] Soporte para múltiples escalas por materia
- [ ] Escalas conceptuales (Excelente, Muy Bueno, Bueno, etc.)
- [ ] Calendario académico con feriados
- [ ] Plantillas de períodos predefinidas
