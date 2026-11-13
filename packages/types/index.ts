// @amauta/types - Definiciones de tipos compartidos

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
}

export type NivelCurso = 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';

export type DuracionCurso = 'corta' | 'media' | 'larga';

export type OrdenBusquedaCursos = 'relevancia' | 'publicadoEn' | 'titulo';

export type DireccionOrden = 'asc' | 'desc';

/** Query estable del endpoint público GET /cursos/buscar. */
export interface BusquedaCursosParams {
  page?: number;
  limit?: number;
  buscar?: string;
  categoriaId?: string;
  nivel?: NivelCurso;
  duracion?: DuracionCurso;
  idioma?: string;
  ordenarPor?: OrdenBusquedaCursos;
  orden?: DireccionOrden;
}

export interface CursoCatalogo {
  id: string;
  titulo: string;
  descripcion: string;
  slug: string;
  imagen: string | null;
  nivel: NivelCurso;
  duracion: number | null;
  idioma?: string;
  categoria: {
    id: string;
    nombre: string;
    slug?: string;
  };
  _count?: {
    lecciones: number;
    inscripciones: number;
  };
}

/** Respuesta estable del endpoint público GET /cursos/buscar. */
export interface ListaCursosResponse {
  cursos: CursoCatalogo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
