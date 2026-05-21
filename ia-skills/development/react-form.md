# Skill: React Form

> Crea un formulario React siguiendo los patrones del proyecto.

---

## Uso

```
Crea un formulario para [modelo] con los campos: [lista de campos]
```

**Ejemplo:**

```
Crea un formulario para Recurso con los campos:
- nombre: text, requerido
- tipo: select (VIDEO, PDF, IMAGEN, AUDIO)
- url: text, requerido
- tamano: number, opcional
```

---

## Parámetros

| Parámetro      | Descripción               | Ejemplo                |
| -------------- | ------------------------- | ---------------------- |
| `modelo`       | Nombre del modelo         | `Recurso`              |
| `campos`       | Lista de campos con tipos | Ver ejemplo            |
| `endpoint`     | Ruta de la API            | `/api/recursos`        |
| `redirectTo`   | Ruta después de guardar   | `/dashboard/recursos`  |
| `relacionados` | Datos para selects        | `categorias`, `cursos` |

---

## Archivos Generados

```
apps/web/src/components/{modelo}/
├── {Modelo}Form.tsx
└── {Modelo}Form.module.css
```

---

## Template Principal

```typescript
// apps/web/src/components/{modelo}/{Modelo}Form.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './{Modelo}Form.module.css';

interface {Modelo} {
  id: string;
  nombre: string;
  tipo: 'OPCION1' | 'OPCION2' | 'OPCION3';
  // ... otros campos
}

interface {Modelo}FormProps {
  {modelo}?: {Modelo};              // undefined = crear, definido = editar
  relacionados?: Relacionado[];     // datos para selects
  onSuccess?: () => void;
}

const TIPOS = [
  { value: 'OPCION1', label: 'Opción 1' },
  { value: 'OPCION2', label: 'Opción 2' },
  { value: 'OPCION3', label: 'Opción 3' },
];

const MAX_NOMBRE = 100;

export function {Modelo}Form({ {modelo}, relacionados, onSuccess }: {Modelo}FormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Campos controlados (para contadores de caracteres, etc.)
  const [nombre, setNombre] = useState({modelo}?.nombre || '');

  const isEditing = !!{modelo};

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const data = {
      nombre: formData.get('nombre') as string,
      tipo: formData.get('tipo') as string,
      // Campos numéricos
      cantidad: formData.get('cantidad')
        ? parseInt(formData.get('cantidad') as string, 10)
        : null,
      // Campos opcionales string
      descripcion: (formData.get('descripcion') as string) || null,
    };

    // Validación básica
    if (!data.nombre || data.nombre.length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isEditing
        ? `/api/{modelos}/${{{modelo}}.id}`
        : '/api/{modelos}';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al guardar');
      }

      onSuccess?.();
      router.push('/dashboard/{modelos}');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    router.push('/dashboard/{modelos}');
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      {/* Campo texto con contador */}
      <div className={styles.field}>
        <label htmlFor="nombre" className={styles.label}>
          Nombre<span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          maxLength={MAX_NOMBRE}
          required
          disabled={loading}
          placeholder="Ingresa el nombre"
          className={styles.input}
        />
        <div className={styles.charCount}>
          {nombre.length}/{MAX_NOMBRE}
        </div>
      </div>

      {/* Campo select */}
      <div className={styles.field}>
        <label htmlFor="tipo" className={styles.label}>
          Tipo<span className={styles.required}>*</span>
        </label>
        <select
          id="tipo"
          name="tipo"
          defaultValue={{modelo}?.tipo || ''}
          required
          disabled={loading}
          className={styles.select}
        >
          <option value="">Selecciona un tipo</option>
          {TIPOS.map((tipo) => (
            <option key={tipo.value} value={tipo.value}>
              {tipo.label}
            </option>
          ))}
        </select>
      </div>

      {/* Campo select con datos externos */}
      {relacionados && (
        <div className={styles.field}>
          <label htmlFor="relacionadoId" className={styles.label}>
            Relacionado<span className={styles.required}>*</span>
          </label>
          <select
            id="relacionadoId"
            name="relacionadoId"
            defaultValue={{modelo}?.relacionadoId || ''}
            required
            disabled={loading}
            className={styles.select}
          >
            <option value="">Selecciona...</option>
            {relacionados.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Campo numérico */}
      <div className={styles.field}>
        <label htmlFor="cantidad" className={styles.label}>
          Cantidad
        </label>
        <input
          type="number"
          id="cantidad"
          name="cantidad"
          defaultValue={{modelo}?.cantidad || ''}
          min={1}
          disabled={loading}
          placeholder="Ej: 10"
          className={styles.input}
        />
        <p className={styles.hint}>Descripción del campo</p>
      </div>

      {/* Textarea */}
      <div className={styles.field}>
        <label htmlFor="descripcion" className={styles.label}>
          Descripción
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          defaultValue={{modelo}?.descripcion || ''}
          maxLength={500}
          disabled={loading}
          placeholder="Descripción opcional..."
          className={styles.textarea}
        />
      </div>

      {/* Acciones */}
      <div className={styles.actions}>
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className={`${styles.button} ${styles.buttonSecondary}`}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`${styles.button} ${styles.buttonPrimary}`}
        >
          {loading ? (
            <>
              <span className={styles.spinner} />
              Guardando...
            </>
          ) : isEditing ? (
            'Guardar cambios'
          ) : (
            'Crear'
          )}
        </button>
      </div>
    </form>
  );
}
```

