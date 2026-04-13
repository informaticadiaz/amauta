# Investigación: IA Educativa Open Source para Escuelas Públicas

**Fecha**: Abril 2026
**Estado**: Investigación completada
**Próximo paso**: Prototipo en Fase 6+

---

## Resumen Ejecutivo

Este documento presenta los hallazgos de una investigación sobre la viabilidad de implementar un agente de IA educativo open source para escuelas públicas argentinas, integrado con la plataforma Amauta.

### Conclusión Principal

**Es viable implementar un tutor IA que funcione en hardware escolar típico (4-8GB RAM) usando modelos open source, con capacidad offline-first alineada a la filosofía de Amauta.**

### Stack Recomendado

| Componente      | Tecnología           | Justificación                        |
| --------------- | -------------------- | ------------------------------------ |
| **LLM**         | Qwen 2.5 1.5B/3B     | Mejor español, funciona en 4-8GB RAM |
| **Runtime**     | Ollama               | Fácil instalación, API REST          |
| **Orquestador** | LangGraph            | Flujos de tutoría con estados        |
| **RAG**         | LlamaIndex + LanceDB | Offline-first, TypeScript nativo     |
| **Embeddings**  | E5-base multilingual | Excelente español, 4GB RAM           |
| **Frontend**    | Vercel AI SDK        | Streaming, integra con Next.js       |

---

## 1. Modelos LLM para Hardware Limitado

### 1.1 Contexto de Hardware en Escuelas Públicas

- RAM: 4-8 GB típico
- CPU: Intel Core i3/i5 generaciones antiguas
- Sin GPU dedicada
- Conectividad intermitente

### 1.2 Modelos Evaluados

| Modelo            | Parámetros | RAM Mínima (Q4) | Velocidad CPU | Calidad Español |
| ----------------- | ---------- | --------------- | ------------- | --------------- |
| **Qwen 2.5 0.5B** | 0.5B       | ~1 GB           | 15-30 tok/s   | Buena           |
| **Qwen 2.5 1.5B** | 1.5B       | ~2 GB           | 10-20 tok/s   | Muy buena       |
| **Llama 3.2 1B**  | 1B         | ~1.5 GB         | 12-25 tok/s   | Buena           |
| **Llama 3.2 3B**  | 3B         | ~2.5 GB         | 6-12 tok/s    | Muy buena       |
| **Phi-3 Mini**    | 3.8B       | ~3 GB           | 5-10 tok/s    | Buena           |
| **Qwen 2.5 3B**   | 3B         | ~2.5 GB         | 6-12 tok/s    | Muy buena       |
| **Mistral 7B**    | 7B         | ~5 GB           | 3-6 tok/s     | Muy buena       |

### 1.3 Recomendación por Escenario

| Escenario        | Modelo               | Quantización |
| ---------------- | -------------------- | ------------ |
| PC 4GB RAM       | Qwen 2.5 1.5B        | Q4_K_M       |
| PC 8GB RAM       | Qwen 2.5 3B          | Q4_K_M       |
| Servidor escolar | Mistral 7B o Qwen 7B | Q4_K_M       |

### 1.4 Runtimes de Inferencia

**Ollama (Recomendado)**

- Instalación en un comando
- API REST simple
- Gestión automática de modelos
- Funciona en Windows, macOS, Linux

```bash
# Instalación
curl -fsSL https://ollama.com/install.sh | sh

# Uso
ollama run qwen2.5:1.5b
```

**llama.cpp (Máximo rendimiento)**

- Control total sobre optimizaciones
- Mejor rendimiento en CPU
- Requiere compilación

---

## 2. Frameworks de Agentes Educativos

### 2.1 Comparativa

| Framework               | Modelos Locales | RAG       | Offline | Curva Aprendizaje |
| ----------------------- | --------------- | --------- | ------- | ----------------- |
| **LangChain/LangGraph** | Excelente       | Excelente | Sí      | Media-Alta        |
| **LlamaIndex**          | Excelente       | Excelente | Sí      | Media             |
| **CrewAI**              | Bueno           | Bueno     | Sí      | Baja              |
| **AutoGen**             | Bueno           | Medio     | Sí      | Media             |
| **Vercel AI SDK**       | Limitado        | Básico    | No      | Baja              |
| **Haystack**            | Excelente       | Excelente | Sí      | Media             |

### 2.2 Recomendación

**LlamaIndex + LangGraph**

- **LlamaIndex**: Para RAG sobre contenido curricular (NAP, diseños, educ.ar)
- **LangGraph**: Para flujos de tutoría estructurados (presentación → práctica → evaluación)

### 2.3 Características para Educación

1. **Conversaciones multi-turno**: Memoria de sesión por estudiante
2. **Flujos estructurados**: Estados (explicar → ejemplificar → practicar)
3. **Herramientas**: Calculadora, graficador, buscador de definiciones
4. **Evaluación**: Análisis de respuestas del estudiante

