import { Injectable, NotFoundException } from '@nestjs/common';
import { PagoRepository } from './pago.repository';
import { ActualizarPagoDto } from './dto/actualiza-pago.dto';
import type { DeepPartial, EntityManager } from 'typeorm';
import { Pago } from './entities/pago.entity';

@Injectable()
export class PagoService {
  constructor(private readonly pagoRepository: PagoRepository) {}

  create(datos: DeepPartial<Pago>, manager?: EntityManager) {
    return this.pagoRepository.create(datos, manager);
  }

  findAll() {
    return this.pagoRepository.findAll();
  }

  async findOne(id: number) {
    const pago = await this.pagoRepository.findOne(id);
    if (!pago) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }

    return pago;
  }

  async update(id: number, actualizarPagoDto: ActualizarPagoDto) {
    await this.findOne(id);
    return this.pagoRepository.update(id, actualizarPagoDto);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.pagoRepository.remove(id);
  }
}