---

## Template CSS Module

```css
/* apps/web/src/components/{modelo}/{Modelo}Form.module.css */

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  font-weight: 500;
  color: var(--color-text-primary);
}

.required {
  color: var(--color-error);
  margin-left: 0.25rem;
}

.input,
.select,
.textarea {
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  font-size: 1rem;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.input:focus,
.select:focus,
.textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.input:disabled,
.select:disabled,
.textarea:disabled {
  background: var(--color-bg-secondary);
  cursor: not-allowed;
}

.textarea {
  min-height: 120px;
  resize: vertical;
}

.hint {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.charCount {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-align: right;
}

.charCountWarning {
  color: var(--color-warning);
}

.charCountError {
  color: var(--color-error);
}

.row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

@media (max-width: 640px) {
  .row {
    grid-template-columns: 1fr;
  }
}

.error {
  padding: 1rem;
  background: var(--color-error-bg);
  border: 1px solid var(--color-error);
  border-radius: 0.5rem;
  color: var(--color-error);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.buttonPrimary {
  background: var(--color-primary);
  color: white;
  border: none;
}

.buttonPrimary:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.buttonSecondary {
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.buttonSecondary:hover:not(:disabled) {
  background: var(--color-bg-secondary);
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

---

## Tipos de Campos

### Texto Simple

```tsx
<input
  type="text"
  name="nombre"
  defaultValue={item?.nombre || ''}
  required
  disabled={loading}
/>
```

### Texto Controlado (con contador)

```tsx
const [nombre, setNombre] = useState(item?.nombre || '');

<input
  type="text"
  name="nombre"
  value={nombre}
  onChange={(e) => setNombre(e.target.value)}
  maxLength={100}
/>
<div>{nombre.length}/100</div>
```

### Select con Opciones Estáticas

```tsx
const OPCIONES = [
  { value: 'A', label: 'Opción A' },
  { value: 'B', label: 'Opción B' },
];

<select name="tipo" defaultValue={item?.tipo || ''}>
  <option value="">Selecciona...</option>
  {OPCIONES.map((opt) => (
    <option key={opt.value} value={opt.value}>
      {opt.label}
    </option>
  ))}
</select>;
```

### Select con Datos Dinámicos

```tsx
interface Props {
  categorias: { id: string; nombre: string }[];
}

<select name="categoriaId" defaultValue={item?.categoriaId || ''}>
  <option value="">Selecciona...</option>
  {categorias.map((cat) => (
    <option key={cat.id} value={cat.id}>
      {cat.nombre}
    </option>
  ))}
</select>;
```

### Número

```tsx
<input
  type="number"
  name="cantidad"
  defaultValue={item?.cantidad || ''}
  min={1}
  max={100}
/>

// En handleSubmit
cantidad: formData.get('cantidad')
  ? parseInt(formData.get('cantidad') as string, 10)
  : null,
```

### Checkbox

```tsx
<label className={styles.checkbox}>
  <input
    type="checkbox"
    name="activo"
    defaultChecked={item?.activo ?? true}
    disabled={loading}
  />
  <span>Activo</span>
</label>

// En handleSubmit
activo: formData.get('activo') === 'on',
```

### Textarea

```tsx
<textarea
  name="descripcion"
  defaultValue={item?.descripcion || ''}
  maxLength={5000}
  rows={5}
/>
```

### Upload de Imagen

```tsx
import { ImageUploader } from '@/components/common/ImageUploader';

const [imagenUrl, setImagenUrl] = useState(item?.imagen || null);

<ImageUploader
  value={imagenUrl}
  onChange={setImagenUrl}
  disabled={loading}
/>

// En data object
imagen: imagenUrl,
```

---

## Checklist

- [ ] Crear componente Form
- [ ] Crear CSS Module
- [ ] Crear página de creación que use el form
- [ ] Crear página de edición que use el form
- [ ] Crear API routes si no existen
- [ ] Probar validaciones
- [ ] Probar modo crear y editar
