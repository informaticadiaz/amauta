'use client';

import { useEffect, useState } from 'react';
import { useAuthorization } from '@/hooks/useAuthorization';
import { useRouter } from 'next/navigation';

interface Student {
  id: string;
  relacion: string;
  estudiante: {
    id: string;
    nombre: string;
    apellido: string;
    matricula: {
      institucionId: string;
      periodoAcademico: { id: string; nombre: string };
    } | null;
  };
}

interface Boletin {
  estudiante: { nombre: string; apellido: string };
  periodo: { nombre: string };
  grupo: { nombre: string };
  calificaciones: {
    materia: string;
    nota: number;
    observaciones: string | null;
  }[];
  asistencia: {
    total: number;
    presente: number;
    ausente: number;
    tardanza: number;
    justificado: number;
    porcentaje: number;
  };
}

interface Asistencias {
  asistencias: {
    fecha: string;
    estado: string;
    observaciones: string | null;
    grupo: { nombre: string };
  }[];
  resumen: Boletin['asistencia'];
}

interface Calificaciones {
  calificaciones: {
    materia: { nombre: string };
    nota: number;
    observaciones: string | null;
    grupo: { nombre: string };
  }[];
}

interface Comunicados {
  comunicados: {
    id: string;
    titulo: string;
    contenido: string;
    tipo: string;
    prioridad: string;
    publicadoEn: string;
  }[];
}

interface AcademicData {
  boletin: Boletin;
  asistencias: Asistencias;
  calificaciones: Calificaciones;
  comunicados: Comunicados;
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(body?.message || 'No se pudo cargar la información.');
  }
  return response.json() as Promise<T>;
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg bg-[var(--muted)]/10 p-4 text-sm text-[var(--muted)]">
      {children}
    </p>
  );
}

