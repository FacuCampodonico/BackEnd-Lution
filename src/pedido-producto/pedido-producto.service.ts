import { Injectable, NotFoundException } from '@nestjs/common';
import { PedidoProductoRepository } from './pedido-producto.repository';
import { CrearPedidoProductoDto } from './dto/crear-pedido-producto.dto';
import { ActualizarPedidoProductoDto } from './dto/actualizar-pedido-producto.dto';

@Injectable()
export class PedidoProductoService {
  constructor(
    private readonly pedidoProductoRepository: PedidoProductoRepository,
  ) {}

  create(crearDto: CrearPedidoProductoDto) {
    return this.pedidoProductoRepository.create(crearDto);
  }

  findAll() {
    return this.pedidoProductoRepository.findAll();
  }

  async findById(id: number) {
    const item = await this.pedidoProductoRepository.findOne(id);
    if (!item) {
      throw new NotFoundException(`Detalle de pedido con ID ${id} no encontrado`);
    }
    return item;
  }

  findByPedido(pedidoId: number) {
    return this.pedidoProductoRepository.findByPedido(pedidoId);
  }

  async update(id: number, actualizarDto: ActualizarPedidoProductoDto) {
    await this.findById(id);
    return this.pedidoProductoRepository.update(id, actualizarDto);
  }

  async delete(id: number) {
    await this.findById(id);
    return this.pedidoProductoRepository.remove(id);
  }
}