import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MesaRepository } from './mesa.repository';
import { CrearMesaDto } from './dto/crear-mesa.dto';
import { ActualizarMesaDto } from './dto/actualizar-mesa.dto';
import { Mesa, EstadoMesa } from './entities/mesa.entity';
import { Pedido, EstadoPedido } from '../pedido/entities/pedido.entity';

@Injectable()
export class MesaService {
  constructor(
    private readonly mesaRepository: MesaRepository,
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
  ) {}

  create(crearMesaDto: CrearMesaDto) {
    return this.mesaRepository.create(crearMesaDto);
  }

  findAll() {
    return this.mesaRepository.findAll();
  }

  async findOne(id: number) {
    const mesa = await this.mesaRepository.findOne(id);
    if (!mesa) {
      throw new NotFoundException(`Mesa con ID ${id} no encontrada`);
    }
    return mesa;
  }

  async update(id: number, actualizarMesaDto: ActualizarMesaDto) {
    await this.findOne(id);
    return this.mesaRepository.update(id, actualizarMesaDto);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.mesaRepository.remove(id);
  }


  async cerrarMesa(mesaId: number) {
    const mesa = await this.findOne(mesaId);

    const pedidoAbierto = await this.pedidoRepository.findOne({
      where: { mesaId, estado: EstadoPedido.ABIERTO },
    });

    if (pedidoAbierto) {
      throw new BadRequestException(
        `No se puede liberar la mesa ${mesaId} porque tiene un pedido abierto sin cobrar`,
      );
    }

    mesa.estado = EstadoMesa.LIBRE;
    await this.mesaRepository.update(mesaId, { estado: EstadoMesa.LIBRE });

    return {
      message: `Mesa ${mesa.numero} liberada correctamente`,
      estado: EstadoMesa.LIBRE,
    };
  }
}