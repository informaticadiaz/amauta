export interface HistorialNota {
  materia: { id: string; nombre: string };
  nota: number;
  observaciones: string | null;
  grupo: { id?: string; nombre: string };
}

export type EstadoPromocion =
  | 'PROMOVIDO'
  | 'REPITENTE'
  | 'EGRESADO'
  | 'SIN EVALUAR';

export interface HistorialPromocion {
  periodoId: string;
  periodo: string;
  grupoId: string;
  grupo: string;
  estado: Exclude<EstadoPromocion, 'SIN EVALUAR'> | null;
}

export interface HistorialPeriodo {
  id: string;
  nombre: string;
  orden: number;
  promedio: number | null;
  calificaciones: HistorialNota[];
  estadoPromocion?: Exclude<EstadoPromocion, 'SIN EVALUAR'> | null;
}

export interface EvolucionMateria {
  materia: { id: string; nombre: string };
  periodos: Array<{
    periodoId: string;
    periodo: string;
    promedio: number;
  }>;
}

export interface HistorialData {
  estudianteId: string;
  periodos: HistorialPeriodo[];
  promedioAcumulado: number | null;
  evolucionPorMateria: EvolucionMateria[];
  estadoPromocion?: HistorialPromocion[] | null;
}

function estadoParaGrupo(
  periodo: HistorialPeriodo,
  grupo: HistorialNota['grupo'],
  estados: HistorialPromocion[]
): EstadoPromocion {
  const estadosDelPeriodo = [
    ...(periodo.estadoPromocion
      ? [
          {
            periodoId: periodo.id,
            periodo: periodo.nombre,
            grupoId: '',
            grupo: '',
            estado: periodo.estadoPromocion,
          },
        ]
      : []),
    ...estados.filter((estado) => estado.periodoId === periodo.id),
  ];
  const estado = estadosDelPeriodo.find(
    (item) =>
      (item.grupoId && grupo.id && item.grupoId === grupo.id) ||
      item.grupo === grupo.nombre ||
      (!item.grupoId && !item.grupo)
  );
  return estado?.estado ?? 'SIN EVALUAR';
}

function EstadoPromocionBadge({ estado }: { estado: EstadoPromocion }) {
  return (
    <span
      aria-label={`Estado de promoción: ${estado}`}
      className="inline-flex rounded-full border border-[var(--border)] px-2 py-1 text-xs font-semibold text-[var(--foreground)]"
    >
      {estado}
    </span>
  );
}

function formatNota(nota: number | null) {
  return nota === null ? '—' : nota.toFixed(2);
}

export function HistorialAcademico({ data }: { data: HistorialData }) {
  if (data.periodos.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--border)] p-8 text-center">
        <p className="text-[var(--muted)]">
          Todavía no tenés calificaciones registradas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section
        aria-label="Promedio acumulado"
        className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-5 shadow-sm"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Promedio acumulado
        </p>
        <p className="mt-2 text-3xl font-bold text-[var(--foreground)]">
          {data.promedioAcumulado === null
            ? '—'
            : formatNota(data.promedioAcumulado)}
        </p>
      </section>

      <section aria-labelledby="periodos-heading" className="space-y-4">
        <h2
          id="periodos-heading"
          className="text-lg font-semibold text-[var(--foreground)]"
        >
          Calificaciones por período
        </h2>
        {data.periodos.map((periodo) => (
          <article
            key={periodo.id}
            className="overflow-hidden rounded-lg border border-[var(--border)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 bg-[var(--background)] px-4 py-3">
              <h3 className="font-semibold text-[var(--foreground)]">
                {periodo.nombre}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
                <span>
                  Promedio: <strong>{formatNota(periodo.promedio)}</strong>
                </span>
                {periodo.calificaciones.length === 0 && (
                  <span className="flex flex-wrap items-center gap-2">
                    {(data.estadoPromocion ?? [])
                      .filter((estado) => estado.periodoId === periodo.id)
                      .map((estado) => (
                        <EstadoPromocionBadge
                          key={`${estado.periodoId}-${estado.grupoId}`}
                          estado={estado.estado ?? 'SIN EVALUAR'}
                        />
                      ))}
                    {!(data.estadoPromocion ?? []).some(
                      (estado) => estado.periodoId === periodo.id
                    ) && <EstadoPromocionBadge estado="SIN EVALUAR" />}
                  </span>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[32rem] text-sm">
                <thead className="border-b border-[var(--border)] bg-[var(--border)]/20">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted)]">
                      Materia
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted)]">
                      Grupo
                    </th>
                    <th className="px-4 py-2 text-right font-medium text-[var(--muted)]">
                      Nota
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted)]">
                      Estado de promoción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {periodo.calificaciones.map((calificacion, index) => (
                    <tr
                      key={`${calificacion.materia.id}-${calificacion.grupo.nombre}-${index}`}
                      className="border-b border-[var(--border)] last:border-0"
                    >
                      <td className="px-4 py-3 text-[var(--foreground)]">
                        {calificacion.materia.nombre}
                      </td>
                      <td className="px-4 py-3 text-[var(--muted)]">
                        {calificacion.grupo.nombre}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[var(--foreground)]">
                        {formatNota(calificacion.nota)}
                      </td>
                      <td className="px-4 py-3">
                        <EstadoPromocionBadge
                          estado={estadoParaGrupo(
                            periodo,
                            calificacion.grupo,
                            data.estadoPromocion ?? []
                          )}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        ))}
      </section>

      <section aria-labelledby="evolucion-heading" className="space-y-3">
        <h2
          id="evolucion-heading"
          className="text-lg font-semibold text-[var(--foreground)]"
        >
          Evolución por materia
        </h2>
        <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
          <table className="w-full min-w-[32rem] text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--border)]/20">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-[var(--muted)]">
                  Materia
                </th>
                <th className="px-4 py-2 text-left font-medium text-[var(--muted)]">
                  Período y promedio
                </th>
              </tr>
            </thead>
            <tbody>
              {data.evolucionPorMateria.map((materia) => (
                <tr
                  key={materia.materia.id}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                    {materia.materia.nombre}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    <ul className="flex flex-wrap gap-x-4 gap-y-1">
                      {materia.periodos.map((periodo) => (
                        <li key={periodo.periodoId}>
                          {periodo.periodo}: {formatNota(periodo.promedio)}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
