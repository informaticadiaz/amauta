'use client';

import { useState } from 'react';
import { AsignarEducadorForm } from './AsignarEducadorForm';
import { EducadoresList } from './EducadoresList';

interface GrupoEducadoresSectionProps {
  grupoId: string;
  institucionId: string;
}

export function GrupoEducadoresSection({
  grupoId,
  institucionId,
}: GrupoEducadoresSectionProps) {
  const [reloadKey, setReloadKey] = useState(0);

  function handleAssigned() {
    setReloadKey((prev) => prev + 1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          Asignación de educadores
        </h2>
        <p className="text-sm text-[var(--muted)]">
          Definí roles titular/suplente y gestioná las asignaciones actuales.
        </p>
      </div>

      <AsignarEducadorForm
        grupoId={grupoId}
        institucionId={institucionId}
        onAssigned={handleAssigned}
      />

      <EducadoresList grupoId={grupoId} reloadKey={reloadKey} />
    </div>
  );
}
