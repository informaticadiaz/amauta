'use client';

import { useState } from 'react';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

export function JustificacionForm({
  asistenciaId,
  onSuccess,
  onCancel,
}: {
  asistenciaId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const [motivo, setMotivo] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  function selectFile(candidate: File | undefined) {
    if (!candidate) return;
    if (!ACCEPTED_TYPES.includes(candidate.type)) {
      setError('El archivo debe ser una imagen o un PDF.');
      return;
    }
    if (candidate.size > MAX_FILE_SIZE) {
      setError('El archivo no puede superar los 5 MB.');
      return;
    }
    setError(null);
    setFile(candidate);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!motivo.trim()) {
      setError('El motivo es obligatorio.');
      return;
    }
    if (!file) {
      setError('Seleccioná un archivo adjunto.');
      return;
    }
    setSending(true);
    setError(null);
    const body = new FormData();
    body.append('asistenciaId', asistenciaId);
    body.append('motivo', motivo.trim());
    body.append('archivo', file);
    try {
      const response = await fetch('/api/justificaciones', {
        method: 'POST',
        body,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(payload.message || 'No se pudo enviar la solicitud.');
      onSuccess?.();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'No se pudo enviar la solicitud.'
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mt-3 space-y-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
    >
      <div>
        <label
          htmlFor={`motivo-${asistenciaId}`}
          className="block text-sm font-medium"
        >
          Motivo
        </label>
        <textarea
          id={`motivo-${asistenciaId}`}
          required
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label
          htmlFor={`archivo-${asistenciaId}`}
          className="block text-sm font-medium"
        >
          Certificado o comprobante (imagen/PDF, máximo 5 MB)
        </label>
        <input
          id={`archivo-${asistenciaId}`}
          required
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => selectFile(e.target.files?.[0])}
          className="mt-1 block w-full text-sm"
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={sending}
          className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {sending ? 'Enviando...' : 'Enviar solicitud'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
