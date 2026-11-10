import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Empleado } from './entities/empleado.entity';
import { EmpleadoTipoRol } from './entities/empleado-tipo-rol.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EmpleadoRepository {
  constructor(
    @InjectRepository(Empleado)
    private readonly repository: Repository<Empleado>,
  ) {}

  async findRoles(): Promise<EmpleadoTipoRol[]> {
    return this.repository.manager
      .getRepository(EmpleadoTipoRol)
      .find({ order: { nombre: 'ASC' } });
  }

  async existeRol(id: number): Promise<boolean> {
    return this.repository.manager
      .getRepository(EmpleadoTipoRol)
      .existsBy({ id });
  }

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

  async findByDniConPassword(dni: string): Promise<Empleado | null> {
    return this.repository
      .createQueryBuilder('empleado')
      .addSelect('empleado.passwordHash')
      .leftJoinAndSelect('empleado.tipoRol', 'tipoRol')
      .where('empleado.dni = :dni', { dni })
      .getOne();
  }

  async create(empleado: Partial<Empleado>): Promise<Empleado> {
    const nuevoEmpleado = this.repository.create(empleado);

    const guardado = await this.repository.save(nuevoEmpleado);
    return (await this.findById(guardado.id))!;
  }

  async update(id: number, datos: Partial<Empleado>): Promise<Empleado | null> {
    const empleado = await this.repository.preload({
      id,
      ...datos,
    });

    if (!empleado) {
      return null;
    }

    const guardado = await this.repository.save(empleado);
    return this.findById(guardado.id);
  }

  async delete(id: number): Promise<boolean> {
    const resultado = await this.repository.delete(id);

    return (resultado.affected ?? 0) > 0;
  }
}
