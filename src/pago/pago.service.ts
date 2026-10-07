import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PagoRepository } from './pago.repository';
import { CrearPagoDto } from './dto/crear-pago.dto';
import { ActualizarPagoDto } from './dto/actualiza-pago.dto';
import { TipoPago } from './enums/tipo-pago.enum'; 
import { PedidoRepository } from '../pedido/pedido.repository'; 

@Injectable()
export class PagoService {
  constructor(
    private readonly pagoRepository: PagoRepository,
    private readonly pedidoRepository: PedidoRepository,
  ) {}

  async create(crearPagoDto: CrearPagoDto) {
    const pedidoId = (crearPagoDto as any).pedidoId;
    const pedido = await this.pedidoRepository.findOne(pedidoId);

    if (!pedido) {
      throw new NotFoundException(`Pedido con ID ${pedidoId} no encontrado`);
    }

    const totalPedido = pedido.total ?? 0;
    const pagaCon = crearPagoDto.pagaCon ?? 0;

    if (crearPagoDto.tipo === TipoPago.EFECTIVO && pagaCon < totalPedido) {
      throw new BadRequestException('El monto abonado es insuficiente para cubrir el total');
    }

    return this.pagoRepository.create(crearPagoDto);
  }

  findAll() {
    return this.pagoRepository.findAll();
  }

  async findOne(id: number) {
    const pago = await this.pagoRepository.findOne(id);
    if (!pago) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }

    return pago;
  }

  async update(id: number, actualizarPagoDto: ActualizarPagoDto) {
    await this.findOne(id);
    return this.pagoRepository.update(id, actualizarPagoDto);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.pagoRepository.remove(id);
  }
}