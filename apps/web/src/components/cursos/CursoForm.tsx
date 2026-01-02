'use client';

/**
 * Componente CursoForm
 *
 * Formulario reutilizable para crear y editar cursos
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImageUploader } from './ImageUploader';
import styles from './CursoForm.module.css';

interface Categoria {
  id: string;
  nombre: string;
  slug: string;
}

interface Curso {
  id: string;
  titulo: string;
  descripcion: string;
  categoriaId: string;
  nivel: 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';
  imagen: string | null;
  duracion: number | null;
  idioma: string;
  estado: 'BORRADOR' | 'REVISION' | 'PUBLICADO' | 'ARCHIVADO';
}

interface CursoFormProps {
  curso?: Curso;
  categorias: Categoria[];
  onSuccess?: () => void;
}

const NIVELES = [
  { value: 'PRINCIPIANTE', label: 'Principiante' },
  { value: 'INTERMEDIO', label: 'Intermedio' },
  { value: 'AVANZADO', label: 'Avanzado' },
];

const MAX_TITULO = 200;
const MAX_DESCRIPCION = 5000;

export function CursoForm({ curso, categorias, onSuccess }: CursoFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imagenUrl, setImagenUrl] = useState<string | null>(
    curso?.imagen || null
  );
  const [titulo, setTitulo] = useState(curso?.titulo || '');
  const [descripcion, setDescripcion] = useState(curso?.descripcion || '');

  const isEditing = !!curso;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const data = {
      titulo: formData.get('titulo') as string,
      descripcion: formData.get('descripcion') as string,
      categoriaId: formData.get('categoriaId') as string,
      nivel: formData.get('nivel') as string,
      imagen: imagenUrl,
      duracion: formData.get('duracion')
        ? parseInt(formData.get('duracion') as string, 10)
        : null,
      idioma: (formData.get('idioma') as string) || 'es',
    };

    // Validación básica
    if (!data.titulo || data.titulo.length < 3) {
      setError('El título debe tener al menos 3 caracteres');
      setLoading(false);
      return;
    }

    if (!data.descripcion || data.descripcion.length < 10) {
      setError('La descripción debe tener al menos 10 caracteres');
      setLoading(false);
      return;
    }

    if (!data.categoriaId) {
      setError('Selecciona una categoría');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isEditing ? `/cursos/${curso.id}` : '/cursos';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1${endpoint}`,
        {
          method,
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al guardar el curso');
      }

      onSuccess?.();
      router.push('/dashboard/cursos');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    router.push('/dashboard/cursos');
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.field}>
        <label htmlFor="titulo" className={styles.label}>
          Título<span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          id="titulo"
          name="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          maxLength={MAX_TITULO}
          required
          disabled={loading}
          placeholder="Ej: Introducción a la programación"
          className={styles.input}
        />
        <div
          className={`${styles.charCount} ${
            titulo.length > MAX_TITULO * 0.9
              ? titulo.length >= MAX_TITULO
                ? styles.charCountError
                : styles.charCountWarning
              : ''
          }`}
        >
          {titulo.length}/{MAX_TITULO}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="descripcion" className={styles.label}>
          Descripción<span className={styles.required}>*</span>
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          maxLength={MAX_DESCRIPCION}
          required
          disabled={loading}
          placeholder="Describe el contenido del curso, qué aprenderán los estudiantes..."
          className={styles.textarea}
        />
        <div
          className={`${styles.charCount} ${
            descripcion.length > MAX_DESCRIPCION * 0.9
              ? descripcion.length >= MAX_DESCRIPCION
                ? styles.charCountError
                : styles.charCountWarning
              : ''
          }`}
        >
          {descripcion.length}/{MAX_DESCRIPCION}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="categoriaId" className={styles.label}>
            Categoría<span className={styles.required}>*</span>
          </label>
          <select
            id="categoriaId"
            name="categoriaId"
            defaultValue={curso?.categoriaId || ''}
            required
            disabled={loading}
            className={styles.select}
          >
            <option value="">Selecciona una categoría</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="nivel" className={styles.label}>
            Nivel<span className={styles.required}>*</span>
          </label>
          <select
            id="nivel"
            name="nivel"
            defaultValue={curso?.nivel || 'PRINCIPIANTE'}
            required
            disabled={loading}
            className={styles.select}
          >
            {NIVELES.map((nivel) => (
              <option key={nivel.value} value={nivel.value}>
                {nivel.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="duracion" className={styles.label}>
            Duración estimada (minutos)
          </label>
          <input
            type="number"
            id="duracion"
            name="duracion"
            defaultValue={curso?.duracion || ''}
            min={1}
            disabled={loading}
            placeholder="Ej: 120"
            className={styles.input}
          />
          <p className={styles.hint}>
            Tiempo aproximado para completar el curso
          </p>
        </div>

        <div className={styles.field}>
          <label htmlFor="idioma" className={styles.label}>
            Idioma
          </label>
          <input
            type="text"
            id="idioma"
            name="idioma"
            defaultValue={curso?.idioma || 'es'}
            maxLength={2}
            disabled={loading}
            placeholder="es"
            className={styles.input}
          />
          <p className={styles.hint}>Código de 2 letras (es, en, pt...)</p>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Imagen de portada</label>
        <ImageUploader
          value={imagenUrl}
          onChange={setImagenUrl}
          disabled={loading}
        />
        <p className={styles.hint}>
          La imagen se mostrará en el catálogo y la página del curso
        </p>
      </div>

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
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Guardando...
            </>
          ) : isEditing ? (
            'Guardar cambios'
          ) : (
            'Crear curso'
          )}
        </button>
      </div>
    </form>
  );
}
