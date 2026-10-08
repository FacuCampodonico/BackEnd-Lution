import type { NivelAcceso } from '../../common/decorators/niveles.decorator';

export interface EmpleadoSesion {
  id: string;
  nombre: string;
  dni: string;
  rolNombre: string;
  nivel: NivelAcceso;
}

export interface LoginResponse {
  accessToken: string;
  empleado: EmpleadoSesion;
}
