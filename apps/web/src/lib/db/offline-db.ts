import Dexie, { type Table } from 'dexie';

export type TipoLeccion =
  | 'VIDEO'
  | 'TEXTO'
  | 'QUIZ'
  | 'INTERACTIVO'
  | 'DESCARGABLE';

export type NivelCurso = 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';

export interface CursoOffline {
  id: string;
  slug: string;
  titulo: string;
  descripcion: string;
  imagen?: string | null;
  nivel: NivelCurso;
  duracion?: number | null;
  categoriaId: string;
  fechaDescarga: Date;
  actualizadoEn: Date;
  tamanoBytes: number;
}

export interface LeccionOffline {
  id: string;
  cursoId: string;
  titulo: string;
  contenido: string;
  tipo: TipoLeccion;
  orden: number;
  videoUrl?: string;
  actualizadoEn: Date;
}

export interface ProgresoOffline {
  leccionId: string;
  cursoId: string;
  completada: boolean;
  timestamp: Date;
  sincronizado: 0 | 1;
}

export interface SyncPendiente {
  id?: number;
  tipo: 'completar-leccion' | 'inscribir' | 'cancelar-inscripcion';
  payload: string;
  timestamp: Date;
  intentos: number;
}

export class OfflineDB extends Dexie {
  cursos!: Table<CursoOffline, string>;
  lecciones!: Table<LeccionOffline, string>;
  progreso!: Table<ProgresoOffline, string>;
  syncPendiente!: Table<SyncPendiente, number>;

  constructor() {
    super('AmautaOfflineDB');
    this.version(1).stores({
      cursos: 'id, slug, fechaDescarga',
      lecciones: 'id, cursoId, orden',
      progreso: 'leccionId, cursoId, sincronizado, timestamp',
      syncPendiente: '++id, tipo, timestamp',
    });
  }
}

export const db = new OfflineDB();
