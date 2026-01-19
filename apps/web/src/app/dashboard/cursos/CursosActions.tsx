'use client';

/**
 * Componente client-side para manejar acciones de cursos
 *
 * Maneja la lógica de publicar/despublicar cursos
 */

import { useRouter } from 'next/navigation';
import { CursosList } from '@/components/cursos/CursosList';

interface Curso {
  id: string;
  titulo: string;
  descripcion: string;
  slug: string;
  imagen: string | null;
  nivel: 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';
  estado: 'BORRADOR' | 'REVISION' | 'PUBLICADO' | 'ARCHIVADO';
  categoria: {
    id: string;
    nombre: string;
  };
  _count?: {
    lecciones: number;
    inscripciones: number;
  };
}

interface CursosActionsProps {
  cursos: Curso[];
}

export function CursosActions({ cursos }: CursosActionsProps) {
  const router = useRouter();

  async function handlePublishToggle(id: string, publicar: boolean) {
    try {
      const response = await fetch(`/api/cursos/${id}/publicar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicar }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al cambiar estado');
      }

      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  return <CursosList cursos={cursos} onPublishToggle={handlePublishToggle} />;
}
