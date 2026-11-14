'use client';
import { useEffect, useState } from 'react';
import { HorarioSemanal } from './HorarioSemanal';
import { DIAS, type DiaSemana, type Horario } from './types';

interface Option {
  id: string;
  nombre: string;
  apellido?: string;
}
interface Props {
  grupoId: string;
}
const initial = {
  materiaId: '',
  educadorId: '',
  diaSemana: 'LUN' as DiaSemana,
  horaInicio: '08:00',
  horaFin: '09:00',
};

export function HorariosAdmin({ grupoId }: Props) {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [materias, setMaterias] = useState<Option[]>([]);
  const [educadores, setEducadores] = useState<Option[]>([]);
  const [form, setForm] = useState(initial);
  const [editing, setEditing] = useState<Horario | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [h, m, e] = await Promise.all([
        fetch(`/api/grupos/${grupoId}/horarios`),
        fetch(`/api/grupos/${grupoId}/materias`),
        fetch(`/api/grupos/${grupoId}/educadores?limit=100`),
      ]);
      if (!h.ok || !m.ok || !e.ok)
        throw new Error('No se pudo cargar la configuración del horario');
      const hd = await h.json();
      const md = await m.json();
      const ed = await e.json();
      setHorarios(hd.horarios ?? []);
      setMaterias(
        (md.materias ?? []).map(
          (x: { materia?: Option } & Option) => x.materia ?? x
        )
      );
      setEducadores(
        (ed.asignaciones ?? ed.educadores ?? []).map(
          (x: { educador?: Option } & Option) => x.educador ?? x
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar horarios');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, [grupoId]);
  function edit(item: Horario) {
    setEditing(item);
    setForm({
      materiaId: item.materiaId,
      educadorId: item.educadorId,
      diaSemana: item.diaSemana,
      horaInicio: item.horaInicio,
      horaFin: item.horaFin,
    });
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(
        editing
          ? `/api/grupos/${grupoId}/horarios/${editing.id}`
          : `/api/grupos/${grupoId}/horarios`,
        {
          method: editing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(data.message || 'No se pudo guardar la franja');
      setEditing(null);
      setForm(initial);
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo guardar la franja'
      );
    } finally {
      setSaving(false);
    }
  }
  async function remove(item: Horario) {
    if (!window.confirm('¿Dar de baja esta franja horaria?')) return;
    const response = await fetch(`/api/grupos/${grupoId}/horarios/${item.id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.message || 'No se pudo dar de baja la franja');
      return;
    }
    await load();
  }
  if (loading)
    return (
      <p className="rounded-lg border border-[var(--border)] p-4 text-sm text-[var(--muted)]">
        Cargando horario...
      </p>
    );
  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-[var(--error-border)] bg-[var(--error-bg)] p-3 text-sm text-[var(--error-text)]">
          {error}
        </div>
      )}
      <form
        onSubmit={submit}
        className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 sm:grid-cols-2 lg:grid-cols-6"
      >
        <label className="text-sm">
          Materia
          <select
            required
            value={form.materiaId}
            onChange={(e) => setForm({ ...form, materiaId: e.target.value })}
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-2"
          >
            <option value="">Seleccionar</option>
            {materias.map((x) => (
              <option key={x.id} value={x.id}>
                {x.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Educador
          <select
            required
            value={form.educadorId}
            onChange={(e) => setForm({ ...form, educadorId: e.target.value })}
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-2"
          >
            <option value="">Seleccionar</option>
            {educadores.map((x) => (
              <option key={x.id} value={x.id}>
                {x.nombre} {x.apellido ?? ''}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Día
          <select
            value={form.diaSemana}
            onChange={(e) =>
              setForm({ ...form, diaSemana: e.target.value as DiaSemana })
            }
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-2"
          >
            {DIAS.map((x) => (
              <option key={x.id} value={x.id}>
                {x.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Desde
          <input
            required
            type="time"
            value={form.horaInicio}
            onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-2"
          />
        </label>
        <label className="text-sm">
          Hasta
          <input
            required
            type="time"
            value={form.horaFin}
            onChange={(e) => setForm({ ...form, horaFin: e.target.value })}
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-2"
          />
        </label>
        <div className="flex items-end gap-2">
          <button
            disabled={saving}
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Agregar'}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm(initial);
              }}
              className="rounded-md border border-[var(--border)] px-3 py-2 text-sm"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
      <HorarioSemanal horarios={horarios} onEdit={edit} onDelete={remove} />
    </div>
  );
}
