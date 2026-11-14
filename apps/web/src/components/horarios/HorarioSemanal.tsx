'use client';
import { DIAS, type Horario } from './types';

interface Props {
  horarios: Horario[];
  emptyMessage?: string;
  onEdit?: (horario: Horario) => void;
  onDelete?: (horario: Horario) => void;
}
export function HorarioSemanal({
  horarios,
  emptyMessage = 'No hay clases programadas.',
  onEdit,
  onDelete,
}: Props) {
  const sorted = [...horarios].sort(
    (a, b) =>
      a.diaSemana.localeCompare(b.diaSemana) ||
      a.horaInicio.localeCompare(b.horaInicio)
  );
  if (sorted.length === 0)
    return (
      <div className="rounded-lg border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">
        {emptyMessage}
      </div>
    );
  return (
    <div className="grid gap-3 md:grid-cols-5">
      {DIAS.map((dia) => {
        const items = sorted.filter((item) => item.diaSemana === dia.id);
        return (
          <section
            key={dia.id}
            className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)]"
          >
            <h3 className="border-b border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--foreground)]">
              {dia.label}
            </h3>
            <div className="space-y-2 p-2">
              {items.length === 0 ? (
                <p className="px-1 py-3 text-xs text-[var(--muted)]">
                  Sin clases
                </p>
              ) : (
                items.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-md border border-primary/20 bg-primary/5 p-3 text-sm"
                  >
                    <p className="font-semibold text-primary">
                      {item.horaInicio} – {item.horaFin}
                    </p>
                    <p className="mt-1 font-medium text-[var(--foreground)]">
                      {item.materia?.nombre ?? 'Materia'}
                    </p>
                    {item.grupo?.nombre && (
                      <p className="text-xs text-[var(--muted)]">
                        {item.grupo.nombre}
                      </p>
                    )}
                    {item.educador && (
                      <p className="text-xs text-[var(--muted)]">
                        {item.educador.nombre} {item.educador.apellido ?? ''}
                      </p>
                    )}
                    {(onEdit || onDelete) && (
                      <div className="mt-2 flex gap-3">
                        <button
                          type="button"
                          onClick={() => onEdit?.(item)}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete?.(item)}
                          className="text-xs font-medium text-[var(--error-text)] hover:underline"
                        >
                          Dar de baja
                        </button>
                      </div>
                    )}
                  </article>
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
