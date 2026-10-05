import { Injectable, NotFoundException } from '@nestjs/common';
import { PagoRepository } from './pago.repository';
import { CrearPagoDto } from './dto/crear-pago.dto';
import { ActualizarPagoDto } from './dto/actualiza-pago.dto';

@Injectable()
export class PagoService {
  constructor(private readonly pagoRepository: PagoRepository) {}

  create(crearPagoDto: CrearPagoDto) {
    return this.pagoRepository.create(crearPagoDto);
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