'use client';

/**
 * GrupoForm — Formulario para crear o editar un grupo/clase
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PeriodoItem {
  id: string;
  nombre: string;
}

interface GrupoItem {
  id: string;
  nombre: string;
  grado: string | null;
  seccion: string | null;
  activo: boolean;
  periodoAcademicoId: string | null;
  educadorId: string;
}

interface GrupoFormProps {
  institucionId: string;
  periodos: PeriodoItem[];
  grupo?: GrupoItem;
  onSuccess?: () => void;
}

export function GrupoForm({
  institucionId,
  periodos,
  grupo,
  onSuccess,
}: GrupoFormProps) {
  const router = useRouter();
  const isEditing = !!grupo;

  const [nombre, setNombre] = useState(grupo?.nombre ?? '');
  const [grado, setGrado] = useState(grupo?.grado ?? '');
  const [seccion, setSeccion] = useState(grupo?.seccion ?? '');
  const [periodoAcademicoId, setPeriodoAcademicoId] = useState(
    grupo?.periodoAcademicoId ?? ''
  );
  const [educadorId, setEducadorId] = useState(grupo?.educadorId ?? '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errors: Record<string, string> = {};

    if (!nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    }

    if (!isEditing && !educadorId.trim()) {
      errors.educadorId = 'El educador es requerido';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setLoading(true);

    try {
      const payload: Record<string, unknown> = {
        nombre: nombre.trim(),
        grado: grado.trim() || null,
        seccion: seccion.trim() || null,
        periodoAcademicoId: periodoAcademicoId || undefined,
        educadorId: educadorId.trim() || undefined,
      };

      let response: Response;

      if (isEditing) {
        response = await fetch(`/api/grupos/${grupo.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('/api/grupos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ institucionId, ...payload }),
        });
      }

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Error al guardar el grupo');
      }

      onSuccess?.();
      router.push('/dashboard/grupos');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error-text)]">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label
          htmlFor="nombre"
          className="block text-sm font-medium text-[var(--foreground)]"
        >
          Nombre del grupo <span className="text-[var(--error-text)]">*</span>
        </label>
        <input
          id="nombre"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: 3ro A"
          maxLength={120}
          className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]"
        />
        {fieldErrors.nombre && (
          <p className="text-xs text-[var(--error-text)]">
            {fieldErrors.nombre}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label
            htmlFor="grado"
            className="block text-sm font-medium text-[var(--foreground)]"
          >
            Grado
          </label>
          <input
            id="grado"
            type="text"
            value={grado}
            onChange={(e) => setGrado(e.target.value)}
            placeholder="Ej: 3ro"
            maxLength={50}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="seccion"
            className="block text-sm font-medium text-[var(--foreground)]"
          >
            Sección
          </label>
          <input
            id="seccion"
            type="text"
            value={seccion}
            onChange={(e) => setSeccion(e.target.value)}
            placeholder="Ej: A"
            maxLength={50}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label
          htmlFor="periodoAcademicoId"
          className="block text-sm font-medium text-[var(--foreground)]"
        >
          Período académico
        </label>
        <select
          id="periodoAcademicoId"
          value={periodoAcademicoId}
          onChange={(e) => setPeriodoAcademicoId(e.target.value)}
          className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
        >
          <option value="">Sin período asignado</option>
          {periodos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label
          htmlFor="educadorId"
          className="block text-sm font-medium text-[var(--foreground)]"
        >
          ID del educador{' '}
          {!isEditing && <span className="text-[var(--error-text)]">*</span>}
        </label>
        <input
          id="educadorId"
          type="text"
          value={educadorId}
          onChange={(e) => setEducadorId(e.target.value)}
          placeholder="UUID del educador responsable"
          className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-mono text-[var(--foreground)] placeholder:text-[var(--muted)]"
        />
        {fieldErrors.educadorId && (
          <p className="text-xs text-[var(--error-text)]">
            {fieldErrors.educadorId}
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push('/dashboard/grupos')}
          className="rounded-md px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? isEditing
              ? 'Guardando...'
              : 'Creando...'
            : isEditing
              ? 'Guardar cambios'
              : 'Crear grupo'}
        </button>
      </div>
    </form>
  );
}
