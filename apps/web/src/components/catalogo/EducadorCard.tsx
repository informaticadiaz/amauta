/**
 * Componente EducadorCard
 *
 * Muestra información del educador/instructor del curso
 */

import Image from 'next/image';

interface Educador {
  id: string;
  nombre: string;
  apellido: string;
  avatar: string | null;
}

interface EducadorCardProps {
  educador: Educador;
}

export function EducadorCard({ educador }: EducadorCardProps) {
  const avatarUrl = educador.avatar
    ? educador.avatar.startsWith('/uploads/')
      ? `/api/image${educador.avatar}`
      : educador.avatar
    : null;

  return (
    <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--background)] p-6">
      {/* Título */}
      <h3 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
        Tu instructor
      </h3>

      {/* Información del educador */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-[var(--overlay-light)]">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={`${educador.nombre} ${educador.apellido}`}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <svg
                className="h-8 w-8 text-[var(--muted)]"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Nombre */}
        <div>
          <p className="font-semibold text-[var(--foreground)]">
            {educador.nombre} {educador.apellido}
          </p>
          <p className="text-sm text-[var(--muted)]">Educador</p>
        </div>
      </div>
    </div>
  );
}
