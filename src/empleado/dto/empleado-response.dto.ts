import type { Empleado } from '../entities/empleado.entity';

export interface EmpleadoResponse {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  idTipoRol: number;
  rolNombre: string | null;
  rol: 'mozo' | 'admin' | null;
  activo: null;
}
