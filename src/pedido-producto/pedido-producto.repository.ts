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

  async create(crearPedidoProductoDto: CrearPedidoProductoDto): Promise<PedidoProducto> {
    const nuevo = this.repository.create(crearPedidoProductoDto);
    return await this.repository.save(nuevo);
  }

  async findAll(): Promise<PedidoProducto[]> {
    return await this.repository.find({
      relations: {
        producto: true,
        pedido: true,
      },
    });
  }

  async findOne(id: number): Promise<PedidoProducto | null> {
    return await this.repository.findOne({
      where: { id },
      relations: {
        producto: true,
        pedido: true,
      },
    });
  }

  async findByPedido(pedidoId: number): Promise<PedidoProducto[]> {
    return await this.repository.find({
      where: { pedidoId },
      relations: {
        producto: true,
      },
    });
  }

  async update(
    id: number,
    actualizarDto: ActualizarPedidoProductoDto,
  ): Promise<PedidoProducto | null> {
    await this.repository.update(id, actualizarDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}