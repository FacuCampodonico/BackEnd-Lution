import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type DeepPartial, type EntityManager } from 'typeorm';
import { Pedido, EstadoPedido } from './entities/pedido.entity';
import { ActualizarPedidoDto } from './dto/actualizar-pedido.dto';

@Injectable()
export class PedidoRepository {
  constructor(
    @InjectRepository(Pedido)
    private readonly repository: Repository<Pedido>,
  ) {}

  async create(
    datos: DeepPartial<Pedido>,
    manager: EntityManager,
  ): Promise<Pedido> {
    const repository = manager.getRepository(Pedido);
    return repository.save(datos);
  }

  async findAll(): Promise<Pedido[]> {
    return await this.repository.find({
      relations: { pedidosProductos: { producto: true }, empleado: true },
    });
  }

  async findOne(id: number): Promise<Pedido | null> {
    return await this.repository.findOne({
      where: { id },
      relations: { pedidosProductos: { producto: true }, empleado: true },
    });
  }

  async findParaPago(
    id: number,
    manager: EntityManager,
  ): Promise<Pedido | null> {
    return manager.getRepository(Pedido).findOne({
      where: { id },
      relations: {
        pedidosProductos: { producto: true },
        mesa: true,
      },
    });
  }

  async save(pedido: Pedido, manager: EntityManager): Promise<Pedido> {
    return manager.getRepository(Pedido).save(pedido);
  }

  async update(
    id: number,
    actualizarPedidoDto: ActualizarPedidoDto,
  ): Promise<Pedido | null> {
    await this.repository.update(id, actualizarPedidoDto);
    return this.findOne(id);
  }

  async remove(id: number, manager?: EntityManager): Promise<void> {
    const repository = manager
      ? manager.getRepository(Pedido)
      : this.repository;
    await repository.delete(id);
  }

  async findPedidoAbiertoByMesa(
    mesaId: number,
    manager?: EntityManager,
  ): Promise<Pedido | null> {
    const repository = manager
      ? manager.getRepository(Pedido)
      : this.repository;
    return await repository.findOne({
      where: {
        mesaId,
        estado: EstadoPedido.ABIERTO,
      },
      relations: {
        pedidosProductos: {
          producto: true,
        },
        empleado: true,
      },
    });
  }
}
