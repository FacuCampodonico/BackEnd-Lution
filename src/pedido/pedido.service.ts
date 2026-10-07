import {
  pedidoResponse,
  pedidoItemResponse,
  type PedidoResponse,
  type PedidoItemResponse,
} from './dto/pedido-response.dto';
import type { PagoRegistradoResponse } from '../pago/dto/pago-registrado-response.dto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PedidoRepository } from './pedido.repository';
import { PedidoProductoRepository } from './pedido-producto.repository';
import { ProductoService } from '../producto/services/producto.service';
import { ActualizarPedidoDto } from './dto/actualizar-pedido.dto';
import { CrearPedidoProductoDto } from './dto/crear-pedido-producto.dto';
import { ActualizarPedidoProductoDto } from './dto/actualizar-pedido-producto.dto';
import { CrearPedidoMesaDto } from './dto/crear-pedido-mesa.dto';
import { Pedido, EstadoPedido } from './entities/pedido.entity';
import { EstadoMesa } from '../mesa/entities/mesa.entity';
import { ProductoRepository } from '../producto/repositories/producto.repository';
import { PagoRepository } from '../pago/pago.repository';
import { MesaRepository } from '../mesa/mesa.repository';
import { CrearPagoDto } from '../pago/dto/crear-pago.dto';
import { TipoPago } from '../pago/enums/tipo-pago.enum';

@Injectable()
export class PedidoService {
  constructor(
    private readonly pedidoRepository: PedidoRepository,
    private readonly pedidoProductoRepository: PedidoProductoRepository,
    private readonly productoService: ProductoService,
    private readonly dataSource: DataSource,
    private readonly pagoRepository: PagoRepository,
    private readonly mesaRepository: MesaRepository,
    private readonly productoRepository: ProductoRepository,
  ) {}

  async obtenerPedidoAbiertoPorMesa(
    mesaId: number,
  ): Promise<PedidoResponse | null> {
    const pedido = await this.pedidoRepository.findPedidoAbiertoByMesa(mesaId);

    if (!pedido) {
      return null;
    }

    return pedidoResponse(pedido);
  }

  obtenerPedidoPorId(id: number): Promise<PedidoResponse> {
    return this.findById(id);
  }

  async crearPedidoPorMesa(
    mesaId: number,
    dto: CrearPedidoMesaDto,
  ): Promise<PedidoResponse | null> {
    return this.dataSource.transaction(async (manager) => {
      const mesa = await this.mesaRepository.findOne(mesaId, manager);
      if (!mesa) {
        throw new NotFoundException(`La mesa con ID ${mesaId} no existe`);
      }

      const pedidoExistente =
        await this.pedidoRepository.findPedidoAbiertoByMesa(mesaId, manager);

      if (pedidoExistente) {
        throw new ConflictException(
          `La mesa ${mesaId} ya tiene un pedido abierto activo`,
        );
      }

      const pedidoGuardado = await this.pedidoRepository.create(
        {
          mesaId,
          empleadoId: dto.empleadoId || null,
          estado: EstadoPedido.ABIERTO,
          fechaHoraInicio: new Date(),
        },
        manager,
      );

      for (const itemDto of dto.items) {
        const producto = await this.productoRepository.findOne(
          itemDto.productoId,
          manager,
        );
        if (!producto) {
          throw new NotFoundException(
            `El producto con ID ${itemDto.productoId} no existe`,
          );
        }

        await this.pedidoProductoRepository.create(
          pedidoGuardado.id,
          itemDto,
          manager,
        );
      }

      mesa.estado = EstadoMesa.ABIERTA;
      await this.mesaRepository.save(mesa, manager);

      const pedido = await this.pedidoRepository.findPedidoAbiertoByMesa(
        mesaId,
        manager,
      );
      return pedido ? pedidoResponse(pedido) : null;
    });
  }

