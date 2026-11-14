export type DiaSemana = 'LUN' | 'MAR' | 'MIE' | 'JUE' | 'VIE';
export interface Horario {
  id: string;
  grupoId: string;
  materiaId: string;
  educadorId: string;
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFin: string;
  activo: boolean;
  materia?: { id: string; nombre: string };
  educador?: { id: string; nombre: string; apellido?: string };
  grupo?: { id: string; nombre: string };
}
export interface HorariosResponse {
  horarios: Horario[];
}
export const DIAS: Array<{ id: DiaSemana; label: string }> = [
  { id: 'LUN', label: 'Lunes' },
  { id: 'MAR', label: 'Martes' },
  { id: 'MIE', label: 'Miércoles' },
  { id: 'JUE', label: 'Jueves' },
  { id: 'VIE', label: 'Viernes' },
];
