'use client';
import { useEffect, useState } from 'react';
type Materia = {
  id: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
};
export function MateriasSection() {
  const [institucionId, setInstitucionId] = useState('');
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  async function load(id: string) {
    const r = await fetch(`/api/instituciones/${id}/materias`);
    const data = await r.json();
    if (!r.ok)
      throw new Error(data.message || 'No se pudieron cargar las materias');
    setMaterias(data.materias);
  }
  useEffect(() => {
    fetch('/api/mi-institucion')
      .then((r) => r.json())
      .then(async (data) => {
        setInstitucionId(data.institucionId);
        await load(data.institucionId);
      })
      .catch((e) => setError(e.message));
  }, []);
  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!institucionId || !nombre.trim()) return;
    setError(null);
    const r = await fetch(
      editandoId
        ? `/api/materias/${editandoId}`
        : `/api/instituciones/${institucionId}/materias`,
      {
        method: editandoId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, descripcion: descripcion || null }),
      }
    );
    const data = await r.json();
    if (!r.ok) {
      setError(data.message || 'No se pudo crear la materia');
      return;
    }
    setNombre('');
    setDescripcion('');
    setEditandoId(null);
    await load(institucionId);
  }
  async function deactivate(id: string) {
    const r = await fetch(`/api/materias/${id}`, { method: 'DELETE' });
    if (!r.ok) {
      const d = await r.json();
      setError(d.message || 'No se pudo desactivar la materia');
      return;
    }
    if (institucionId) await load(institucionId);
  }
  return (
    <div className="space-y-6">
      <form
        onSubmit={guardar}
        className="grid gap-3 rounded-lg border p-4 md:grid-cols-3"
      >
        <input
          aria-label="Nombre de materia"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          maxLength={100}
          required
          placeholder="Ej. Matemática"
          className="rounded border p-2"
        />
        <input
          aria-label="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          maxLength={500}
          placeholder="Descripción opcional"
          className="rounded border p-2"
        />
        <button className="rounded bg-primary px-4 py-2 text-white">
          {editandoId ? 'Guardar cambios' : 'Crear materia'}
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
      <ul className="divide-y rounded-lg border">
        {materias.map((m) => (
          <li key={m.id} className="flex items-center justify-between p-4">
            <div>
              <strong>{m.nombre}</strong>
              {m.descripcion && <p className="text-sm">{m.descripcion}</p>}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditandoId(m.id);
                  setNombre(m.nombre);
                  setDescripcion(m.descripcion ?? '');
                }}
                className="text-sm text-primary"
              >
                Editar
              </button>
              <button
                onClick={() => deactivate(m.id)}
                className="text-sm text-red-700"
              >
                Desactivar
              </button>
            </div>
          </li>
        ))}
        {materias.length === 0 && (
          <li className="p-4">Todavía no hay materias activas.</li>
        )}
      </ul>
    </div>
  );
}
