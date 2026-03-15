/**
 * Componente ProgresoBar
 *
 * Barra de progreso visual para el avance del estudiante en un curso.
 */

interface Props {
  porcentaje: number;
  label?: string;
  leccionesCompletadas?: number;
  totalLecciones?: number;
}

export function ProgresoBar({
  porcentaje,
  label,
  leccionesCompletadas,
  totalLecciones,
}: Props) {
  const porcentajeSeguro = Math.min(100, Math.max(0, porcentaje));

  return (
    <div className="space-y-1">
      {(label ||
        (leccionesCompletadas !== undefined &&
          totalLecciones !== undefined)) && (
        <div className="flex items-center justify-between text-xs text-[var(--muted)]">
          {label && <span>{label}</span>}
          {leccionesCompletadas !== undefined &&
            totalLecciones !== undefined && (
              <span>
                {leccionesCompletadas} de {totalLecciones}
              </span>
            )}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={porcentajeSeguro}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? `Progreso: ${porcentajeSeguro}%`}
        data-testid="progreso-bar"
        className="h-2 w-full overflow-hidden rounded-full bg-[var(--overlay)]"
      >
        <div
          data-testid="progreso-bar-fill"
          style={{ width: `${porcentajeSeguro}%` }}
          className={`h-full rounded-full transition-all duration-300 ${
            porcentajeSeguro === 100 ? 'bg-green-500' : 'bg-primary'
          }`}
        />
      </div>

      <p className="text-right text-xs font-medium text-[var(--muted)]">
        {porcentajeSeguro}%
      </p>
    </div>
  );
}
