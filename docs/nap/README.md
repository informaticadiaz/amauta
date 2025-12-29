# Núcleos de Aprendizajes Prioritarios (NAP)

> **Fuente**: [Educ.ar](https://www.educ.ar/recursos/150199/) y [Argentina.gob.ar](https://www.argentina.gob.ar/educacion/nucleos-de-aprendizaje-prioritarios)
> **Licencia**: Creative Commons BY-NC-SA
> **Nota**: Los PDFs no están en el repo. Ver [Instrucciones de descarga](#instrucciones-de-descarga) abajo.

## ¿Qué son los NAP?

Los Núcleos de Aprendizajes Prioritarios son los contenidos mínimos obligatorios que todos los estudiantes argentinos deben aprender, establecidos por el Consejo Federal de Educación. Constituyen una base común para la enseñanza en todo el país.

## Estructura de Carpetas

```
docs/nap/
├── README.md                    # Este archivo
├── ANALISIS.md                  # Tracking del análisis de PDFs (Issue #22)
├── inicial/                     # Educación Inicial (1 documento)
├── primaria/                    # Primaria 1er y 2do Ciclo (2 documentos)
├── septimo/                     # Séptimo Año / transición (1 documento)
├── secundaria-basico/           # Secundaria Ciclo Básico (8 documentos)
├── secundaria-orientado/        # Secundaria Ciclo Orientado (7 documentos)
└── transversales/               # Lenguas Extranjeras y Ed. Digital (2 documentos)
```

## Documentos Disponibles (21 PDFs)

### Educación Inicial (1)

| Archivo                     | Contenido                          |
| --------------------------- | ---------------------------------- |
| `nap-educacion-inicial.pdf` | Todas las áreas para Nivel Inicial |

### Educación Primaria (2)

| Archivo                      | Contenido                  |
| ---------------------------- | -------------------------- |
| `nap-primaria-1er-ciclo.pdf` | 8 áreas - 1º, 2º, 3º grado |
| `nap-primaria-2do-ciclo.pdf` | 8 áreas - 4º, 5º, 6º grado |

### Séptimo Año (1)

| Archivo                | Contenido                              |
| ---------------------- | -------------------------------------- |
| `nap-septimo-anio.pdf` | Transición 7º Primaria / 1º Secundaria |

### Secundaria Ciclo Básico (8)

| Archivo                         | Área                        |
| ------------------------------- | --------------------------- |
| `nap-matematica.pdf`            | Matemática                  |
| `nap-lengua.pdf`                | Lengua                      |
| `nap-ciencias-naturales.pdf`    | Ciencias Naturales          |
| `nap-ciencias-sociales.pdf`     | Ciencias Sociales           |
| `nap-formacion-etica.pdf`       | Formación Ética y Ciudadana |
| `nap-educacion-artistica.pdf`   | Educación Artística         |
| `nap-educacion-fisica.pdf`      | Educación Física            |
| `nap-educacion-tecnologica.pdf` | Educación Tecnológica       |

### Secundaria Ciclo Orientado (7)

| Archivo                       | Área                                    |
| ----------------------------- | --------------------------------------- |
| `nap-matematica.pdf`          | Matemática                              |
| `nap-lengua-literatura.pdf`   | Lengua y Literatura                     |
| `nap-ciencias-naturales.pdf`  | Ciencias Naturales                      |
| `nap-ciencias-sociales.pdf`   | Ciencias Sociales                       |
| `nap-filosofia-etica.pdf`     | Filosofía y Formación Ética y Ciudadana |
| `nap-educacion-fisica.pdf`    | Educación Física                        |
| `nap-educacion-artistica.pdf` | Educación Artística                     |

### Transversales (2)

| Archivo                       | Contenido                                                                  |
| ----------------------------- | -------------------------------------------------------------------------- |
| `nap-lenguas-extranjeras.pdf` | Primaria y Secundaria                                                      |
| `nap-educacion-digital.pdf`   | Educación Digital, Programación y Robótica (Inicial, Primaria, Secundaria) |

## Áreas Curriculares Cubiertas (10)

1. **Matemática**
2. **Lengua y Literatura**
3. **Ciencias Naturales** (Biología, Física, Química)
4. **Ciencias Sociales** (Historia, Geografía, Economía)
5. **Formación Ética y Ciudadana** / Filosofía
6. **Educación Artística** (Artes Visuales, Música, Danza, Teatro)
7. **Educación Física**
8. **Educación Tecnológica**
9. **Lenguas Extranjeras**
10. **Educación Digital, Programación y Robótica**

## Niveles Educativos

| Nivel                      | Código                 | Años/Grados       |
| -------------------------- | ---------------------- | ----------------- |
| Educación Inicial          | `INICIAL`              | Sala de 4 y 5     |
| Primaria 1er Ciclo         | `PRIMARIA_1`           | 1º, 2º, 3º grado  |
| Primaria 2do Ciclo         | `PRIMARIA_2`           | 4º, 5º, 6º grado  |
| Séptimo Año                | `SEPTIMO`              | 7º grado / 1º año |
| Secundaria Ciclo Básico    | `SECUNDARIA_BASICO`    | 1º, 2º, 3º año    |
| Secundaria Ciclo Orientado | `SECUNDARIA_ORIENTADO` | 4º, 5º, 6º año    |

## Uso en Amauta

Estos documentos sirven como fuente para:

1. **Categorías**: Las 10 áreas curriculares como categorías de cursos
2. **Contenidos**: Extracción de contenidos prioritarios para lecciones
3. **Niveles**: Organización de cursos por nivel educativo
4. **Validación**: Alineación con currícula oficial argentina

## Estado del Análisis

> **Issue relacionado**: [#22](https://github.com/informaticadiaz/amauta/issues/22)
> **Documento de tracking**: [ANALISIS.md](./ANALISIS.md)

### Progreso: 2/21 PDFs analizados (9.5%)

| Nivel                | Analizados | Total | Estado         |
| -------------------- | ---------- | ----- | -------------- |
| Inicial              | 1/1        | 1     | ✅ Completo    |
| Primaria             | 1/2        | 2     | 🔄 En progreso |
| Séptimo              | 0/1        | 1     | ⬜ Pendiente   |
| Secundaria Básico    | 0/8        | 8     | ⬜ Pendiente   |
| Secundaria Orientado | 0/7        | 7     | ⬜ Pendiente   |
| Transversales        | 0/2        | 2     | ⬜ Pendiente   |

### Hallazgos Clave

Se identificaron **2 tipos de estructura** en los documentos NAP:

| Tipo            | Niveles   | Organización          | Parseabilidad |
| --------------- | --------- | --------------------- | ------------- |
| **Holística**   | Inicial   | 7 ejes de experiencia | Alta          |
| **Disciplinar** | Primaria+ | 8 áreas × años × ejes | Muy alta      |

Ver detalles completos en [ANALISIS.md](./ANALISIS.md).

## Próximos Pasos

- [x] Analizar estructura de PDFs (Inicial y Primaria 1er Ciclo completados)
- [x] Identificar patrones comunes entre niveles
- [ ] Completar análisis de Primaria 2do Ciclo
- [ ] Definir formato JSON objetivo
- [ ] Desarrollar parser PDF → JSON
- [ ] Procesar los 21 documentos
- [ ] Generar seed data alineado con NAP

## Instrucciones de Descarga

Los PDFs no están incluidos en el repositorio por su tamaño (28MB). Para descargarlos, ejecutar:

```bash
# Desde la raíz del proyecto
cd docs/nap

# Crear carpetas
mkdir -p inicial primaria septimo secundaria-basico secundaria-orientado transversales

# === INICIAL Y PRIMARIA ===
curl -L -o inicial/nap-educacion-inicial.pdf "http://www.bnm.me.gov.ar/giga1/documentos/EL000978.pdf"
curl -L -o primaria/nap-primaria-1er-ciclo.pdf "https://backend.educ.ar/refactor_resource/get-attachment/22399"
curl -L -o primaria/nap-primaria-2do-ciclo.pdf "https://backend.educ.ar/refactor_resource/get-attachment/22424"
curl -L -o septimo/nap-septimo-anio.pdf "http://www.bnm.me.gov.ar/giga1/documentos/EL007881.pdf"

# === SECUNDARIA CICLO BÁSICO ===
curl -L -o secundaria-basico/nap-lengua.pdf "https://backend.educ.ar/refactor_resource/get-attachment/22984"
curl -L -o secundaria-basico/nap-matematica.pdf "https://backend.educ.ar/refactor_resource/get-attachment/22985"
curl -L -o secundaria-basico/nap-ciencias-naturales.pdf "https://backend.educ.ar/refactor_resource/get-attachment/22986"
curl -L -o secundaria-basico/nap-ciencias-sociales.pdf "https://backend.educ.ar/refactor_resource/get-attachment/47880"
curl -L -o secundaria-basico/nap-educacion-artistica.pdf "https://backend.educ.ar/refactor_resource/get-attachment/22988"
curl -L -o secundaria-basico/nap-educacion-fisica.pdf "https://backend.educ.ar/refactor_resource/get-attachment/22989"
curl -L -o secundaria-basico/nap-educacion-tecnologica.pdf "https://backend.educ.ar/refactor_resource/get-attachment/22990"
curl -L -o secundaria-basico/nap-formacion-etica.pdf "https://backend.educ.ar/refactor_resource/get-attachment/22991"

# === SECUNDARIA CICLO ORIENTADO ===
curl -L -o secundaria-orientado/nap-matematica.pdf "https://backend.educ.ar/refactor_resource/get-attachment/22425"
curl -L -o secundaria-orientado/nap-lengua-literatura.pdf "https://backend.educ.ar/refactor_resource/get-attachment/22443"
curl -L -o secundaria-orientado/nap-ciencias-naturales.pdf "https://backend.educ.ar/refactor_resource/get-attachment/22441"
curl -L -o secundaria-orientado/nap-ciencias-sociales.pdf "https://backend.educ.ar/refactor_resource/get-attachment/22472"
curl -L -o secundaria-orientado/nap-educacion-fisica.pdf "https://backend.educ.ar/refactor_resource/get-attachment/22426"
curl -L -o secundaria-orientado/nap-filosofia-etica.pdf "https://backend.educ.ar/refactor_resource/get-attachment/22401"
curl -L -o secundaria-orientado/nap-educacion-artistica.pdf "https://backend.educ.ar/refactor_resource/get-attachment/22427"

# === TRANSVERSALES ===
curl -L -o transversales/nap-lenguas-extranjeras.pdf "https://backend.educ.ar/refactor_resource/get-attachment/22400"
curl -L -o transversales/nap-educacion-digital.pdf "https://backend.educ.ar/refactor_resource/get-attachment/162"

echo "✅ 21 PDFs descargados (28MB total)"
```

### Verificar descarga

```bash
# Verificar que son PDFs válidos
find . -name "*.pdf" -exec file {} \; | grep -c "PDF"
# Debe mostrar: 21
```

## Referencias

- [Colección NAP - Educ.ar](https://www.educ.ar/recursos/150199/)
- [NAP - Argentina.gob.ar](https://www.argentina.gob.ar/educacion/nucleos-de-aprendizaje-prioritarios)
- [Biblioteca Nacional del Maestro](http://www.bnm.me.gov.ar)
