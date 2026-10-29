import {
  pedidoResponse,
  pedidoItemResponse,
  type PedidoResponse,
  type PedidoItemResponse,
  type PedidosPaginadosResponse,
} from './dto/pedido-response.dto';
import type { PagoRegistradoResponse } from '../pago/dto/pago-registrado-response.dto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, type EntityManager } from 'typeorm';
import { PedidoRepository } from './pedido.repository';
import { PedidoProductoRepository } from './pedido-producto.repository';
import { ProductoService } from '../producto/services/producto.service';
import { ActualizarPedidoDto } from './dto/actualizar-pedido.dto';
import { CrearPedidoProductoDto } from './dto/crear-pedido-producto.dto';
import { ActualizarPedidoProductoDto } from './dto/actualizar-pedido-producto.dto';
import { CrearPedidoMesaDto } from './dto/crear-pedido-mesa.dto';
import { ListarPedidosDto } from './dto/listar-pedidos.dto';
import { Pedido, EstadoPedido } from './entities/pedido.entity';
import { EstadoMesa } from '../mesa/entities/mesa.entity';
import { ProductoRepository } from '../producto/repositories/producto.repository';
import { PagoService } from '../pago/pago.service';
import { MesaRepository } from '../mesa/mesa.repository';
import { EmpleadoRepository } from '../empleado/empleado.repository';
import { CrearPagoDto } from '../pago/dto/crear-pago.dto';
import { TipoPago } from '../pago/enums/tipo-pago.enum';
import type { Producto } from '../producto/entities/producto.entity';
import {
  StockService,
  calcularConsumo,
  type ConsumoStock,
} from '../insumo/stock.service';

@Injectable()
export class PedidoService {
  constructor(
    private readonly pedidoRepository: PedidoRepository,
    private readonly pedidoProductoRepository: PedidoProductoRepository,
    private readonly productoService: ProductoService,
    private readonly dataSource: DataSource,
    private readonly pagoService: PagoService,
    private readonly mesaRepository: MesaRepository,
    private readonly productoRepository: ProductoRepository,
    private readonly empleadoRepository: EmpleadoRepository,
    private readonly stockService: StockService,
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
    dto: CrearPedidoMesaDto & { empleadoId: number },
    permitirSinStock = false,
  ): Promise<PedidoResponse | null> {
    return this.dataSource.transaction(async (manager) => {
      const mesa = await this.mesaRepository.findOne(mesaId, manager);
      if (!mesa) {
        throw new NotFoundException(`La mesa con ID ${mesaId} no existe`);
      }

      const empleado = await this.empleadoRepository.findById(dto.empleadoId);
      if (!empleado) {
        throw new NotFoundException(
          `El empleado con ID ${dto.empleadoId} no existe`,
        );
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
          empleadoId: dto.empleadoId,
          estado: EstadoPedido.ABIERTO,
          fechaHoraInicio: new Date(),
        },
        manager,
      );

      const consumidos: { producto: Producto; cantidad: number }[] = [];
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
        consumidos.push({ producto, cantidad: itemDto.cantidad });
      }

      await this.stockService.ajustar(
        calcularConsumo(consumidos),
        manager,
        permitirSinStock,
      );

      await this.mesaRepository.actualizarEstado(
        mesaId,
        EstadoMesa.ABIERTA,
        manager,
      );

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

      await this.pagoService.create(
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
        await this.mesaRepository.actualizarEstado(
          pedido.mesa.id,
          EstadoMesa.LIBRE,
          manager,
        );
      }

      return {
        message: 'Pago registrado con éxito',
        pedidoId: String(pedido.id),
        total: totalCalculado,
        vuelto: dto.tipo === TipoPago.EFECTIVO ? vuelto : 0,
      };
    });
  }

  async findPaginado(
    filtros: ListarPedidosDto,
  ): Promise<PedidosPaginadosResponse> {
    const [pedidos, total] = await this.pedidoRepository.findPaginado(filtros);
    return {
      data: pedidos.map(pedidoResponse),
      total,
      pagina: filtros.pagina,
      limite: filtros.limite,
    };
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
    const pedido = await this.findEntityById(id);

    if (pedido.estado !== EstadoPedido.ABIERTO) {
      throw new ConflictException(
        `El pedido con ID ${id} ya fue pagado y no se puede cancelar`,
      );
    }

    await this.dataSource.transaction(async (manager) => {
      await this.stockService.ajustar(
        await this.consumoDe(pedido.pedidosProductos ?? [], manager, -1),
        manager,
      );
      await this.mesaRepository.actualizarEstado(
        pedido.mesaId,
        EstadoMesa.LIBRE,
        manager,
      );
      await this.pedidoRepository.remove(id, manager);
    });

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
    permitirSinStock = false,
  ): Promise<PedidoResponse> {
    await this.findPedidoAbierto(pedidoId);
    await this.productoService.findOne(dto.productoId);
    await this.dataSource.transaction(async (manager) => {
      await this.pedidoProductoRepository.create(pedidoId, dto, manager);
      await this.stockService.ajustar(
        await this.consumoDe([dto], manager),
        manager,
        permitirSinStock,
      );
    });
    return this.obtenerPedidoPorId(pedidoId);
  }

  async actualizarProducto(
    pedidoId: number,
    itemId: number,
    dto: ActualizarPedidoProductoDto,
    permitirSinStock = false,
  ): Promise<PedidoResponse> {
    await this.findPedidoAbierto(pedidoId);
    await this.dataSource.transaction(async (manager) => {
      const item = await this.findItem(pedidoId, itemId, manager);
      await this.pedidoProductoRepository.update(
        pedidoId,
        itemId,
        dto,
        manager,
      );
      if (dto.cantidad !== undefined && dto.cantidad !== item.cantidad) {
        // Solo se mueve la diferencia: positiva descuenta, negativa devuelve.
        const diferencia = dto.cantidad - item.cantidad;
        await this.stockService.ajustar(
          await this.consumoDe(
            [{ productoId: item.productoId, cantidad: diferencia }],
            manager,
          ),
          manager,
          permitirSinStock,
        );
      }
    });
    return this.obtenerPedidoPorId(pedidoId);
  }

  async eliminarProducto(
    pedidoId: number,
    itemId: number,
  ): Promise<PedidoResponse> {
    await this.findPedidoAbierto(pedidoId);
    await this.dataSource.transaction(async (manager) => {
      const item = await this.findItem(pedidoId, itemId, manager);
      await this.pedidoProductoRepository.remove(pedidoId, itemId, manager);
      await this.stockService.ajustar(
        await this.consumoDe([item], manager, -1),
        manager,
      );
    });
    return this.obtenerPedidoPorId(pedidoId);
  }

  /** Consumo de stock de los ítems según la receta actual de cada producto. */
  private async consumoDe(
    items: { productoId: number; cantidad: number }[],
    manager: EntityManager,
    signo: 1 | -1 = 1,
  ): Promise<ConsumoStock> {
    const conProducto: { producto: Producto; cantidad: number }[] = [];
    for (const item of items) {
      const producto = await this.productoRepository.findOne(
        item.productoId,
        manager,
      );
      if (producto) conProducto.push({ producto, cantidad: item.cantidad });
    }
    return calcularConsumo(conProducto, signo);
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

  private async findItem(
    pedidoId: number,
    itemId: number,
    manager?: EntityManager,
  ) {
    const item = await this.pedidoProductoRepository.findOne(
      pedidoId,
      itemId,
      manager,
    );
    if (!item) {
      throw new NotFoundException(
        `Item con ID ${itemId} no encontrado en el pedido ${pedidoId}`,
      );
    }
    return item;
  }
}
