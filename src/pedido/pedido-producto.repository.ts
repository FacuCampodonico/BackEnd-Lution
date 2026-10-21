import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type EntityManager } from 'typeorm';
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
    manager?: EntityManager,
  ): Promise<PedidoProducto> {
    const repository = manager
      ? manager.getRepository(PedidoProducto)
      : this.repository;
    const nuevo = repository.create({ ...crearDto, pedidoId });
    return await repository.save(nuevo);
  }

  async findByPedido(pedidoId: number): Promise<PedidoProducto[]> {
    return await this.repository.find({
      where: { pedidoId },
      relations: {
        producto: true,
      },
    });
  }

  async findOne(
    pedidoId: number,
    id: number,
    manager?: EntityManager,
  ): Promise<PedidoProducto | null> {
    return await this.repositorio(manager).findOne({
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
    manager?: EntityManager,
  ): Promise<PedidoProducto | null> {
    await this.repositorio(manager).update({ id, pedidoId }, actualizarDto);
    return this.findOne(pedidoId, id, manager);
  }

  async remove(
    pedidoId: number,
    id: number,
    manager?: EntityManager,
  ): Promise<void> {
    await this.repositorio(manager).delete({ id, pedidoId });
  }

  private repositorio(manager?: EntityManager): Repository<PedidoProducto> {
    return manager ? manager.getRepository(PedidoProducto) : this.repository;
  }
}
