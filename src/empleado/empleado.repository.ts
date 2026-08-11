import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import  { CrearempleadoDto } from './dto/crear-empleado.dto';
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

}
