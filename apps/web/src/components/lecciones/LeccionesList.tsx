'use client';

/**
 * Componente LeccionesList
 *
 * Lista de lecciones con acciones de editar, eliminar y reordenar
 */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './LeccionesList.module.css';

type TipoLeccion = 'TEXTO' | 'VIDEO' | 'QUIZ' | 'INTERACTIVO' | 'DESCARGABLE';

interface Leccion {
  id: string;
  titulo: string;
  descripcion: string | null;
  orden: number;
  tipo: TipoLeccion;
  duracion: number | null;
  publicada: boolean;
}

interface LeccionesListProps {
  cursoId: string;
  lecciones: Leccion[];
}

export function LeccionesList({ cursoId, lecciones }: LeccionesListProps) {
  const router = useRouter();
  const [items, setItems] = useState(lecciones);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  async function handleDelete(id: string) {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/lecciones/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 204) {
        const err = await response.json();
        throw new Error(err.message || 'Error al eliminar');
      }

      setItems(items.filter((l) => l.id !== id));
      setDeleteId(null);
      router.refresh();
    } catch (error) {
      console.error('Error al eliminar lección:', error);
      alert('Error al eliminar la lección');
    } finally {
      setIsDeleting(false);
    }
  }

  function handleDragStart(index: number) {
    setDraggedIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDropTargetIndex(index);
    }
  }

  function handleDragLeave() {
    setDropTargetIndex(null);
  }

  async function handleDrop(targetIndex: number) {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDropTargetIndex(null);
      return;
    }

    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    if (!draggedItem) return;
    newItems.splice(targetIndex, 0, draggedItem);

    // Actualizar orden local
    const reordered = newItems.map((item, index) => ({
      ...item,
      orden: index,
    }));

    setItems(reordered);
    setDraggedIndex(null);
    setDropTargetIndex(null);

    // Enviar al servidor
    try {
      const response = await fetch(
        `/api/cursos/${cursoId}/lecciones/reordenar`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lecciones: reordered.map((l) => ({ id: l.id, orden: l.orden })),
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Error al reordenar');
      }

      router.refresh();
    } catch (error) {
      console.error('Error al reordenar:', error);
      // Revertir cambios locales
      setItems(lecciones);
    }
  }

  function handleDragEnd() {
    setDraggedIndex(null);
    setDropTargetIndex(null);
  }

  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <svg
          className={styles.emptyIcon}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <h3 className={styles.emptyTitle}>No hay lecciones</h3>
        <p className={styles.emptyText}>
          Crea tu primera lección para comenzar a estructurar el curso.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {items.map((leccion, index) => (
          <div
            key={leccion.id}
            className={`${styles.leccionCard} ${
              draggedIndex === index ? styles.dragging : ''
            } ${dropTargetIndex === index ? styles.dropTarget : ''}`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop(index)}
            onDragEnd={handleDragEnd}
          >
            <div className={styles.dragHandle}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8h16M4 16h16"
                />
              </svg>
            </div>

            <span className={styles.orden}>{index + 1}</span>

            <div
              className={`${styles.tipoIcon} ${
                leccion.tipo === 'VIDEO'
                  ? styles.tipoIconVideo
                  : styles.tipoIconTexto
              }`}
            >
              {leccion.tipo === 'VIDEO' ? (
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              )}
            </div>

            <div className={styles.content}>
              <h3 className={styles.titulo}>{leccion.titulo}</h3>
              <div className={styles.meta}>
                <span
                  className={`${styles.badge} ${
                    leccion.publicada
                      ? styles.badgePublicada
                      : styles.badgeBorrador
                  }`}
                >
                  {leccion.publicada ? 'Publicada' : 'Borrador'}
                </span>
                {leccion.duracion && <span>{leccion.duracion} min</span>}
              </div>
            </div>

            {deleteId === leccion.id ? (
              <div className={styles.deleteConfirm}>
                <span className={styles.deleteConfirmText}>Eliminar?</span>
                <button
                  onClick={() => handleDelete(leccion.id)}
                  disabled={isDeleting}
                  className={`${styles.deleteConfirmButton} ${styles.deleteConfirmYes}`}
                >
                  {isDeleting ? '...' : 'Sí'}
                </button>
                <button
                  onClick={() => setDeleteId(null)}
                  disabled={isDeleting}
                  className={`${styles.deleteConfirmButton} ${styles.deleteConfirmNo}`}
                >
                  No
                </button>
              </div>
            ) : (
              <div className={styles.actions}>
                <Link
                  href={`/dashboard/cursos/${cursoId}/lecciones/${leccion.id}/editar`}
                  className={styles.actionButton}
                  title="Editar"
                >
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </Link>
                <button
                  onClick={() => setDeleteId(leccion.id)}
                  className={`${styles.actionButton} ${styles.actionButtonDanger}`}
                  title="Eliminar"
                >
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
