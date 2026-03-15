/**
 * Componente ResumenProgreso
 *
 * Muestra las estadísticas de aprendizaje del estudiante:
 * cursos en progreso, completados y total de inscripciones.
 */

interface Props {
  enProgreso: number;
  completados: number;
  totalInscritos: number;
}

interface StatCardProps {
  valor: number;
  etiqueta: string;
  colorClass: string;
}

function StatCard({ valor, etiqueta, colorClass }: StatCardProps) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-[var(--border)] bg-[var(--background)] p-6 text-center">
      <span className={`mb-1 text-3xl font-bold ${colorClass}`}>{valor}</span>
      <span className="text-sm text-[var(--muted)]">{etiqueta}</span>
    </div>
  );
}

export function ResumenProgreso({
  enProgreso,
  completados,
  totalInscritos,
}: Props) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold text-[var(--foreground)]">
        Mi progreso
      </h2>
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          valor={totalInscritos}
          etiqueta="Total inscritos"
          colorClass="text-[var(--foreground)]"
        />
        <StatCard
          valor={enProgreso}
          etiqueta="En progreso"
          colorClass="text-primary"
        />
        <StatCard
          valor={completados}
          etiqueta="Completados"
          colorClass="text-green-600"
        />
      </div>
    </section>
  );
}
