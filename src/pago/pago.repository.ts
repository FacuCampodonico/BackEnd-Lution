import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type DeepPartial, type EntityManager } from 'typeorm';
import { Pago } from './entities/pago.entity';
import { ActualizarPagoDto } from './dto/actualiza-pago.dto';

@Injectable()
export class PagoRepository {
  constructor(
    @InjectRepository(Pago)
    private readonly repository: Repository<Pago>,
  ) {}

  async create(
    datos: DeepPartial<Pago>,
    manager?: EntityManager,
  ): Promise<Pago> {
    const repository = manager ? manager.getRepository(Pago) : this.repository;
    const nuevoPago = repository.create(datos);
    return await repository.save(nuevoPago);
  }

  async findAll(): Promise<Pago[]> {
    return await this.repository.find();
  }

  async findOne(id: number): Promise<Pago | null> {
    return await this.repository.findOneBy({ id });
  }

  async update(
    id: number,
    actualizarPagoDto: ActualizarPagoDto,
  ): Promise<Pago | null> {
    await this.repository.update(id, actualizarPagoDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
