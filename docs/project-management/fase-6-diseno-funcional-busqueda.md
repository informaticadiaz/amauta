# F6-001: Diseño funcional de búsqueda y descubrimiento de cursos

## Objetivo

Definir el comportamiento funcional de búsqueda y descubrimiento de cursos para el Sprint 18 de Amauta antes de implementar backend o UI.
El foco es acordar alcance, reglas de relevancia, filtros iniciales, estados de experiencia y criterios de aceptación compartidos entre API y frontend.

## Alcance

- Documentación funcional y de producto.
- Sin cambios de código de aplicación.
- Aplica al catálogo público de cursos en `/cursos`.
- Define el contrato funcional base para `#94` (API) y `#95` (UI).

---

## 1. Casos de uso por rol

### Estudiante o visitante del catálogo

| Caso de uso              | Necesidad                                                     |
| ------------------------ | ------------------------------------------------------------- |
| Buscar por palabra clave | Encontrar rápido un curso por tema o interés                  |
| Filtrar resultados       | Reducir ruido por categoría, nivel, duración o idioma         |
| Ordenar resultados       | Priorizar relevancia, novedad o exploración alfabética        |
| Entender estados vacíos  | Saber si no hay cursos, no hubo coincidencias o hubo un error |

### Educador

| Caso de uso                          | Necesidad                                       |
| ------------------------------------ | ----------------------------------------------- |
| Ver cómo aparece su oferta publicada | Confirmar descubribilidad de sus cursos         |
| Buscar cursos similares              | Evitar duplicaciones y revisar oferta existente |
| Validar filtros del catálogo         | Entender cómo un estudiante navega la oferta    |

### Administrador

| Caso de uso                                 | Necesidad                                            |
| ------------------------------------------- | ---------------------------------------------------- |
| Auditar descubrimiento del catálogo público | Verificar que la oferta publicada sea navegable      |
| Revisar consistencia de metadatos           | Detectar cursos mal categorizados o sin datos útiles |

> Para Sprint 18, los tres roles consumen la misma experiencia de catálogo público.
> No existe una variante administrativa especial de búsqueda en esta fase.

---

## 2. Qué entra en la búsqueda inicial

### Campos incluidos en la búsqueda textual

| Campo         | Uso                               | Peso funcional inicial |
| ------------- | --------------------------------- | ---------------------- |
| `titulo`      | Fuente principal de coincidencia  | Alto                   |
| `descripcion` | Contexto semántico complementario | Medio                  |

### Campos visibles pero no incluidos en la búsqueda textual inicial

| Campo                  | Tratamiento en Sprint 18                | Razón                                                       |
| ---------------------- | --------------------------------------- | ----------------------------------------------------------- |
| `categoria`            | Se usa como filtro, no como texto libre | Reduce complejidad y evita mezclar búsqueda con facetas     |
| `nivel`                | Se usa como filtro                      | Valor discreto, mejor como faceta                           |
| `duracion`             | Se usa como filtro por rangos           | Mejora exploración sin inflar relevancia textual            |
| `idioma`               | Se usa como filtro                      | Valor discreto                                              |
| nombre del educador    | Fuera de la búsqueda inicial            | No es la intención principal de descubrimiento en esta fase |
| contenido de lecciones | Fuera de la búsqueda inicial            | Scope demasiado grande para Sprint 18                       |
| etiquetas/tags         | Fuera de la búsqueda inicial            | Aún no existe un modelo estable para catálogo               |

### Regla funcional

La búsqueda inicial responde a la pregunta:

> “¿Qué cursos publicados hablan de este tema?”

No responde todavía a:

- “¿Qué cursos creó tal docente?”
- “¿Qué cursos contienen esta palabra dentro de sus lecciones?”
- “¿Qué me recomienda Amauta según mi historial?”

---

## 3. Filtros iniciales del catálogo

### Filtros incluidos

| Filtro    | Valores                                                       | Comportamiento   |
| --------- | ------------------------------------------------------------- | ---------------- |
| Categoría | catálogo real de categorías                                   | Selección simple |
| Nivel     | `PRINCIPIANTE`, `INTERMEDIO`, `AVANZADO`                      | Selección simple |
| Duración  | `Corta` (< 60 min), `Media` (60-180 min), `Larga` (> 180 min) | Selección simple |
| Idioma    | valor real del curso, iniciando por `es`                      | Selección simple |

### Reglas

- Todos los filtros son combinables entre sí.
- Cambiar filtros reinicia paginación a página 1.
- La URL debe reflejar `buscar`, filtros y orden para permitir compartir el estado.
- Solo se listan cursos con estado `PUBLICADO`.
- Si una categoría no tiene resultados para la búsqueda actual, no se oculta del selector; simplemente devuelve cero resultados si el usuario la elige.

---

## 4. Reglas de ordenamiento y relevancia inicial

### Orden por defecto

| Contexto                | Orden por defecto                                   |
| ----------------------- | --------------------------------------------------- |
| Sin término de búsqueda | `publicadoEn desc`                                  |
| Con término de búsqueda | `relevancia desc`, desempate por `publicadoEn desc` |

### Definición funcional de relevancia inicial

1. Coincidencia en `titulo` pesa más que coincidencia en `descripcion`.
2. Coincidencias exactas o de frase corta en `titulo` deben quedar por encima de coincidencias parciales solo en descripción.
3. Si dos cursos tienen relevancia equivalente, aparece primero el más recientemente publicado.

### Opciones de orden visibles en UI

