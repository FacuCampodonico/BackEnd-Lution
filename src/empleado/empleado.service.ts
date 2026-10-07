import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmpleadoRepository } from './empleado.repository';
import type { CrearEmpleadoDto } from './dto/crear-empleado.dto';
import type { Empleado } from './entities/empleado.entity';
import {
  type EmpleadoResponse,
} from './dto/empleado-response.dto';

@Injectable()
export class EmpleadoService {
  constructor(private readonly empleadoRepository: EmpleadoRepository) {}

  async findAll(): Promise<EmpleadoResponse[]> {
    return (await this.empleadoRepository.findAll()).map(this.empleadoResponse);
  }

  async findById(id: number): Promise<EmpleadoResponse> {
    const empleado = await this.empleadoRepository.findById(id);

    if (!empleado) {
      throw new NotFoundException(`No existe un empleado con id ${id}`);
    }

    return this.empleadoResponse(empleado);
  }

  async findByDni(dni: string): Promise<EmpleadoResponse> {
    const empleado = await this.empleadoRepository.findByDni(dni);

    if (!empleado) {
      throw new NotFoundException(`No existe un empleado con DNI ${dni}`);
    }

    return this.empleadoResponse(empleado);
  }

  async create(dto: CrearEmpleadoDto): Promise<EmpleadoResponse> {
    const empleadoExistente = await this.empleadoRepository.findByDni(dto.dni);

    if (empleadoExistente) {
      throw new ConflictException(`Ya existe un empleado con DNI ${dto.dni}`);
    }

    return this.empleadoResponse(await this.empleadoRepository.create(dto));
  }

  async update(
    id: number,
    datos: Partial<Empleado>,
  ): Promise<EmpleadoResponse> {
    const empleado = await this.empleadoRepository.update(id, datos);

    if (!empleado) {
      throw new NotFoundException(`No existe un empleado con id ${id}`);
    }

    return this.empleadoResponse(empleado);
  }

  async delete(id: number): Promise<{ message: string }> {
    const eliminado = await this.empleadoRepository.delete(id);

    if (!eliminado) {
      throw new NotFoundException(`No existe un empleado con id ${id}`);
    }
    return { message: 'Empleado eliminado correctamente' };
  }

  empleadoResponse(empleado: Empleado): EmpleadoResponse {
  const rolNombre = empleado.tipoRol?.nombre ?? null;
  const rol = rolNombre?.toLowerCase();
  return {
    id: String(empleado.id),
    nombre: empleado.nombre,
    apellido: '',
    dni: empleado.dni,
    idTipoRol: empleado.idTipoRol,
    rolNombre,
    rol: rol === 'mozo' || rol === 'admin' ? rol : null,
    activo: null,
  };
}

}
