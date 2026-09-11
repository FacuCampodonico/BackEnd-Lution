import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from './entities/pedido.entity';
import { CrearPedidoDto } from './dto/crear-pedido.dto';
import { ActualizarPedidoDto } from './dto/actualizar-pedido.dto';

@Injectable()
export class PedidoRepository {
  constructor(
    @InjectRepository(Pedido)
    private readonly repository: Repository<Pedido>,
  ) {}

//   async create(crearPedidoDto: CrearPedidoDto): Promise<Pedido> {
//     const nuevaPedido = this.repository.create(crearPedidoDto);
//     return await this.repository.save(nuevaPedido);
//   }

  async findAll(): Promise<Pedido[]> {
    return await this.repository.find();
  }

  async findOne(id: number): Promise<Pedido | null> {
    return await this.repository.findOneBy({ id });
  }

  async update(id: number, actualizarPedidoDto: ActualizarPedidoDto): Promise<Pedido | null> {
    await this.repository.update(id, actualizarPedidoDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}