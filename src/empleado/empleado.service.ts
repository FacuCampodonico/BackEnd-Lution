import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EmpleadoRepository } from './empleado.repository';
import type { CrearEmpleadoDto } from './dto/crear-empleado.dto';
import type { Empleado } from './entities/empleado.entity';


@Injectable()
export class EmpleadoService {
  constructor(private readonly empleadoRepository: EmpleadoRepository) {}

  async findAll(): Promise<Empleado[]> {
    return this.empleadoRepository.findAll();
  }

  async findById(id: number): Promise<Empleado> {
    const empleado = await this.empleadoRepository.findById(id);

    if (!empleado) {
      throw new NotFoundException(
        `No existe un empleado con id ${id}`,
      );
    }

    return empleado;
  }

  async findByDni(dni: string): Promise<Empleado> {
    const empleado = await this.empleadoRepository.findByDni(dni);

    if (!empleado) {
      throw new NotFoundException(
        `No existe un empleado con DNI ${dni}`,
      );
    }

    return empleado;
  }

  async create(dto: CrearEmpleadoDto): Promise<Empleado> {
    const empleadoExistente =
      await this.empleadoRepository.findByDni(dto.dni);

    if (empleadoExistente) {
      throw new ConflictException(
        `Ya existe un empleado con DNI ${dto.dni}`,
      );
    }

    return this.empleadoRepository.create(dto);
  }

  async update(
    id: number,
    datos: Partial<Empleado>,
  ): Promise<Empleado> {
    const empleado = await this.empleadoRepository.update(
      id,
      datos,
    );

    if (!empleado) {
      throw new NotFoundException(
        `No existe un empleado con id ${id}`,
      );
    }

    return empleado;
  }

  async delete(id: number): Promise<void> {
    const eliminado = await this.empleadoRepository.delete(id);

    if (!eliminado) {
      throw new NotFoundException(
        `No existe un empleado con id ${id}`,
      );
    }
  }
}
