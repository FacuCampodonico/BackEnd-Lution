import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  type DeepPartial,
  type EntityManager,
  type FindOptionsWhere,
} from 'typeorm';
import { Pedido, EstadoPedido } from './entities/pedido.entity';
import { ActualizarPedidoDto } from './dto/actualizar-pedido.dto';
import { ListarPedidosDto } from './dto/listar-pedidos.dto';

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

  async findPaginado(filtros: ListarPedidosDto): Promise<[Pedido[], number]> {
    const { mesaId, empleadoId, estado, pagina, limite } = filtros;
    // TypeORM 1.x rechaza claves undefined en el where: solo van los filtros presentes.
    const where: FindOptionsWhere<Pedido> = {};
    if (mesaId !== undefined) where.mesaId = mesaId;
    if (empleadoId !== undefined) where.empleadoId = empleadoId;
    if (estado !== undefined) where.estado = estado;
    return await this.repository.findAndCount({
      where,
      relations: { pedidosProductos: { producto: true }, empleado: true },
      order: { id: 'DESC' },
      skip: (pagina - 1) * limite,
      take: limite,
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
        pago: true,
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
