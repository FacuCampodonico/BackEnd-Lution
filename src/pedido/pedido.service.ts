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
import { CrearPedidoDto } from './dto/crear-pedido.dto';
import { ActualizarPedidoDto } from './dto/actualizar-pedido.dto';
import { CrearPedidoProductoDto } from './dto/crear-pedido-producto.dto';
import { ActualizarPedidoProductoDto } from './dto/actualizar-pedido-producto.dto';
import { CrearPedidoMesaDto } from './dto/crear-pedido-mesa.dto';
import { Pedido, EstadoPedido } from './entities/pedido.entity';
import { Mesa, EstadoMesa } from '../mesa/entities/mesa.entity';
import { PedidoProducto } from './entities/pedido-producto.entity';
import { Producto } from '../producto/entities/producto.entity';

@Injectable()
export class PedidoService {
  constructor(
    private readonly pedidoRepository: PedidoRepository,
    private readonly pedidoProductoRepository: PedidoProductoRepository,
    private readonly productoService: ProductoService,
    private readonly dataSource: DataSource,
  ) {}

  async obtenerPedidoAbiertoPorMesa(mesaId: number) {
    const pedido = await this.pedidoRepository.findPedidoAbiertoByMesa(mesaId);

    if (!pedido) {
      return null;
    }

    const itemsFormateados = (pedido.pedidosProductos || []).map((item) => {
      const precioUnitario = Number(item.producto?.precio || 0);
      return {
        id: item.id,
        productoId: item.productoId,
        productoNombre: item.producto?.nombre || '',
        cantidad: item.cantidad,
        precioUnitario,
        subtotal: precioUnitario * item.cantidad,
      };
    });

    const total = itemsFormateados.reduce(
      (acc, item) => acc + item.subtotal,
      0,
    );

    return {
      id: pedido.id,
      mesaId: pedido.mesaId,
      empleadoId: pedido.empleadoId,
      estado: pedido.estado,
      fechaHoraInicio: pedido.fechaHoraInicio,
      total,
      items: itemsFormateados,
    };
  }

  async crearPedidoPorMesa(mesaId: number, dto: CrearPedidoMesaDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const mesa = await queryRunner.manager.findOne(Mesa, {
        where: { id: mesaId },
      });
      if (!mesa) {
        throw new NotFoundException(`La mesa con ID ${mesaId} no existe`);
      }

      const pedidoExistente = await queryRunner.manager.findOne(Pedido, {
        where: { mesaId, estado: EstadoPedido.ABIERTO },
      });

      if (pedidoExistente) {
        throw new ConflictException(
          `La mesa ${mesaId} ya tiene un pedido abierto activo`,
        );
      }

      const nuevoPedido = queryRunner.manager.create(Pedido, {
        mesaId,
        empleadoId: dto.empleadoId || null,
        estado: EstadoPedido.ABIERTO,
        fechaHoraInicio: new Date(),
      });
      const pedidoGuardado = await queryRunner.manager.save(nuevoPedido);

      for (const itemDto of dto.items) {
        const producto = await queryRunner.manager.findOne(Producto, {
          where: { id: itemDto.productoId },
        });
        if (!producto) {
          throw new NotFoundException(
            `El producto con ID ${itemDto.productoId} no existe`,
          );
        }

        const itemPedido = queryRunner.manager.create(PedidoProducto, {
          pedidoId: pedidoGuardado.id,
          productoId: itemDto.productoId,
          cantidad: itemDto.cantidad,
        });
        await queryRunner.manager.save(itemPedido);
      }

      mesa.estado = EstadoMesa.ABIERTA;
      await queryRunner.manager.save(mesa);

      await queryRunner.commitTransaction();

      return this.obtenerPedidoAbiertoPorMesa(mesaId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }


  findAll() {
    return this.pedidoRepository.findAll();
  }

  async findById(id: number) {
    const pedido = await this.pedidoRepository.findOne(id);
    if (!pedido) {
      throw new NotFoundException(`pedido con ID ${id} no encontrada`);
    }
    return pedido;
  }

  async update(id: number, actualizarPedidoDto: ActualizarPedidoDto) {
    await this.findById(id);
    return this.pedidoRepository.update(id, actualizarPedidoDto);
  }

  async delete(id: number) {
    await this.findById(id);
    return this.pedidoRepository.remove(id);
  }

  async findProductos(pedidoId: number) {
    await this.findById(pedidoId);
    return this.pedidoProductoRepository.findByPedido(pedidoId);
  }

  async agregarProducto(pedidoId: number, dto: CrearPedidoProductoDto) {
    await this.findPedidoAbierto(pedidoId);
    await this.productoService.findOne(dto.productoId);
    return this.pedidoProductoRepository.create(pedidoId, dto);
  }

  async actualizarProducto(
    pedidoId: number,
    itemId: number,
    dto: ActualizarPedidoProductoDto,
  ) {
    await this.findPedidoAbierto(pedidoId);
    await this.findItem(pedidoId, itemId);
    return this.pedidoProductoRepository.update(pedidoId, itemId, dto);
  }

  async eliminarProducto(pedidoId: number, itemId: number) {
    await this.findPedidoAbierto(pedidoId);
    await this.findItem(pedidoId, itemId);
    return this.pedidoProductoRepository.remove(pedidoId, itemId);
  }

  private async findPedidoAbierto(id: number) {
    const pedido = await this.findById(id);
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