---

## 3. RAG para Contenido Curricular Argentino

### 3.1 Vector Stores Evaluados

| Vector Store   | Licencia   | Offline | TypeScript        | RAM Mínima |
| -------------- | ---------- | ------- | ----------------- | ---------- |
| **LanceDB**    | Apache 2.0 | Sí      | Nativo            | 256MB      |
| **ChromaDB**   | Apache 2.0 | Sí      | No oficial        | 512MB      |
| **SQLite-vec** | MIT        | Sí      | Via mejor-sqlite3 | 128MB      |
| **FAISS**      | MIT        | Sí      | No                | 1GB+       |

**Recomendación: LanceDB**

- TypeScript nativo (integra con stack Amauta)
- Offline-first por diseño
- Bajo consumo de recursos
- Formato Lance eficiente

### 3.2 Modelos de Embeddings

| Modelo                    | Dimensiones | Tamaño | Calidad Español |
| ------------------------- | ----------- | ------ | --------------- |
| **multilingual-e5-base**  | 768         | 560MB  | Excelente       |
| **multilingual-e5-large** | 1024        | 2.2GB  | Superior        |
| **nomic-embed-text-v1.5** | 768         | 274MB  | Buena           |
| **bge-m3**                | 1024        | 2.3GB  | Superior        |

**Recomendación: E5-base multilingual**

- Balance rendimiento/recursos
- Funciona con 4GB RAM
- Optimizado para retrieval

### 3.3 Fuentes de Contenido Argentino

| Fuente                       | Descripción                         | Formato |
| ---------------------------- | ----------------------------------- | ------- |
| **NAP**                      | Núcleos de Aprendizaje Prioritarios | PDF     |
| **Diseños Jurisdiccionales** | Currículos por provincia            | PDF     |
| **educ.ar**                  | Portal educativo oficial            | HTML    |
| **Conectar Igualdad**        | Recursos del programa               | Varios  |

### 3.4 Estrategia de Chunking

Chunking jerárquico por estructura curricular:

```
Nivel 1: Área/Materia (documento completo)
  └── Nivel 2: Eje temático
        └── Nivel 3: Contenido específico
              └── Nivel 4: Indicadores de avance
```

Metadata por chunk:

- `nivelEducativo`: inicial, primario, secundario
- `area`: matemática, lengua, ciencias, etc.
- `jurisdiccion`: nacional, CABA, Buenos Aires, etc.
- `ejeTematico`: números y operaciones, geometría, etc.

---

## 4. Arquitectura Propuesta

### 4.1 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                      AMAUTA IA                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FRONTEND (Next.js PWA)                                        │
│  ├── Chat UI (Vercel AI SDK - streaming)                       │
│  ├── Panel docente                                             │
│  └── Modo offline (respuestas cacheadas)                       │
│                           │                                     │
│                           ▼                                     │
│  BACKEND (NestJS)                                              │
│  ├── POST /ia/chat        → Conversación con tutor             │
│  ├── POST /ia/explicar    → Explicar concepto                  │
│  ├── POST /ia/ejercicios  → Generar ejercicios                 │
│  └── GET  /ia/buscar      → Búsqueda RAG                       │
│                           │                                     │
│           ┌───────────────┼───────────────┐                    │
│           ▼               ▼               ▼                    │
│     ┌──────────┐   ┌──────────┐   ┌──────────┐                │
│     │ LangGraph│   │LlamaIndex│   │  Redis   │                │
│     │ (flujos) │   │  (RAG)   │   │(memoria) │                │
│     └────┬─────┘   └────┬─────┘   └──────────┘                │
│          │              │                                       │
│          └──────┬───────┘                                       │
│                 ▼                                               │
│  INFERENCIA                                                    │
│  ├── Ollama API                                                │
│  └── Qwen 2.5 (1.5B/3B/7B según hardware)                     │
│                                                                 │
│  DATOS                                                         │
│  ├── LanceDB (vectores)                                        │
│  ├── E5-base (embeddings)                                      │
│  └── Contenido indexado (NAP, diseños, educ.ar)               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Opciones de Despliegue

**Opción A: Servidor Escolar Central (Recomendada)**

```
PCs Escuela (navegador) ──LAN──► Servidor Escolar
                                  ├── Amauta (Docker)
                                  ├── Ollama + Qwen 7B
                                  └── LanceDB + NAP
```

Ventajas:

- Un solo punto de mantenimiento
- Modelo más grande (mejor calidad)
- Funciona sin internet externo

**Opción B: Híbrida con Fallback Local**

```
PC Estudiante              VPS Amauta
├── Ollama + Qwen 1.5B  ──────► (cuando hay internet)
├── LanceDB local
└── Funciona offline
```

Ventajas:

- Funciona 100% offline
- Sync cuando hay conexión

### 4.3 Estructura de Módulos