  async registrarPago(
    pedidoId: number,
    dto: CrearPagoDto,
  ): Promise<PagoRegistradoResponse> {
    return this.dataSource.transaction(async (manager) => {
      const pedido = await this.pedidoRepository.findParaPago(
        pedidoId,
        manager,
      );

      if (!pedido) {
        throw new NotFoundException(`El pedido con ID ${pedidoId} no existe`);
      }

      if (pedido.estado === EstadoPedido.PAGADO) {
        throw new ConflictException(
          `El pedido con ID ${pedidoId} ya fue pagado`,
        );
      }

      const totalCalculado = (pedido.pedidosProductos || []).reduce(
        (acc, item) => {
          const precio = Number(item.producto?.precio || 0);
          return acc + precio * item.cantidad;
        },
        0,
      );

      let vuelto = 0;
      if (dto.tipo === TipoPago.EFECTIVO) {
        if (!dto.pagaCon || dto.pagaCon < totalCalculado) {
          throw new BadRequestException(
            `El monto abonado ($${dto.pagaCon || 0}) es insuficiente para cubrir el total ($${totalCalculado})`,
          );
        }
        vuelto = dto.pagaCon - totalCalculado;
      }

      await this.pagoRepository.create(
        {
          tipo: dto.tipo,
          pagaCon: dto.pagaCon || undefined,
          vuelto: dto.tipo === TipoPago.EFECTIVO ? vuelto : undefined,
          titular: dto.titular || undefined,
          marca: dto.marca || undefined,
          cuotas: dto.cuotas || undefined,
          pedido: { id: pedido.id },
        },
        manager,
      );

      pedido.estado = EstadoPedido.PAGADO;
      pedido.total = totalCalculado;
      pedido.fechaHoraCierre = new Date();
      await this.pedidoRepository.save(pedido, manager);

      if (pedido.mesa) {
        pedido.mesa.estado = EstadoMesa.POR_PAGAR;
        await this.mesaRepository.save(pedido.mesa, manager);
      }

      return {
        message: 'Pago registrado con éxito',
        pedidoId: String(pedido.id),
        total: totalCalculado,
        vuelto: dto.tipo === TipoPago.EFECTIVO ? vuelto : 0,
      };
    });
  }

  async findAll(): Promise<PedidoResponse[]> {
    return (await this.pedidoRepository.findAll()).map(pedidoResponse);
  }

  async findById(id: number): Promise<PedidoResponse> {
    return pedidoResponse(await this.findEntityById(id));
  }

  async update(
    id: number,
    actualizarPedidoDto: ActualizarPedidoDto,
  ): Promise<PedidoResponse | null> {
    await this.findEntityById(id);
    const actualizado = await this.pedidoRepository.update(
      id,
      actualizarPedidoDto,
    );
    return actualizado ? pedidoResponse(actualizado) : null;
  }

  async delete(id: number) {
    await this.findEntityById(id);
    await this.pedidoRepository.remove(id);
    return { message: 'Pedido eliminado correctamente' };
  }

  async findProductos(pedidoId: number): Promise<PedidoItemResponse[]> {
    await this.findEntityById(pedidoId);
    return (await this.pedidoProductoRepository.findByPedido(pedidoId)).map(
      pedidoItemResponse,
    );
  }

  async agregarProducto(
    pedidoId: number,
    dto: CrearPedidoProductoDto,
  ): Promise<PedidoResponse> {
    await this.findPedidoAbierto(pedidoId);
    await this.productoService.findOne(dto.productoId);
    await this.pedidoProductoRepository.create(pedidoId, dto);
    return this.obtenerPedidoPorId(pedidoId);
  }

  async actualizarProducto(
    pedidoId: number,
    itemId: number,
    dto: ActualizarPedidoProductoDto,
  ): Promise<PedidoResponse> {
    await this.findPedidoAbierto(pedidoId);
    await this.findItem(pedidoId, itemId);
    await this.pedidoProductoRepository.update(pedidoId, itemId, dto);
    return this.obtenerPedidoPorId(pedidoId);
  }

  async eliminarProducto(
    pedidoId: number,
    itemId: number,
  ): Promise<PedidoResponse> {
    await this.findPedidoAbierto(pedidoId);
    await this.findItem(pedidoId, itemId);
    await this.pedidoProductoRepository.remove(pedidoId, itemId);
    return this.obtenerPedidoPorId(pedidoId);
  }

  private async findEntityById(id: number): Promise<Pedido> {
    const pedido = await this.pedidoRepository.findOne(id);
    if (!pedido) {
      throw new NotFoundException(`pedido con ID ${id} no encontrada`);
    }
    return pedido;
  }

  private async findPedidoAbierto(id: number) {
    const pedido = await this.findEntityById(id);
    if (pedido.fechaHoraCierre) {
      throw new BadRequestException(
        `El pedido con ID ${id} está cerrado y no se puede modificar`,
      );
    }
    return pedido;
  }

  private async findItem(pedidoId: number, itemId: number) {
    const item = await this.pedidoProductoRepository.findOne(pedidoId, itemId);
    if (!item) {
      throw new NotFoundException(
        `Item con ID ${itemId} no encontrado en el pedido ${pedidoId}`,
      );
    }
    return item;
  }
}
