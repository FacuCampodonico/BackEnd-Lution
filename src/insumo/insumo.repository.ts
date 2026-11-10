import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import  { CrearInsumoDto } from './dto/crear-insumo.dto';
import  { Insumo } from './entities/insumo.entity';
import { Repository } from 'typeorm';

@Injectable()
export class InsumoRepository {
  constructor(
    @InjectRepository(Insumo)
    private readonly repository: Repository<Insumo>,
  ) {}

  async findById(id: number): Promise<Insumo | null> {
    return this.repository.findOne({
      where: { id },
    });
  }
  
  async findAll(): Promise<Insumo[]> {
    return this.repository.find();
  }

  async create(
    insumo: Partial<Insumo>,
  ): Promise<Insumo> {
    const nuevoInsumo =
      this.repository.create(insumo);

    return this.repository.save(nuevoInsumo);
  }

  async update(
    id: number,
    datos: Partial<Insumo>,
  ): Promise<Insumo | null> {
    const insumo = await this.repository.preload({
      id,
      ...datos,
    });

    if (!insumo) {
      return null;
    }

    return this.repository.save(insumo);
  }

  async delete(id: number): Promise<boolean> {
    const resultado =
      await this.repository.delete(id);

    return (resultado.affected ?? 0) > 0;
  }
}
