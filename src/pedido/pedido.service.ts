


import { Injectable, NotFoundException } from '@nestjs/common';
import { pedidoRepository } from './pedido.repository';
import { CrearPedidoDto } from './dto/crear-pedido.dto';
import { ActualizarPedidoDto } from './dto/actualizar-pedido.dto';

@Injectable()
export class PedidoService {
  constructor(private readonly pedidoRepository: pedidoRepository) {}

  create(crearpedidoDto: CrearPedidoDto) {
    return this.pedidoRepository.create(crearpedidoDto);
  }

  findAll() {
    return this.pedidoRepository.findAll();
  }

  async findById(id: number) {
    const pedido = await this.pedidoRepository.findOne(id);
    if (!pedido) {
      throw new NotFoundException(`pedido con ID ${id} no encontrada`);
    }
    return pedido;
  }
  
  async update(id: number, ActualizarPedidoDto: ActualizarPedidoDto) {
    await this.findById(id);
    return this.pedidoRepository.update(id, ActualizarPedidoDto);
  }

  async delete(id: number) {
    await this.findById(id);
    return this.pedidoRepository.remove(id);
  }
}