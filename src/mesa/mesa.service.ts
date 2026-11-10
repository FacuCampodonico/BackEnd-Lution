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
import { EstadoMesa, Mesa } from './entities/mesa.entity';
import { Pedido, EstadoPedido } from '../pedido/entities/pedido.entity';
import { type MesaResponse } from './dto/mesa-response.dto';
import { pedidoResponse } from 'src/pedido/dto/pedido-response.dto';

@Injectable()
export class MesaService {
  constructor(
    private readonly mesaRepository: MesaRepository,
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
  ) {}

  async create(crearMesaDto: CrearMesaDto): Promise<MesaResponse> {
    return this.mesaResponse(await this.mesaRepository.create(crearMesaDto));
  }

  async findAll(): Promise<MesaResponse[]> {
    return (await this.mesaRepository.findAll()).map(this.mesaResponse);
  }

  async findOne(id: number): Promise<MesaResponse> {
    const mesa = await this.mesaRepository.findOne(id);
    if (!mesa) {
      throw new NotFoundException(`Mesa con ID ${id} no encontrada`);
    }
    return this.mesaResponse(mesa);
  }

  async update(
    id: number,
    actualizarMesaDto: ActualizarMesaDto,
  ): Promise<MesaResponse | null> {
    await this.findOne(id);
    const actualizado = await this.mesaRepository.update(id, actualizarMesaDto);
    return actualizado ? this.mesaResponse(actualizado) : null;
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

    await this.mesaRepository.update(mesaId, { estado: EstadoMesa.LIBRE });

    return {
      message: `Mesa ${mesa.numero} liberada correctamente`,
      estado: EstadoMesa.LIBRE,
    };
  }

  mesaResponse(mesa: Mesa): MesaResponse {
  const abierto = mesa.pedidos?.find(
    (pedido) => pedido.estado === EstadoPedido.ABIERTO,
  );
  const pedido = abierto ? pedidoResponse(abierto) : null;
  return {
    id: String(mesa.id),
    numero: String(mesa.numero),
    estado: mesa.estado,
    pedidoActualId: pedido?.id ?? null,
    totalActual: pedido?.total ?? 0,
    cantidadItems:
      pedido?.items.reduce((suma, item) => suma + item.cantidad, 0) ?? 0,
  };
}
}