export default function TutorPage() {
  const { isTutor, isLoading, isAuthenticated } = useAuthorization();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [academic, setAcademic] = useState<AcademicData | null>(null);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingAcademic, setLoadingAcademic] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isTutor) router.replace('/dashboard');
  }, [isLoading, isAuthenticated, isTutor, router]);

  useEffect(() => {
    if (isLoading || !isTutor) return;
    setLoadingStudents(true);
    getJson<{ estudiantes: Student[] }>('/api/me/tutor-estudiantes')
      .then((data) => {
        const linked = data.estudiantes ?? [];
        setStudents(linked);
        setSelectedId(linked[0]?.estudiante.id ?? '');
      })
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error
            ? reason.message
            : 'No se pudieron cargar tus estudiantes.'
        )
      )
      .finally(() => setLoadingStudents(false));
  }, [isLoading, isTutor]);

  useEffect(() => {
    if (!selectedId) {
      setAcademic(null);
      return;
    }
    setLoadingAcademic(true);
    setError(null);
    const base = `/api/me/tutor-estudiantes/${selectedId}`;
    Promise.all([
      getJson<Boletin>(`${base}/boletin`),
      getJson<Asistencias>(`${base}/asistencias`),
      getJson<Calificaciones>(`${base}/calificaciones`),
      getJson<Comunicados>(`${base}/comunicados`),
    ])
      .then(([boletin, asistencias, calificaciones, comunicados]) =>
        setAcademic({ boletin, asistencias, calificaciones, comunicados })
      )
      .catch((reason: unknown) => {
        setAcademic(null);
        setError(
          reason instanceof Error
            ? reason.message
            : 'No se pudo cargar el seguimiento académico.'
        );
      })
      .finally(() => setLoadingAcademic(false));
  }, [selectedId]);

  if (isLoading || !isAuthenticated || !isTutor) return null;

  const selected = students.find(
    (item) => item.estudiante.id === selectedId
  )?.estudiante;
  const fullName = selected ? `${selected.apellido}, ${selected.nombre}` : '';

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Seguimiento de estudiantes
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Consultá el estado académico vigente de tus estudiantes vinculados.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {loadingStudents ? (
        <p role="status" className="py-8 text-center text-[var(--muted)]">
          Cargando estudiantes...
        </p>
      ) : students.length === 0 ? (
        <EmptyState>
          No tenés estudiantes vinculados con matrícula activa.
        </EmptyState>
      ) : (
        <>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
            <label
              htmlFor="tutor-student"
              className="block text-sm font-medium text-[var(--foreground)]"
            >
              Estudiante
            </label>
            <select
              id="tutor-student"
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
              className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] sm:max-w-md"
            >
              {students.map(({ estudiante }) => (
                <option key={estudiante.id} value={estudiante.id}>
                  {estudiante.apellido}, {estudiante.nombre}
                </option>
              ))}
            </select>
          </div>

          {loadingAcademic ? (
            <p role="status" className="py-8 text-center text-[var(--muted)]">
              Cargando seguimiento académico...
            </p>
          ) : (
            academic && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--foreground)]">
                    {fullName}
                  </h2>
                  <p className="text-sm text-[var(--muted)]">
                    Información de solo lectura · período vigente
                  </p>
                </div>

                <section
                  aria-labelledby="boletin-title"
                  className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-5"
                >
                  <h2
                    id="boletin-title"
                    className="mb-3 text-lg font-semibold text-[var(--foreground)]"
                  >
                    Boletín · {academic.boletin.periodo.nombre}
                  </h2>
                  <p className="mb-4 text-sm text-[var(--muted)]">
                    Grupo: {academic.boletin.grupo.nombre}
                  </p>
                  {academic.boletin.calificaciones.length === 0 ? (
                    <EmptyState>Sin calificaciones registradas.</EmptyState>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-[var(--border)]">
                            <th className="py-2">Materia</th>
                            <th className="py-2 text-right">Nota</th>
                          </tr>
                        </thead>
                        <tbody>
                          {academic.boletin.calificaciones.map((item) => (
                            <tr
                              key={item.materia}
                              className="border-b border-[var(--border)] last:border-0"
                            >
                              <td className="py-2">{item.materia}</td>
                              <td className="py-2 text-right font-semibold">
                                {item.nota}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                <div className="grid gap-6 lg:grid-cols-2">
                  <section
                    aria-labelledby="asistencias-title"
                    className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-5"
                  >
                    <h2
                      id="asistencias-title"
                      className="mb-3 text-lg font-semibold text-[var(--foreground)]"
                    >
                      Asistencias
                    </h2>
                    <p className="mb-3 text-3xl font-bold text-primary">
                      {academic.asistencias.resumen.porcentaje}%
                    </p>
                    <p className="text-sm text-[var(--muted)]">
                      {academic.asistencias.resumen.presente} presentes ·{' '}
                      {academic.asistencias.resumen.ausente} ausentes ·{' '}
                      {academic.asistencias.resumen.tardanza} tardanzas ·{' '}
                      {academic.asistencias.resumen.justificado} justificadas
                    </p>
                    {academic.asistencias.asistencias.length === 0 ? (
                      <div className="mt-4">
                        <EmptyState>Sin registros de asistencia.</EmptyState>
                      </div>
                    ) : (
                      <ul className="mt-4 space-y-2 text-sm">
                        {academic.asistencias.asistencias
                          .slice(0, 8)
                          .map((item) => (
                            <li
                              key={`${item.fecha}-${item.estado}`}
                              className="flex justify-between border-b border-[var(--border)] pb-2"
                            >
                              <span>
                                {new Date(item.fecha).toLocaleDateString(
                                  'es-AR'
                                )}
                              </span>
                              <span className="font-medium">{item.estado}</span>
                            </li>
                          ))}
                      </ul>
                    )}
                  </section>

                  <section
                    aria-labelledby="calificaciones-title"
                    className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-5"
                  >
                    <h2
                      id="calificaciones-title"
                      className="mb-3 text-lg font-semibold text-[var(--foreground)]"
                    >
                      Calificaciones
                    </h2>
                    {academic.calificaciones.calificaciones.length === 0 ? (
                      <EmptyState>Sin calificaciones registradas.</EmptyState>
                    ) : (
                      <ul className="space-y-2 text-sm">
                        {academic.calificaciones.calificaciones.map(
                          (item, index) => (
                            <li
                              key={`${item.materia.nombre}-${index}`}
                              className="flex justify-between border-b border-[var(--border)] pb-2"
                            >
                              <span>{item.materia.nombre}</span>
                              <span className="font-semibold">{item.nota}</span>
                            </li>
                          )
                        )}
                      </ul>
                    )}
                  </section>
                </div>

                <section
                  aria-labelledby="comunicados-title"
                  className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-5"
                >
                  <h2
                    id="comunicados-title"
                    className="mb-3 text-lg font-semibold text-[var(--foreground)]"
                  >
                    Comunicados
                  </h2>
                  {academic.comunicados.comunicados.length === 0 ? (
                    <EmptyState>No hay comunicados para mostrar.</EmptyState>
                  ) : (
                    <ul className="space-y-4">
                      {academic.comunicados.comunicados.map((item) => (
                        <li
                          key={item.id}
                          className="border-b border-[var(--border)] pb-4 last:border-0"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="font-medium text-[var(--foreground)]">
                              {item.titulo}
                            </h3>
                            <span className="text-xs text-[var(--muted)]">
                              {new Date(item.publicadoEn).toLocaleDateString(
                                'es-AR'
                              )}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-[var(--muted)]">
                            {item.contenido}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
