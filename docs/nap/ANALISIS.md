# Análisis de Documentos NAP

> **Issue relacionado**: [#22](https://github.com/informaticadiaz/amauta/issues/22)
> **Objetivo**: Analizar los 21 PDFs de NAP para extraer contenido estructurado
> **Estado**: En progreso

## Orden de Análisis

**Criterio**: Por nivel educativo (progresión natural del sistema educativo argentino)

| #   | Archivo                                            | Nivel                | Estado        |
| --- | -------------------------------------------------- | -------------------- | ------------- |
| 1   | `inicial/nap-educacion-inicial.pdf`                | Inicial              | ✅ Completado |
| 2   | `primaria/nap-primaria-1er-ciclo.pdf`              | Primaria 1º-3º       | ✅ Completado |
| 3   | `primaria/nap-primaria-2do-ciclo.pdf`              | Primaria 4º-6º       | ✅ Completado |
| 4   | `septimo/nap-septimo-anio.pdf`                     | Séptimo / Transición | ✅ Completado |
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

## Preparación de PDFs para Análisis

### Recomendación: Dividir PDFs Grandes

Para PDFs con más de **50 páginas**, se recomienda dividirlos en partes más pequeñas antes del análisis. Esto permite:

- Analizar el contenido de forma más detallada
- Evitar límites de contexto en sesiones de análisis
- Facilitar el seguimiento del progreso por secciones

### Criterio de División

| Páginas del PDF | Partes recomendadas       |
| --------------- | ------------------------- |
| < 50            | No dividir                |
| 50-100          | 3-4 partes                |
| 100-150         | 5 partes                  |
| > 150           | 6+ partes (~25-30 pp c/u) |

### Script de División

```python
# Requiere: pip install pypdf
# Uso: python3 dividir_pdf.py

try:
    from pypdf import PdfReader, PdfWriter
except ImportError:
    from PyPDF2 import PdfReader, PdfWriter

import os

def dividir_pdf(pdf_path, num_partes):
    """Divide un PDF en N partes aproximadamente iguales."""
    reader = PdfReader(pdf_path)
    num_pages = len(reader.pages)

    pages_per_part = num_pages // num_partes
    remainder = num_pages % num_partes

    base_name = os.path.splitext(pdf_path)[0]
    output_dir = os.path.dirname(pdf_path)

    start = 0
    for i in range(num_partes):
        # Distribuir páginas extra en las primeras partes
        extra = 1 if i < remainder else 0
        end = start + pages_per_part + extra

        writer = PdfWriter()
        for page_num in range(start, end):
            writer.add_page(reader.pages[page_num])

        output_path = f"{base_name}-parte{i+1}.pdf"
        with open(output_path, "wb") as output_file:
            writer.write(output_file)

        print(f"Parte {i+1}: páginas {start+1}-{end} -> {os.path.basename(output_path)}")
        start = end

    print(f"\nPDF dividido en {num_partes} partes exitosamente")

# Ejemplo de uso:
# dividir_pdf("/ruta/al/archivo.pdf", 5)
```

### PDFs Divididos

| PDF Original                          | Páginas | Partes | Archivos generados              |
| ------------------------------------- | ------- | ------ | ------------------------------- |
| `inicial/nap-educacion-inicial.pdf`   | 22      | 4      | `*-parte1.pdf` a `*-parte4.pdf` |
| `primaria/nap-primaria-1er-ciclo.pdf` | 95      | 4      | `*-parte1.pdf` a `*-parte4.pdf` |
| `primaria/nap-primaria-2do-ciclo.pdf` | 131     | 5      | `*-parte1.pdf` a `*-parte5.pdf` |
| `septimo/nap-septimo-anio.pdf`        | 94      | 4      | `*-parte1.pdf` a `*-parte4.pdf` |

### Detalle de División: Primaria 2do Ciclo

| Parte | Páginas | Archivo                             | Tamaño |
| ----- | ------- | ----------------------------------- | ------ |
| 1     | 1-27    | `nap-primaria-2do-ciclo-parte1.pdf` | 659K   |
| 2     | 28-53   | `nap-primaria-2do-ciclo-parte2.pdf` | 106K   |
| 3     | 54-79   | `nap-primaria-2do-ciclo-parte3.pdf` | 122K   |
| 4     | 80-105  | `nap-primaria-2do-ciclo-parte4.pdf` | 121K   |
| 5     | 106-131 | `nap-primaria-2do-ciclo-parte5.pdf` | 197K   |

### Comando Rápido para Nueva Sesión

```bash
# Ver páginas de un PDF
python3 -c "
from pypdf import PdfReader
r = PdfReader('/ruta/al/pdf.pdf')
print(f'Páginas: {len(r.pages)}')"

# Dividir en N partes (copiar script arriba y ejecutar)
```

---

## Resumen de Progreso

| Nivel                | Total  | Analizados | Pendientes |
| -------------------- | ------ | ---------- | ---------- |
| Inicial              | 1      | 1          | 0          |
| Primaria             | 2      | 2          | 0          |
| Séptimo              | 1      | 1          | 0          |
| Secundaria Básico    | 8      | 0          | 8          |
| Secundaria Orientado | 7      | 0          | 7          |
| Transversales        | 2      | 0          | 2          |
| **Total**            | **21** | **4**      | **17**     |

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

- [x] `primaria/nap-primaria-1er-ciclo.pdf`
  - **Páginas**: 95
  - **Fecha publicación**: 2011
  - **Resolución**: Nº 228/04 y Nº 235/05 del Consejo Federal de Cultura y Educación
  - **Grados**: 1º, 2º, 3º
  - **Áreas cubiertas** (8 áreas disciplinares):
    1. Matemática (pp. 15-22)
    2. Lengua (pp. 23-32)
    3. Ciencias Sociales (pp. 33-40)
    4. Ciencias Naturales (pp. 41-48)
    5. Educación Física (pp. 49-54)
    6. Educación Tecnológica (pp. 55-60)
    7. Formación Ética y Ciudadana (pp. 61-66)
    8. Educación Artística (pp. 67-91) - 4 sub-áreas
  - **Estructura del documento**:
    - Portada institucional (p. 1)
    - Autoridades nacionales y provinciales (pp. 2-3)
    - Índice (p. 4)
    - Presentación del Ministro (pp. 5-6)
    - Introducción (pp. 7-14)
    - NAP por área disciplinar (pp. 15-91)
    - Contraportada (pp. 92-95)
  - **Estructura por área**:
    - Cada área → organizada por AÑO (1°, 2°, 3°)
    - Cada año → organizada por EJES temáticos
    - Cada eje → lista de contenidos con viñetas
  - **Educación Artística - Estructura especial**:
    - 4 sub-áreas: Artes Visuales, Música, Teatro, Artes del Movimiento
    - Cada sub-área tiene 3 años
    - Cada año tiene 2-3 ejes consistentes:
      - En relación con los elementos del lenguaje [X]
      - En relación con la práctica del lenguaje [X]
      - En relación con la construcción de identidad y cultura
  - **Parseabilidad**: MUY ALTA
    - Estructura consistente y predecible
    - Títulos claramente marcados: "ÁREA / AÑO"
    - Ejes con formato "EN RELACIÓN CON..."
    - Contenidos en viñetas claras
  - **Notas importantes**:
    - Estructura DISCIPLINAR (muy diferente a Nivel Inicial)
    - Progresión clara por años (complejidad creciente)
    - Cada área tiene sus propios ejes temáticos
    - Ed. Artística requiere manejo especial (4 sub-áreas anidadas)
    - Formato ideal para extracción automatizada

- [x] `primaria/nap-primaria-2do-ciclo.pdf`
  - **Páginas**: 131 (dividido en 5 partes para análisis)
  - **Fecha publicación**: 2006 (1ª ed.), 2011 (4ª reimp.), 2013
  - **Resolución**: Nº 228/04 y Nº 235/05 del Consejo Federal de Cultura y Educación
  - **Grados**: 4º, 5º, 6º
  - **Áreas cubiertas** (8 áreas disciplinares + 4 sub-áreas):
    1. Matemática (pp. 15-26)
       - Ejes: Número y operaciones, Geometría y medida, Estadística y probabilidad
    2. Lengua (pp. 27-40)
       - Ejes: Comprensión y producción oral, Lectura y producción escrita, Reflexión sobre la lengua
    3. Ciencias Sociales (pp. 41-53)
       - Ejes: Las sociedades y los espacios geográficos, Las sociedades a través del tiempo, Las actividades humanas y la organización social
    4. Ciencias Naturales (pp. 54-66)
       - Ejes: Seres vivos (diversidad, unidad, interrelaciones, cambios), Los materiales y sus cambios, Los fenómenos del mundo físico, La Tierra, el universo y sus cambios
    5. Educación Física (pp. 67-74)
       - Ejes: En relación con las prácticas corporales, ludomotrices y deportivas referidas a la disponibilidad de sí mismo, En relación con las prácticas corporales, ludomotrices y deportivas en interacción con otros, En relación con las prácticas corporales en el ambiente natural y otros
       - Nota: Incluye aclaración sobre 7° año donde corresponda
    6. Educación Tecnológica (pp. 75-84)
       - Ejes: En relación con los procesos tecnológicos, En relación con los medios técnicos, En relación con la reflexión sobre la tecnología como proceso sociocultural
       - Nota: Incluye aclaración sobre 7° año donde corresponda
    7. Formación Ética y Ciudadana (pp. 85-96)
       - Ejes: En relación con la reflexión ética, En relación con la construcción histórica de las identidades, En relación con la ciudadanía, los derechos y la participación
       - Nota: Incluye lista de 19 pueblos originarios reconocidos
    8. Educación Artística (pp. 97-128) - 4 sub-áreas:
       - Artes Visuales (pp. 97-105)
         - Ejes: En relación con la práctica del lenguaje visual, En relación con la contextualización de la imagen visual
       - Danzas (pp. 106-112)
         - Ejes: En relación con la práctica de la danza, En relación con la contextualización sociocultural de la danza
       - Música (pp. 113-120)
         - Ejes: En relación con las prácticas del lenguaje musical, En relación con la contextualización
       - Teatro (pp. 121-128)
         - Ejes: En relación con los elementos y práctica del lenguaje teatral, En relación con la contextualización de las manifestaciones teatrales
  - **Estructura del documento**:
    - Portada institucional (p. 1)
    - Autoridades nacionales y provinciales (pp. 2-3)
    - Índice (p. 4)
    - Presentación del Ministro (pp. 5-6)
    - Introducción (pp. 7-14)
    - NAP por área disciplinar (pp. 15-128)
    - Información editorial (pp. 129-131)
  - **Estructura por área**:
    - Cada área → Propósitos generales del Segundo Ciclo
    - Cada área → organizada por AÑO (4°, 5°, 6°)
    - Cada año → organizada por EJES temáticos específicos del área
    - Cada eje → lista de contenidos con viñetas
  - **Parseabilidad**: MUY ALTA
    - Estructura IDÉNTICA a Primaria 1er Ciclo
    - Títulos claramente marcados: "ÁREA / AÑO"
    - Ejes con formato "EN RELACIÓN CON..."
    - Contenidos en viñetas claras
    - Progresión 4°→5°→6° similar a 1°→2°→3° del 1er ciclo
  - **Notas importantes**:
    - Estructura completamente consistente con Primaria 1er Ciclo
    - Mismo número de áreas (8) con mismas subdivisiones
    - Educación Artística mantiene las 4 sub-áreas
    - Ed. Física y Ed. Tecnológica incluyen notas sobre 7° año (jurisdicciones con primaria de 7 años)
    - FEyC incluye referencia a pueblos originarios reconocidos: Mapuche, Wichí, Toba (Qom), Diaguita-Calchaquí, Mocoví, Kolla, Guaraní, Huarpe, Comechingón, Tehuelche, Rankulche, Mbyá Guaraní, Pilagá, Chané, Chorote, Chulupí, Tapiete, Ava Guaraní, Atacama
    - El parser desarrollado para 1er Ciclo debería funcionar sin modificaciones

---

### Séptimo Año

- [x] `septimo/nap-septimo-anio.pdf`
  - **Páginas**: 94 (dividido en 4 partes para análisis)
  - **Fecha publicación**: Octubre 2011
  - **Resolución**: Resoluciones N° 37/07, 74/08 y 135/11 del Consejo Federal de Educación
  - **Grado**: 7° año (puede ser 7° Primaria o 1° Secundaria según jurisdicción)
  - **Áreas cubiertas** (8 áreas disciplinares + 4 sub-áreas):
    1. Matemática (pp. 15-24)
       - Ejes: Número y Operaciones, Álgebra y Funciones, Geometría y Medida, Probabilidad y Estadística
    2. Lengua (pp. 25-36)
       - Ejes: Comprensión y Producción Oral, Lectura y Producción Escrita, Literatura, Reflexión sobre la Lengua (sistema, norma y uso)
    3. Ciencias Sociales (pp. 37-46)
       - Ejes: Las Sociedades y los Espacios Geográficos, Las Sociedades a Través del Tiempo, Las Actividades Humanas y la Organización Social
    4. Ciencias Naturales (pp. 47-56)
       - Ejes: Seres Vivos (diversidad, unidad, interrelaciones, cambios), Los Materiales y sus Cambios, Los Fenómenos del Mundo Físico, La Tierra el Universo y sus Cambios
    5. Educación Física (pp. 57-62)
       - Ejes: Prácticas Corporales Ludomotrices referidas a la Disponibilidad de Sí Mismo, Prácticas Corporales Ludomotrices en Interacción con Otros, Prácticas Corporales en Ambiente Natural y Otros
    6. Educación Tecnológica (pp. 63-68)
       - Ejes: En relación con los Procesos Tecnológicos, En relación con los Medios Técnicos, En relación con la Reflexión sobre la Tecnología como Proceso Sociocultural
    7. Formación Ética y Ciudadana (pp. 69-71)
       - Ejes: En relación con la Reflexión Ética, En relación con la Construcción Histórica de las Identidades, En relación con la Ciudadanía los Derechos y la Participación
    8. Educación Artística (pp. 72-90) - 4 sub-áreas:
       - Propósitos generales del área (pp. 72-73)
       - Artes Visuales (pp. 74-78)
         - Ejes: En relación con la Práctica del Lenguaje Visual, En relación con la Contextualización de la Imagen Visual
       - Danzas (pp. 79-82)
         - Ejes: En relación con la Práctica de la Danza, En relación con la Contextualización Socio-Cultural
       - Música (pp. 83-87)
         - Ejes: En relación con las Prácticas del Lenguaje Musical, En relación con la Contextualización
       - Teatro (pp. 88-90)
         - Ejes: En relación con los Elementos y la Práctica del Lenguaje Teatral, En relación con la Contextualización de las Manifestaciones Teatrales en la Construcción de Identidad y Cultura
  - **Estructura del documento**:
    - Portada institucional (p. 1)
    - Autoridades nacionales y provinciales (pp. 2-4)
    - Índice (p. 5)
    - Presentación del Ministro (pp. 6-7)
    - Introducción y justificación del 7° año (pp. 8-14)
    - NAP por área disciplinar (pp. 15-90)
    - Página en blanco (p. 91)
    - Índice visual con íconos de áreas (p. 92)
    - Contraportada con logos oficiales (pp. 93-94)
  - **Estructura por área**:
    - Diferente a Primaria: NO hay división por múltiples años
    - Cada área → organizada directamente por EJES temáticos (un solo año: 7°)
    - Cada eje → lista de contenidos con viñetas
    - Similar a Primaria pero sin la dimensión temporal interna
  - **Parseabilidad**: MUY ALTA
    - Estructura consistente con Primaria pero simplificada (1 año vs 3)
    - Títulos claramente marcados: "ÁREA / SÉPTIMO AÑO"
    - Ejes con formato "EN RELACIÓN CON..."
    - Contenidos en viñetas claras
  - **Notas importantes**:
    - Documento de TRANSICIÓN entre Primaria y Secundaria
    - El 7° año puede ubicarse en Primaria O Secundaria según la jurisdicción
    - Las 8 áreas son IDÉNTICAS a Primaria (mismas áreas, mismos nombres)
    - Los ejes son muy similares a Primaria 2do Ciclo (evolución de los mismos)
    - Educación Artística mantiene las 4 sub-áreas de Primaria
    - Incluye propósitos generales para Ed. Artística (aplican a 4°, 5°, 6° y 7° años)
    - Las notas al pie aclaran la doble ubicación según jurisdicción
    - Matemática introduce "Álgebra y Funciones" como eje (no estaba en Primaria)
    - Lengua agrega "Literatura" como eje separado
    - El parser de Primaria necesita ajuste menor: estructura plana (sin años internos)

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

- **Primaria** (2/2 analizados - COMPLETADO):
  - Estructura DISCIPLINAR con 8 áreas claramente separadas
  - Cada área organizada por año (1°, 2°, 3° en 1er ciclo; 4°, 5°, 6° en 2do ciclo)
  - Cada año organizada por ejes temáticos propios del área
  - Contenidos en formato de lista con viñetas
  - Educación Artística es especial: tiene 4 sub-áreas
  - **Hallazgo clave**: Estructura IDÉNTICA entre 1er y 2do ciclo
  - Un único parser puede procesar ambos documentos
  - Ed. Física y Ed. Tecnológica incluyen notas sobre 7° año

- **Séptimo Año** (1/1 analizado - COMPLETADO):
  - Documento de TRANSICIÓN (puede ser 7° Primaria o 1° Secundaria según jurisdicción)
  - Mismas 8 áreas que Primaria (incluyendo 4 sub-áreas de Ed. Artística)
  - Estructura SIMPLIFICADA: sin división por múltiples años (solo 7°)
  - Organización: Área → Ejes → Contenidos (sin nivel "año" intermedio)
  - Ejes muy similares a Primaria 2do Ciclo con algunas evoluciones:
    - Matemática agrega "Álgebra y Funciones"
    - Lengua agrega "Literatura" como eje separado
  - **Hallazgo clave**: Puente estructural entre Primaria y Secundaria
  - Parser de Primaria adaptable con ajuste menor (eliminar dimensión "año")

### Estructura típica de los documentos

- **Nivel Inicial**:
  ```
  Portada → Autoridades → Índice → Presentación ministerial →
  Introducción → Características del nivel → Sentido de los NAP →
  NAP por eje temático → Cierre
  ```
- **Primaria 1er Ciclo**:
  ```
  Portada → Autoridades → Índice → Presentación ministerial →
  Introducción → [8 ÁREAS: cada una con 3 años, cada año con ejes] →
  Contraportada
  ```
- **Séptimo Año**:
  ```
  Portada → Autoridades → Índice → Presentación ministerial →
  Introducción (justificación 7° año) → [8 ÁREAS: cada una con ejes directos] →
  Índice visual → Contraportada
  ```

### Comparación de estructuras

| Aspecto            | Nivel Inicial            | Primaria (ambos ciclos) | Séptimo Año             |
| ------------------ | ------------------------ | ----------------------- | ----------------------- |
| Organización       | Holística (7 ejes)       | Disciplinar (8 áreas)   | Disciplinar (8 áreas)   |
| División temporal  | No aplica                | Por año (1°-3° y 4°-6°) | Un solo año (7°)        |
| Formato contenidos | Párrafos descriptivos    | Listas con viñetas      | Listas con viñetas      |
| Ed. Artística      | Integrada en "Expresión" | 4 sub-áreas separadas   | 4 sub-áreas separadas   |
| Parseabilidad      | Alta                     | Muy alta                | Muy alta                |
| Páginas            | 22                       | 95 (1er) + 131 (2do)    | 94                      |
| Jerarquía          | Eje → Contenidos         | Área → Año → Eje → Cont | Área → Eje → Contenidos |

### Estructura de Primaria - Áreas y Ejes

| Área                        | Ejes temáticos                                                                                               |
| --------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Matemática                  | Número y operaciones, Geometría y medida, Estadística y probabilidad                                         |
| Lengua                      | Comprensión y producción oral, Lectura y producción escrita, Reflexión sobre la lengua                       |
| Ciencias Sociales           | Sociedades y espacios geográficos, Sociedades a través del tiempo, Actividades humanas y organización social |
| Ciencias Naturales          | Seres vivos, Materiales y cambios, Fenómenos del mundo físico, La Tierra y el universo                       |
| Educación Física            | Disponibilidad de sí mismo, Interacción con otros, Ambiente natural                                          |
| Educación Tecnológica       | Procesos tecnológicos, Medios técnicos, Reflexión sobre tecnología                                           |
| Formación Ética y Ciudadana | Reflexión ética, Construcción de identidades, Ciudadanía y derechos                                          |
| **Educación Artística**     | (4 sub-áreas con ejes propios)                                                                               |
| → Artes Visuales            | Práctica del lenguaje visual, Contextualización                                                              |
| → Danzas                    | Práctica de la danza, Contextualización sociocultural                                                        |
| → Música                    | Prácticas del lenguaje musical, Contextualización                                                            |
| → Teatro                    | Elementos y práctica del lenguaje teatral, Contextualización                                                 |

### Estructura de Séptimo Año - Áreas y Ejes

| Área                        | Ejes temáticos                                                                                                 |
| --------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Matemática                  | Número y Operaciones, **Álgebra y Funciones** (nuevo), Geometría y Medida, Probabilidad y Estadística          |
| Lengua                      | Comprensión y Producción Oral, Lectura y Producción Escrita, **Literatura** (nuevo), Reflexión sobre la Lengua |
| Ciencias Sociales           | Sociedades y espacios geográficos, Sociedades a través del tiempo, Actividades humanas y organización social   |
| Ciencias Naturales          | Seres vivos, Materiales y cambios, Fenómenos del mundo físico, La Tierra y el universo                         |
| Educación Física            | Disponibilidad de sí mismo, Interacción con otros, Ambiente natural                                            |
| Educación Tecnológica       | Procesos tecnológicos, Medios técnicos, Reflexión sobre tecnología                                             |
| Formación Ética y Ciudadana | Reflexión ética, Construcción de identidades, Ciudadanía y derechos                                            |
| **Educación Artística**     | (4 sub-áreas con ejes propios)                                                                                 |
| → Artes Visuales            | Práctica del lenguaje visual, Contextualización de la imagen visual                                            |
| → Danzas                    | Práctica de la danza, Contextualización socio-cultural                                                         |
| → Música                    | Prácticas del lenguaje musical, Contextualización                                                              |
| → Teatro                    | Elementos y práctica del lenguaje teatral, Contextualización de manifestaciones teatrales                      |

**Notas**: En **negrita** los ejes nuevos que no existían en Primaria. Séptimo Año funciona como puente introduciendo conceptos que se desarrollarán en Secundaria.

### Recomendaciones para el parser

- El parser debe manejar estructuras diferentes según nivel educativo
- Nivel Inicial requiere extracción de párrafos descriptivos, no listas
- Primaria requiere extracción jerárquica: Área → Año → Eje → Contenidos
- Séptimo Año requiere extracción simplificada: Área → Eje → Contenidos (sin nivel "año")
- Considerar campo `estructura_tipo` para diferenciar (holístico vs disciplinar)
- Los 7 ejes de Inicial no mapean 1:1 con las 8 áreas de Primaria
- Educación Artística necesita nivel adicional de anidación (sub-áreas)
- Detectar títulos con patrón "ÁREA / AÑO" o "ÁREA / SÉPTIMO AÑO" para segmentación
- El parser de Primaria puede reutilizarse para Séptimo con flag `single_year=true`

---

## Próximos Pasos

1. [x] Analizar estructura de PDF representativo (Nivel Inicial completado)
2. [x] Analizar PDFs de Primaria para comparar estructura (1er Ciclo completado)
3. [x] Identificar patrones comunes entre niveles (tabla comparativa creada)
4. [x] Analizar PDF de Primaria 2do Ciclo para confirmar patrón ✅ **CONFIRMADO: estructura idéntica**
5. [x] Analizar PDF de Séptimo año ✅ **COMPLETADO: estructura similar a Primaria pero simplificada (1 año)**
6. [ ] Analizar PDFs de Secundaria Básico (8 documentos)
7. [ ] Analizar PDFs de Secundaria Orientado (7 documentos)
8. [ ] Analizar PDFs Transversales (2 documentos)
9. [ ] Definir formato JSON objetivo (considerando diferencias por nivel)
10. [ ] Desarrollar parser PDF → JSON
11. [ ] Procesar todos los documentos
12. [ ] Validar datos extraídos

---

## Referencias

- [README de NAP](./README.md) - Instrucciones de descarga
- [database.md](../technical/database.md) - Estructura curricular verificada
- Issue #21 - Feature original de integración NAP
- Issue #15 - Seed data (relacionado)