| Opción        | Disponibilidad                   |
| ------------- | -------------------------------- |
| Relevancia    | Solo cuando hay búsqueda textual |
| Más recientes | Siempre                          |
| Título A-Z    | Siempre                          |

> “Más antiguos”, “más populares” y orden por inscripciones quedan fuera del Sprint 18.

---

## 5. Estados de experiencia

### Estado vacío del catálogo

Se muestra cuando no existen cursos publicados en el catálogo.

Debe comunicar:

- que todavía no hay oferta publicada;
- que no es un error del usuario;
- una acción de salida clara (“volver más tarde” o “explorar categorías” no aplica si no hay cursos).

### Estado sin resultados

Se muestra cuando sí existen cursos publicados, pero la combinación actual de búsqueda y filtros no devuelve coincidencias.

Debe comunicar:

- qué condición generó el vacío;
- opción de limpiar filtros;
- opción de borrar el texto buscado.

### Estado de error

Se muestra cuando falla la carga de resultados o filtros.

Debe comunicar:

- que hubo un problema temporal;
- acción explícita de reintento;
- no mezclar error con “sin resultados”.

---

## 6. Qué queda fuera de Sprint 18

| Fuera de alcance                               | Motivo                                       |
| ---------------------------------------------- | -------------------------------------------- |
| Recomendaciones personalizadas                 | Requieren señales de uso e historial         |
| Autosuggest/autocomplete                       | Requiere endpoints y UX adicionales          |
| Corrección ortográfica o fuzzy search avanzada | Excede el alcance de búsqueda básica         |
| Búsqueda sobre lecciones, recursos o foros     | Multiplica el dominio de indexación          |
| Ranking por popularidad/inscripciones          | Requiere criterio de negocio adicional       |
| Tags/etiquetas de catálogo                     | No están consolidadas en el modelo actual    |
| Filtros multi-select complejos                 | Se prioriza simplicidad en primera iteración |
| Experiencia privada para admins o educadores   | Sprint 18 cubre catálogo público             |

---

## 7. Criterios de aceptación — API (`#94`)

### Contrato funcional esperado

- La API debe aceptar `buscar`, `categoriaId`, `nivel`, `duracion`, `idioma`, `page`, `limit` y orden.
- La API debe devolver únicamente cursos `PUBLICADO`.
- Si hay término de búsqueda, el backend debe priorizar coincidencias de `titulo` por encima de `descripcion`.
- La API debe soportar paginación estable para la misma combinación de búsqueda + filtros + orden.
- La respuesta debe distinguir correctamente entre:
  - lista con resultados;
  - lista vacía sin error;
  - error de carga.

### Criterios de aceptación

1. Dado un término que coincide en títulos publicados, la API devuelve esos cursos antes que otros con coincidencia solo en descripción.
2. Dado un filtro por categoría, nivel, duración o idioma, la API devuelve solo cursos que cumplen todos los filtros activos.
3. Dado que no hay `buscar`, la API ordena por fecha de publicación descendente.
4. Dado que hay `buscar`, la API ordena por relevancia descendente y usa `publicadoEn desc` como desempate.
5. La API nunca devuelve cursos `BORRADOR`, `REVISION` ni `ARCHIVADO`.

---

## 8. Criterios de aceptación — UI (`#95`)

### Contrato funcional esperado

- La UI del catálogo debe ofrecer buscador visible al entrar en `/cursos`.
- Los filtros iniciales deben ser visibles, comprensibles y reseteables.
- El orden seleccionado debe ser consistente con el contexto de búsqueda.
- La URL debe mantenerse sincronizada con el estado de descubrimiento.

### Criterios de aceptación

1. El usuario puede escribir un término, ejecutar búsqueda y ver resultados actualizados sin perder contexto.
2. El usuario puede aplicar categoría, nivel, duración e idioma en combinación.
3. El usuario puede limpiar filtros y volver al estado base del catálogo.
4. La UI muestra un estado específico para catálogo vacío, otro para sin resultados y otro para error.
5. Cuando hay término de búsqueda, la UI ofrece “Relevancia” como orden; sin término, prioriza “Más recientes”.

---

## 9. Dependencias de Sprint 18

| Issue          | Depende de                      | Razón                                                      |
| -------------- | ------------------------------- | ---------------------------------------------------------- |
| `#93 / F6-001` | —                               | Define alcance y contrato funcional                        |
| `#94 / F6-002` | `#93 / F6-001`                  | Necesita reglas cerradas de búsqueda, filtros y relevancia |
| `#95 / F6-003` | `#93 / F6-001` y `#94 / F6-002` | Requiere el contrato funcional y el endpoint base          |

### Secuencia recomendada

1. `F6-001` — cerrar diseño funcional.
2. `F6-002` — implementar API de búsqueda básica y filtros iniciales.
3. `F6-003` — construir la UI final sobre el contrato ya estabilizado.

---

## 10. Decisiones funcionales resumidas

| Tema                           | Decisión Sprint 18                 |
| ------------------------------ | ---------------------------------- |
| Alcance de búsqueda textual    | `titulo` + `descripcion`           |
| Catálogo afectado              | Solo cursos `PUBLICADO`            |
| Filtros iniciales              | categoría, nivel, duración, idioma |
| Orden por defecto sin búsqueda | más recientes                      |
| Orden por defecto con búsqueda | relevancia                         |
| Recomendaciones personalizadas | fuera de alcance                   |
| Búsqueda sobre lecciones       | fuera de alcance                   |
