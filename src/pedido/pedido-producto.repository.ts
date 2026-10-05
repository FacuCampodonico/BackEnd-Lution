import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PedidoProducto } from './entities/pedido-producto.entity';
import { CrearPedidoProductoDto } from './dto/crear-pedido-producto.dto';
import { ActualizarPedidoProductoDto } from './dto/actualizar-pedido-producto.dto';

@Injectable()
export class PedidoProductoRepository {
  constructor(
    @InjectRepository(PedidoProducto)
    private readonly repository: Repository<PedidoProducto>,
  ) {}

  async create(
    pedidoId: number,
    crearDto: CrearPedidoProductoDto,
  ): Promise<PedidoProducto> {
    const nuevo = this.repository.create({ ...crearDto, pedidoId });
    return await this.repository.save(nuevo);
  }

  async findByPedido(pedidoId: number): Promise<PedidoProducto[]> {
    return await this.repository.find({
      where: { pedidoId },
      relations: {
        producto: true,
      },
    });
  }

  async findOne(pedidoId: number, id: number): Promise<PedidoProducto | null> {
    return await this.repository.findOne({
      where: { id, pedidoId },
      relations: {
        producto: true,
      },
    });
  }

  async update(
    pedidoId: number,
    id: number,
    actualizarDto: ActualizarPedidoProductoDto,
  ): Promise<PedidoProducto | null> {
    await this.repository.update({ id, pedidoId }, actualizarDto);
    return this.findOne(pedidoId, id);
  }

  async remove(pedidoId: number, id: number): Promise<void> {
    await this.repository.delete({ id, pedidoId });
  }
}
