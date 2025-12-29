# Análisis de Documentos NAP

> **Issue relacionado**: [#22](https://github.com/informaticadiaz/amauta/issues/22)
> **Objetivo**: Analizar los 21 PDFs de NAP para extraer contenido estructurado
> **Estado**: En progreso

## Orden de Análisis

**Criterio**: Por nivel educativo (progresión natural del sistema educativo argentino)

| #   | Archivo                                            | Nivel                | Estado        |
| --- | -------------------------------------------------- | -------------------- | ------------- |
| 1   | `inicial/nap-educacion-inicial.pdf`                | Inicial              | ✅ Completado |
| 2   | `primaria/nap-primaria-1er-ciclo.pdf`              | Primaria 1º-3º       | ⬜ Pendiente  |
| 3   | `primaria/nap-primaria-2do-ciclo.pdf`              | Primaria 4º-6º       | ⬜ Pendiente  |
| 4   | `septimo/nap-septimo-anio.pdf`                     | Séptimo / Transición | ⬜ Pendiente  |
| 5   | `secundaria-basico/nap-matematica.pdf`             | Sec. Básico          | ⬜ Pendiente  |
| 6   | `secundaria-basico/nap-lengua.pdf`                 | Sec. Básico          | ⬜ Pendiente  |
| 7   | `secundaria-basico/nap-ciencias-naturales.pdf`     | Sec. Básico          | ⬜ Pendiente  |
| 8   | `secundaria-basico/nap-ciencias-sociales.pdf`      | Sec. Básico          | ⬜ Pendiente  |
| 9   | `secundaria-basico/nap-formacion-etica.pdf`        | Sec. Básico          | ⬜ Pendiente  |
| 10  | `secundaria-basico/nap-educacion-artistica.pdf`    | Sec. Básico          | ⬜ Pendiente  |
| 11  | `secundaria-basico/nap-educacion-fisica.pdf`       | Sec. Básico          | ⬜ Pendiente  |
| 12  | `secundaria-basico/nap-educacion-tecnologica.pdf`  | Sec. Básico          | ⬜ Pendiente  |
| 13  | `secundaria-orientado/nap-matematica.pdf`          | Sec. Orientado       | ⬜ Pendiente  |
| 14  | `secundaria-orientado/nap-lengua-literatura.pdf`   | Sec. Orientado       | ⬜ Pendiente  |
| 15  | `secundaria-orientado/nap-ciencias-naturales.pdf`  | Sec. Orientado       | ⬜ Pendiente  |
| 16  | `secundaria-orientado/nap-ciencias-sociales.pdf`   | Sec. Orientado       | ⬜ Pendiente  |
| 17  | `secundaria-orientado/nap-filosofia-etica.pdf`     | Sec. Orientado       | ⬜ Pendiente  |
| 18  | `secundaria-orientado/nap-educacion-artistica.pdf` | Sec. Orientado       | ⬜ Pendiente  |
| 19  | `secundaria-orientado/nap-educacion-fisica.pdf`    | Sec. Orientado       | ⬜ Pendiente  |
| 20  | `transversales/nap-lenguas-extranjeras.pdf`        | Transversal          | ⬜ Pendiente  |
| 21  | `transversales/nap-educacion-digital.pdf`          | Transversal          | ⬜ Pendiente  |

**Leyenda**: ⬜ Pendiente | 🔄 En progreso | ✅ Completado

---

## Resumen de Progreso

| Nivel                | Total  | Analizados | Pendientes |
| -------------------- | ------ | ---------- | ---------- |
| Inicial              | 1      | 1          | 0          |
| Primaria             | 2      | 0          | 2          |
| Séptimo              | 1      | 0          | 1          |
| Secundaria Básico    | 8      | 0          | 8          |
| Secundaria Orientado | 7      | 0          | 7          |
| Transversales        | 2      | 0          | 2          |
| **Total**            | **21** | **1**      | **20**     |

---

## Checklist de Análisis

### Educación Inicial

- [x] `inicial/nap-educacion-inicial.pdf`
  - **Páginas**: 22
  - **Fecha publicación**: Diciembre 2004
  - **Resolución**: Nº 214/04 del Consejo Federal de Cultura y Educación
  - **Áreas cubiertas** (7 ejes temáticos, no áreas tradicionales):
    1. Formación Personal y Social (identidad, autonomía, convivencia)
    2. El Juego (central en nivel inicial)
    3. Educación Física (corporeidad, motricidad)
    4. Educación Artística (expresión, producción, apreciación)
    5. Lenguaje Oral y Escrito (prácticas comunicativas)
    6. Indagación del Ambiente (natural, social, tecnológico)
    7. Matemática (número, espacio, medida)
  - **Estructura del documento**:
    - Portada institucional (p. 1)
    - Autoridades nacionales y provinciales (pp. 2-3)
    - Índice (p. 4)
    - Presentación del Ministro (p. 5)
    - Introducción (p. 6)
    - Características del Nivel Inicial (pp. 7-9)
    - Sentido de los NAP en el Nivel Inicial (pp. 10-11)
    - NAP para el Nivel Inicial (pp. 12-20)
    - Cierre (pp. 21-22)
  - **Parseabilidad**: Alta (texto estructurado con viñetas claras)
  - **Notas importantes**:
    - Estructura MUY diferente a Primaria/Secundaria (enfoque holístico)
    - El juego es transversal a todos los aprendizajes
    - No hay división por "materias" sino por ejes de experiencia
    - Los NAP están organizados en párrafos descriptivos, no listas de contenidos
    - Énfasis en el desarrollo integral del niño/a
    - Incluye fundamentación pedagógica extensa antes de los NAP

---

### Educación Primaria

- [ ] `primaria/nap-primaria-1er-ciclo.pdf`
  - Páginas: _pendiente_
  - Áreas cubiertas: _pendiente_
  - Grados: 1º, 2º, 3º
  - Estructura: _pendiente_
  - Notas: _pendiente_

- [ ] `primaria/nap-primaria-2do-ciclo.pdf`
  - Páginas: _pendiente_
  - Áreas cubiertas: _pendiente_
  - Grados: 4º, 5º, 6º
  - Estructura: _pendiente_
  - Notas: _pendiente_

---

### Séptimo Año

- [ ] `septimo/nap-septimo-anio.pdf`
  - Páginas: _pendiente_
  - Áreas cubiertas: _pendiente_
  - Estructura: _pendiente_
  - Notas: _pendiente_

---

### Secundaria Ciclo Básico

- [ ] `secundaria-basico/nap-matematica.pdf`
  - Páginas: _pendiente_
  - Contenidos principales: _pendiente_
  - Notas: _pendiente_

- [ ] `secundaria-basico/nap-lengua.pdf`
  - Páginas: _pendiente_
  - Contenidos principales: _pendiente_
  - Notas: _pendiente_

- [ ] `secundaria-basico/nap-ciencias-naturales.pdf`
  - Páginas: _pendiente_
  - Contenidos principales: _pendiente_
  - Notas: _pendiente_

- [ ] `secundaria-basico/nap-ciencias-sociales.pdf`
  - Páginas: _pendiente_
  - Contenidos principales: _pendiente_
  - Notas: _pendiente_

- [ ] `secundaria-basico/nap-formacion-etica.pdf`
  - Páginas: _pendiente_
  - Contenidos principales: _pendiente_
  - Notas: _pendiente_

- [ ] `secundaria-basico/nap-educacion-artistica.pdf`
  - Páginas: _pendiente_
  - Contenidos principales: _pendiente_
  - Notas: _pendiente_

- [ ] `secundaria-basico/nap-educacion-fisica.pdf`
  - Páginas: _pendiente_
  - Contenidos principales: _pendiente_
  - Notas: _pendiente_

- [ ] `secundaria-basico/nap-educacion-tecnologica.pdf`
  - Páginas: _pendiente_
  - Contenidos principales: _pendiente_
  - Notas: _pendiente_

---

### Secundaria Ciclo Orientado

- [ ] `secundaria-orientado/nap-matematica.pdf`
  - Páginas: _pendiente_
  - Contenidos principales: _pendiente_
  - Notas: _pendiente_

- [ ] `secundaria-orientado/nap-lengua-literatura.pdf`
  - Páginas: _pendiente_
  - Contenidos principales: _pendiente_
  - Notas: _pendiente_

- [ ] `secundaria-orientado/nap-ciencias-naturales.pdf`
  - Páginas: _pendiente_
  - Contenidos principales: _pendiente_
  - Notas: _pendiente_

- [ ] `secundaria-orientado/nap-ciencias-sociales.pdf`
  - Páginas: _pendiente_
  - Contenidos principales: _pendiente_
  - Notas: _pendiente_

- [ ] `secundaria-orientado/nap-filosofia-etica.pdf`
  - Páginas: _pendiente_
  - Contenidos principales: _pendiente_
  - Notas: _pendiente_

- [ ] `secundaria-orientado/nap-educacion-fisica.pdf`
  - Páginas: _pendiente_
  - Contenidos principales: _pendiente_
  - Notas: _pendiente_

- [ ] `secundaria-orientado/nap-educacion-artistica.pdf`
  - Páginas: _pendiente_
  - Contenidos principales: _pendiente_
  - Notas: _pendiente_

---

### Transversales

- [ ] `transversales/nap-lenguas-extranjeras.pdf`
  - Páginas: _pendiente_
  - Niveles cubiertos: Primaria y Secundaria
  - Idiomas: _pendiente_
  - Notas: _pendiente_

- [ ] `transversales/nap-educacion-digital.pdf`
  - Páginas: _pendiente_
  - Niveles cubiertos: Inicial, Primaria, Secundaria
  - Ejes temáticos: _pendiente_
  - Notas: _pendiente_

---

## Plantilla de Análisis

Para cada PDF analizado, completar:

```markdown
- [x] `ruta/archivo.pdf`
  - Páginas: XX
  - Contenidos principales:
    - Eje 1: descripción
    - Eje 2: descripción
  - Estructura del documento:
    - Introducción (pp. X-Y)
    - Contenidos por año/ciclo (pp. X-Y)
    - Orientaciones didácticas (pp. X-Y)
  - Parseabilidad: Alta/Media/Baja
  - Notas: observaciones relevantes
```

---

## Hallazgos Generales

_Esta sección se actualiza a medida que avanza el análisis_

### Patrones comunes encontrados

- **Nivel Inicial** (1/21 analizado):
  - Estructura holística por "ejes de experiencia", no materias tradicionales
  - El juego como eje transversal
  - Enfoque en desarrollo integral, no en contenidos disciplinares
  - Fundamentación pedagógica extensa

### Estructura típica de los documentos

- **Nivel Inicial**:
  ```
  Portada → Autoridades → Índice → Presentación ministerial →
  Introducción → Características del nivel → Sentido de los NAP →
  NAP por eje temático → Cierre
  ```
- **Primaria/Secundaria**: _pendiente de análisis_

### Recomendaciones para el parser

- El parser debe manejar estructuras diferentes según nivel educativo
- Nivel Inicial requiere extracción de párrafos descriptivos, no listas
- Considerar campo `estructura_tipo` para diferenciar (holístico vs disciplinar)
- Los 7 ejes de Inicial no mapean 1:1 con las 10 áreas de otros niveles

---

## Próximos Pasos

1. [x] Analizar estructura de PDF representativo (Nivel Inicial completado)
2. [ ] Analizar PDFs de Primaria para comparar estructura
3. [ ] Identificar patrones comunes entre niveles
4. [ ] Definir formato JSON objetivo (considerando diferencias por nivel)
5. [ ] Desarrollar parser PDF → JSON
6. [ ] Procesar todos los documentos
7. [ ] Validar datos extraídos

---

## Referencias

- [README de NAP](./README.md) - Instrucciones de descarga
- [database.md](../technical/database.md) - Estructura curricular verificada
- Issue #21 - Feature original de integración NAP
- Issue #15 - Seed data (relacionado)
