import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type EntityManager } from 'typeorm';
import { EstadoMesa, Mesa } from './entities/mesa.entity';
import { EstadoPedido } from '../pedido/entities/pedido.entity';
import { CrearMesaDto } from './dto/crear-mesa.dto';
import { ActualizarMesaDto } from './dto/actualizar-mesa.dto';

@Injectable()
export class MesaRepository {
  constructor(
    @InjectRepository(Mesa)
    private readonly repository: Repository<Mesa>,
  ) {}

  async create(crearMesaDto: CrearMesaDto): Promise<Mesa> {
    const nuevaMesa = this.repository.create(crearMesaDto);
    return await this.repository.save(nuevaMesa);
  }

  async findAll(): Promise<Mesa[]> {
    return this.conPedidoAbierto().getMany();
  }

  async findOne(id: number, manager?: EntityManager): Promise<Mesa | null> {
    return this.conPedidoAbierto(manager)
      .where('mesa.id = :id', { id })
      .getOne();
  }

  async actualizarEstado(
    id: number,
    estado: EstadoMesa,
    manager: EntityManager,
  ): Promise<void> {
    await manager.getRepository(Mesa).update(id, { estado });
  }

  private conPedidoAbierto(manager?: EntityManager) {
    const repository = manager ? manager.getRepository(Mesa) : this.repository;
    return repository
      .createQueryBuilder('mesa')
      .leftJoinAndSelect('mesa.pedidos', 'pedido', 'pedido.estado = :estado', {
        estado: EstadoPedido.ABIERTO,
      })
      .leftJoinAndSelect('pedido.pedidosProductos', 'item')
      .leftJoinAndSelect('item.producto', 'producto');
  }

  async update(
    id: number,
    actualizarMesaDto: ActualizarMesaDto,
  ): Promise<Mesa | null> {
    await this.repository.update(id, actualizarMesaDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
