'use client';

/**
 * Componente EvaluacionForm
 *
 * Formulario para crear evaluaciones básicas
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './EvaluacionForm.module.css';

interface CursoItem {
  id: string;
  titulo: string;
}

interface EvaluacionFormProps {
  cursos: CursoItem[];
  onSuccess?: () => void;
}

const MAX_TITULO = 200;
const MAX_DESCRIPCION = 5000;

export function EvaluacionForm({ cursos, onSuccess }: EvaluacionFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cursoId, setCursoId] = useState('');
  const [puntajeMinimo, setPuntajeMinimo] = useState('');
  const [intentosMaximos, setIntentosMaximos] = useState('');
  const [tiempoLimiteMin, setTiempoLimiteMin] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const tituloLimpio = titulo.trim();
    const descripcionLimpia = descripcion.trim();

    if (!tituloLimpio || tituloLimpio.length < 3) {
      setError('El título debe tener al menos 3 caracteres');
      return;
    }

    if (!cursoId) {
      setError('Selecciona un curso');
      return;
    }

    const tiempoValue = tiempoLimiteMin ? Number(tiempoLimiteMin) : null;
    if (tiempoValue !== null) {
      if (!Number.isInteger(tiempoValue) || tiempoValue <= 0) {
        setError('El tiempo límite debe ser un número entero positivo');
        return;
      }
    }

    const intentosValue = intentosMaximos ? Number(intentosMaximos) : null;
    if (intentosValue !== null) {
      if (!Number.isInteger(intentosValue) || intentosValue <= 0) {
        setError('Los intentos máximos deben ser un número entero positivo');
        return;
      }
    }

    const puntajeValue = puntajeMinimo ? Number(puntajeMinimo) : null;
    if (puntajeValue !== null && puntajeValue < 0) {
      setError('El puntaje mínimo no puede ser negativo');
      return;
    }

    const payload: Record<string, unknown> = {
      titulo: tituloLimpio,
      descripcion: descripcionLimpia ? descripcionLimpia : null,
      cursoId,
    };

    if (tiempoValue !== null) {
      payload.tiempoLimiteMin = tiempoValue;
    }
    if (puntajeValue !== null) {
      payload.puntajeMinimo = puntajeValue;
    }
    if (intentosValue !== null) {
      payload.intentosMaximos = intentosValue;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/evaluaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al crear la evaluación');
      }

      setSuccess('Evaluación creada correctamente');
      onSuccess?.();
      router.push('/dashboard/evaluaciones?creada=1');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    router.push('/dashboard/evaluaciones');
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      <div className={styles.field}>
        <label htmlFor="titulo" className={styles.label}>
          Título<span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          id="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          maxLength={MAX_TITULO}
          required
          disabled={loading}
          placeholder="Ej: Evaluación Unidad 1"
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
          Descripción
        </label>
        <textarea
          id="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          maxLength={MAX_DESCRIPCION}
          disabled={loading}
          placeholder="Breve descripción de la evaluación (opcional)"
          className={styles.textarea}
          style={{ minHeight: '120px' }}
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

      <div className={styles.field}>
        <label htmlFor="curso" className={styles.label}>
          Curso<span className={styles.required}>*</span>
        </label>
        <select
          id="curso"
          value={cursoId}
          onChange={(e) => setCursoId(e.target.value)}
          required
          disabled={loading}
          className={styles.select}
        >
          <option value="">Selecciona un curso</option>
          {cursos.map((curso) => (
            <option key={curso.id} value={curso.id}>
              {curso.titulo}
            </option>
          ))}
        </select>
        {cursos.length === 0 && (
          <p className={styles.hint}>
            Aún no tenés cursos disponibles para asociar
          </p>
        )}
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="puntajeMinimo" className={styles.label}>
            Puntaje mínimo
          </label>
          <input
            type="number"
            id="puntajeMinimo"
            value={puntajeMinimo}
            onChange={(e) => setPuntajeMinimo(e.target.value)}
            min={0}
            step="0.1"
            disabled={loading}
            placeholder="Ej: 70"
            className={styles.input}
          />
          <p className={styles.hint}>Puntaje mínimo para aprobar</p>
        </div>

        <div className={styles.field}>
          <label htmlFor="intentosMaximos" className={styles.label}>
            Intentos máximos
          </label>
          <input
            type="number"
            id="intentosMaximos"
            value={intentosMaximos}
            onChange={(e) => setIntentosMaximos(e.target.value)}
            min={1}
            step="1"
            disabled={loading}
            placeholder="Ej: 3"
            className={styles.input}
          />
          <p className={styles.hint}>Cantidad máxima de intentos permitidos</p>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="tiempoLimiteMin" className={styles.label}>
          Tiempo límite (minutos)
        </label>
        <input
          type="number"
          id="tiempoLimiteMin"
          value={tiempoLimiteMin}
          onChange={(e) => setTiempoLimiteMin(e.target.value)}
          min={1}
          step="1"
          disabled={loading}
          placeholder="Ej: 45"
          className={styles.input}
        />
        <p className={styles.hint}>
          Tiempo máximo para completar la evaluación
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
          ) : (
            'Crear evaluación'
          )}
        </button>
      </div>
    </form>
  );
}