```
apps/api/src/ia/
├── ia.module.ts
├── ia.controller.ts
├── ia.service.ts
├── services/
│   ├── ollama.service.ts      # Cliente Ollama
│   ├── rag.service.ts         # LlamaIndex queries
│   ├── tutor.service.ts       # Flujos LangGraph
│   └── embedding.service.ts   # E5-base
├── dto/
│   ├── chat.dto.ts
│   └── ejercicio.dto.ts
└── types/
    └── chunk-metadata.ts
```

---

## 5. Casos de Uso Prioritarios

### 5.1 Tutor de Consultas

```
Estudiante: "No entiendo las fracciones equivalentes"
                        │
                        ▼
1. RAG busca en NAP Matemática → contexto curricular
2. LangGraph entra en flujo "explicar_concepto"
3. LLM genera explicación adaptada al nivel
4. Si no entiende → flujo "dar_ejemplo" → "práctica"
```

### 5.2 Generador de Ejercicios

```
Docente: "5 ejercicios de fracciones para 5to grado"
                        │
                        ▼
1. RAG obtiene indicadores de avance del nivel
2. LLM genera ejercicios alineados al currículo
3. Se guardan en el curso de Amauta
```

### 5.3 Corrector de Textos

```
Estudiante sube ensayo/tarea
            │
            ▼
1. LLM analiza ortografía, gramática, coherencia
2. Devuelve sugerencias constructivas (no corrige directo)
3. Explica errores de forma didáctica
```

---

## 6. Requisitos de Hardware

| Escenario         | RAM  | Almacenamiento | Modelo       | Velocidad   |
| ----------------- | ---- | -------------- | ------------ | ----------- |
| PC básica (4GB)   | 4GB  | 5GB            | Qwen 1.5B-Q4 | 10-15 tok/s |
| PC estándar (8GB) | 8GB  | 8GB            | Qwen 3B-Q4   | 6-10 tok/s  |
| Servidor escolar  | 16GB | 20GB           | Qwen 7B-Q4   | 5-8 tok/s   |
| VPS Amauta actual | 4GB  | 10GB           | Qwen 1.5B-Q4 | 10-15 tok/s |

---

## 7. Roadmap de Implementación

### Fase A: Prototipo (4 semanas)

- Semana 1-2: Integrar Ollama + Qwen en NestJS
- Semana 3: Endpoint /ia/chat básico
- Semana 4: UI de chat en frontend

### Fase B: RAG (4 semanas)

- Semana 1-2: Pipeline de ingesta NAP
- Semana 3: LanceDB + embeddings
- Semana 4: Búsqueda semántica integrada

### Fase C: Tutoría (4 semanas)

- Semana 1-2: Flujos LangGraph
- Semana 3: Memoria de sesión
- Semana 4: Casos de uso específicos

### Fase D: Producción (2 semanas)

- Moderación de contenido
- Límites de uso
- Documentación

---

## 8. Consideraciones Adicionales

### 8.1 Privacidad y Seguridad

- **Datos de menores**: Nunca salen de la escuela/servidor local
- **Sin telemetría**: Modelos locales, sin envío a terceros
- **Anonimización**: Conversaciones no identificables

### 8.2 Moderación de Contenido

- Filtro de respuestas inapropiadas
- Límites de tokens por sesión
- Logging para auditoría (sin PII)

### 8.3 Aspectos Legales

- **NAP**: Documentos públicos, uso libre
- **educ.ar**: Generalmente CC BY-NC-SA
- **Libros de texto**: Solo material con licencia abierta

### 8.4 Escalabilidad

- Fase inicial: VPS actual de Amauta
- Crecimiento: Servidor por escuela/distrito
- Largo plazo: Federación de servidores

---

## 9. Referencias

### Documentación Técnica

- Ollama: https://ollama.com/
- LanceDB: https://lancedb.github.io/lancedb/
- LangGraph: https://langchain-ai.github.io/langgraph/
- LlamaIndex: https://docs.llamaindex.ai/
- Sentence Transformers: https://www.sbert.net/

### Contenido Educativo Argentino

- NAP: https://www.argentina.gob.ar/educacion/validez-titulos/glosario/nap
- educ.ar: https://www.educ.ar/recursos
- Conectar Igualdad: https://conectarigualdad.edu.ar/

### Modelos

- Qwen 2.5: https://huggingface.co/Qwen
- E5 Embeddings: https://huggingface.co/intfloat/multilingual-e5-base

---

## 10. Próximos Pasos

1. **Crear issue** para Fase 6+ con especificación técnica
2. **Prototipo mínimo**: Endpoint /ia/chat + Ollama + Qwen 1.5B
3. **Validación**: Probar con docentes y estudiantes reales
4. **Iteración**: Ajustar según feedback

---

_Documento generado como parte de la investigación de IA educativa para el proyecto Amauta._
