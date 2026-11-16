'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthorization } from '@/hooks/useAuthorization';

type Relacion = 'PADRE' | 'MADRE' | 'TUTOR_LEGAL' | 'OTRO';
type Student = { id: string; nombre: string; apellido: string; email: string };
type LinkItem = {
  id: string;
  relacion: Relacion;
  tutor: { id: string; nombre: string; apellido: string; email: string };
  estudiante: Student;
};

const relationLabels: Record<Relacion, string> = {
  PADRE: 'Padre',
  MADRE: 'Madre',
  TUTOR_LEGAL: 'Tutor legal',
  OTRO: 'Otro',
};

export function TutorEstudiantesSection() {
  const { isLoading, isAuthenticated, isAdmin, isSuperAdmin } =
    useAuthorization();
  const router = useRouter();
  const [institutionId, setInstitutionId] = useState('');
  const [institutionInput, setInstitutionInput] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [studentId, setStudentId] = useState('');
  const [tutorId, setTutorId] = useState('');
  const [relation, setRelation] = useState<Relacion>('PADRE');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin))
      router.replace('/dashboard');
  }, [isAuthenticated, isAdmin, isLoading, router]);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !isAdmin || isSuperAdmin) {
      if (isSuperAdmin) setLoading(false);
      return;
    }
    fetch('/api/mi-institucion')
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || 'No se pudo obtener la institución');
        setInstitutionId(data.institucionId);
      })
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error
            ? reason.message
            : 'No se pudo obtener la institución'
        )
      )
      .finally(() => setLoading(false));
  }, [isAuthenticated, isAdmin, isLoading, isSuperAdmin]);

  useEffect(() => {
    if (!institutionId) return;
    let active = true;
    setLoading(true);
    Promise.all([
      fetch(`/api/instituciones/${institutionId}/estudiantes?limit=100`).then(
        async (r) => {
          const data = await r.json();
          if (!r.ok)
            throw new Error(
              data.message || 'No se pudieron cargar los estudiantes'
            );
          return data;
        }
      ),
      fetch(
        `/api/instituciones/${institutionId}/tutores-estudiantes?limit=100`
      ).then(async (r) => {
        const data = await r.json();
        if (!r.ok)
          throw new Error(data.message || 'No se pudieron cargar los vínculos');
        return data;
      }),
    ])
      .then(([studentData, linkData]) => {
        if (!active) return;
        setStudents(studentData.usuarios ?? []);
        setLinks(linkData.vinculos ?? []);
      })
      .catch((reason: unknown) => {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : 'No se pudieron cargar los datos'
          );
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [institutionId]);

  async function loadLinks() {
    if (!institutionId) return;
    const response = await fetch(
      `/api/instituciones/${institutionId}/tutores-estudiantes?limit=100`
    );
    const data = await response.json();
    if (response.ok) setLinks(data.vinculos ?? []);
  }

  async function createLink(event: React.FormEvent) {
    event.preventDefault();
    if (!institutionId || !tutorId.trim() || !studentId) {
      setError('El tutor y el estudiante son obligatorios.');
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    const response = await fetch(
      `/api/instituciones/${institutionId}/tutores-estudiantes`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorId: tutorId.trim(),
          estudianteId: studentId,
          relacion: relation,
        }),
      }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) setError(data.message || 'No se pudo crear el vínculo');
    else {
      setMessage('Vínculo creado correctamente.');
      setTutorId('');
      setStudentId('');
      await loadLinks();
    }
    setSaving(false);
  }

  async function deactivateLink(linkId: string) {
    setSaving(true);
    setError(null);
    setMessage(null);
    const response = await fetch(
      `/api/instituciones/${institutionId}/tutores-estudiantes/${linkId}`,
      { method: 'DELETE' }
    );
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.message || 'No se pudo desactivar el vínculo');
    } else {
      setMessage('Vínculo desactivado correctamente.');
      await loadLinks();
    }
    setSaving(false);
  }

  if (isLoading || (loading && !institutionId))
    return (
      <p role="status" className="py-8 text-[var(--muted)]">
        Cargando vínculos...
      </p>
    );
  if (!isAuthenticated || !isAdmin) return null;

  return (
    <div className="space-y-6">
      {isSuperAdmin && !institutionId && (
        <form
          className="flex gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            setInstitutionId(institutionInput.trim());
          }}
        >
          <input
            aria-label="ID de institución"
            required
            value={institutionInput}
            onChange={(event) => setInstitutionInput(event.target.value)}
            placeholder="ID de institución"
            className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          />
          <button className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white">
            Cargar institución
          </button>
        </form>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      {message && (
        <p
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
        >
          {message}
        </p>
      )}
      {institutionId && (
        <>
          <form
            onSubmit={createLink}
            className="grid gap-3 rounded-lg border border-[var(--border)] p-4 md:grid-cols-4"
          >
            <input
              aria-label="ID del tutor"
              value={tutorId}
              onChange={(event) => setTutorId(event.target.value)}
              placeholder="ID del tutor"
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            />
            <select
              aria-label="Estudiante"
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            >
              <option value="">Seleccioná un estudiante</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.apellido}, {student.nombre}
                </option>
              ))}
            </select>
            <select
              aria-label="Relación"
              value={relation}
              onChange={(event) => setRelation(event.target.value as Relacion)}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            >
              {Object.entries(relationLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button
              disabled={saving}
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Vincular tutor'}
            </button>
          </form>
          <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
            <table className="min-w-full divide-y divide-[var(--border)] text-sm">
              <thead>
                <tr className="text-left text-[var(--muted)]">
                  <th className="p-3">Tutor</th>
                  <th className="p-3">Estudiante</th>
                  <th className="p-3">Relación</th>
                  <th className="p-3">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {links.map((link) => (
                  <tr key={link.id}>
                    <td className="p-3">
                      {link.tutor.apellido}, {link.tutor.nombre}
                      <span className="block text-xs text-[var(--muted)]">
                        {link.tutor.email}
                      </span>
                    </td>
                    <td className="p-3">
                      {link.estudiante.apellido}, {link.estudiante.nombre}
                    </td>
                    <td className="p-3">{relationLabels[link.relacion]}</td>
                    <td className="p-3">
                      <button
                        disabled={saving}
                        onClick={() => deactivateLink(link.id)}
                        className="text-sm font-medium text-red-700 disabled:opacity-50"
                      >
                        Desactivar
                      </button>
                    </td>
                  </tr>
                ))}
                {links.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-8 text-center text-[var(--muted)]"
                    >
                      No hay vínculos activos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
