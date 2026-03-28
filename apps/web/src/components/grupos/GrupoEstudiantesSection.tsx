'use client';

import { useState } from 'react';
import { AsignarEstudiantesModal } from './AsignarEstudiantesModal';
import { EstudiantesTable } from './EstudiantesTable';

interface GrupoEstudiantesSectionProps {
  grupoId: string;
  institucionId: string;
}

export function GrupoEstudiantesSection({
  grupoId,
  institucionId,
}: GrupoEstudiantesSectionProps) {
  const [showModal, setShowModal] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  function handleAssigned() {
    setReloadKey((prev) => prev + 1);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            Asignación de estudiantes
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Administrá estudiantes del grupo y revisá el preview antes de
            confirmar.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          Asignar estudiantes
        </button>
      </div>

      <EstudiantesTable grupoId={grupoId} reloadKey={reloadKey} />

      <AsignarEstudiantesModal
        open={showModal}
        onClose={() => setShowModal(false)}
        grupoId={grupoId}
        institucionId={institucionId}
        onAssigned={handleAssigned}
      />
    </div>
  );
}
