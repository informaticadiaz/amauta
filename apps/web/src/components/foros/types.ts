export type ForoRol =
  | 'ESTUDIANTE'
  | 'EDUCADOR'
  | 'ADMIN_ESCUELA'
  | 'SUPER_ADMIN';

export type ForoTipo = 'PREGUNTA' | 'DISCUSION' | 'ANUNCIO';

export interface ForoAutor {
  id: string;
  nombre: string;
  apellido: string;
}

export interface ForoPostListItem {
  id: string;
  tipo: ForoTipo;
  titulo: string;
  contenido: string;
  etiquetas: string[];
  estado: 'PUBLICADO' | 'CERRADO' | 'ELIMINADO';
  eliminado: boolean;
  creadoEn: string;
  actualizadoEn: string;
  autor: ForoAutor;
  responseCount: number;
}

export interface ForoRespuestaItem {
  id: string;
  contenido: string;
  eliminado: boolean;
  esSolucion: boolean;
  respuestaParentId: string | null;
  creadoEn: string;
  actualizadoEn: string;
  autor: ForoAutor;
}

export interface ForoPostDetalle extends ForoPostListItem {
  respuestas: ForoRespuestaItem[];
}
