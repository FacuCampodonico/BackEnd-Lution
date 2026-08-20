import { Injectable, NotFoundException } from '@nestjs/common';
import { MesaRepository } from './mesa.repository';
import { CrearMesaDto } from './dto/crear-mesa.dto';
import { ActualizarMesaDto } from './dto/actualizar-mesa.dto';

@Injectable()
export class MesaService {
  constructor(private readonly mesaRepository: MesaRepository) {}

  create(crearMesaDto: CrearMesaDto) {
    return this.mesaRepository.create(crearMesaDto);
  }

  findAll() {
    return this.mesaRepository.findAll();
  }

  async findOne(id: number) {
    const mesa = await this.mesaRepository.findOne(id);
    if (!mesa) {
      throw new NotFoundException(`Mesa con ID ${id} no encontrada`);
    }
    return mesa;
  }

  async update(id: number, actualizarMesaDto: ActualizarMesaDto) {
    await this.findOne(id);
    return this.mesaRepository.update(id, actualizarMesaDto);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.mesaRepository.remove(id);
  }
}