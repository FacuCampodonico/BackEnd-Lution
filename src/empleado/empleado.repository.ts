import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import  { CrearEmpleadoDto } from './dto/crear-empleado.dto';
import  { Empleado } from './entities/empleado.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EmpleadoRepository {
  constructor(
    @InjectRepository(Empleado)
    private readonly repository: Repository<Empleado>,
  ) {}

   async findAll(): Promise<Empleado[]> {
    return this.repository.find({
      relations: {
        tipoRol: true,
      },
    });
  }

  async findById(id: number): Promise<Empleado | null> {
    return this.repository.findOne({
      where: { id },
      relations: {
        tipoRol: true,
      },
    });
  }

  async findByDni(dni: string): Promise<Empleado | null> {
    return this.repository.findOne({
      where: { dni },
      relations: {
        tipoRol: true,
      },
    });
  }

  async create(
    empleado: Partial<Empleado>,
  ): Promise<Empleado> {
    const nuevoEmpleado =
      this.repository.create(empleado);

    return this.repository.save(nuevoEmpleado);
  }

  async update(
    id: number,
    datos: Partial<Empleado>,
  ): Promise<Empleado | null> {
    const empleado = await this.repository.preload({
      id,
      ...datos,
    });

    if (!empleado) {
      return null;
    }

    return this.repository.save(empleado);
  }

  async delete(id: number): Promise<boolean> {
    const resultado =
      await this.repository.delete(id);

    return (resultado.affected ?? 0) > 0;
  }
}
