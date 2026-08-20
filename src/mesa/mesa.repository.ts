import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mesa } from './entities/mesa.entity';
import { CrearMesaDto } from './dto/crear-mesa.dto';
import { ActualizarMesaDto } from './dto/actualizar-mesa.dto';

@Injectable()
export class MesaRepository {
  constructor(
    @InjectRepository(Mesa)
    private readonly repository: Repository<Mesa>,
  ) {}

  async create(crearMesaDto: CrearMesaDto): Promise<Mesa> {
    const nuevaMesa = this.repository.create(crearMesaDto);
    return await this.repository.save(nuevaMesa);
  }

  async findAll(): Promise<Mesa[]> {
    return await this.repository.find();
  }

  async findOne(id: number): Promise<Mesa | null> {
    return await this.repository.findOneBy({ id });
  }

  async update(id: number, actualizarMesaDto: ActualizarMesaDto): Promise<Mesa | null> {
    await this.repository.update(id, actualizarMesaDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}