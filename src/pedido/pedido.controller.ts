import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CrearPedidoDto } from './dto/crear-pedido.dto';
import { PedidoService } from './pedido.service';
import { Pedido } from './entities/pedido.entity';
import { ActualizarPedidoDto } from './dto/actualizar-pedido.dto';
import { PedidoProducto } from './entities/pedido-producto.entity';
import { CrearPedidoProductoDto } from './dto/crear-pedido-producto.dto';
import { ActualizarPedidoProductoDto } from './dto/actualizar-pedido-producto.dto';
import { CrearPagoDto } from '../pago/dto/crear-pago.dto';

@Controller('pedidos')
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  @Get()
  getAll(): Promise<Pedido[]> {
    return this.pedidoService.findAll();
  }

  // @Post()
  // @HttpCode(HttpStatus.CREATED)
  // crear(@Body() datos: CrearPedidoDto): Promise<Pedido> {
  //   return this.pedidoService.create(datos);
  // }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number): Promise<Pedido> {
    return this.pedidoService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarPedidoDto,
  ) {
    return this.pedidoService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.pedidoService.delete(id);

    return {
      message: 'Pedido eliminado correctamente',
    };
  }

  @Get(':id/items')
  getProductos(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PedidoProducto[]> {
    return this.pedidoService.findProductos(id);
  }

  @Post(':pedidoId/pago')
  @HttpCode(HttpStatus.OK)
  registrarPago(
    @Param('pedidoId', ParseIntPipe) pedidoId: number,
    @Body() dto: CrearPagoDto,
  ) {
    return this.pedidoService.registrarPago(pedidoId, dto);
  }

  @Post(':pedidoId/items')
  @HttpCode(HttpStatus.CREATED)
  agregarProducto(
    @Param('pedidoId', ParseIntPipe) pedidoId: number,
    @Body() dto: CrearPedidoProductoDto,
  ): Promise<PedidoProducto> {
    return this.pedidoService.agregarProducto(pedidoId, dto);
  }

  @Patch(':pedidoId/items/:itemId')
  actualizarProducto(
    @Param('pedidoId', ParseIntPipe) pedidoId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: ActualizarPedidoProductoDto,
  ) {
    return this.pedidoService.actualizarProducto(pedidoId, itemId, dto);
  }

  @Delete(':pedidoId/items/:itemId')
  async removeItem(
    @Param('pedidoId', ParseIntPipe) pedidoId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    await this.pedidoService.eliminarProducto(pedidoId, itemId);

    return {
      message: 'Producto eliminado del pedido correctamente',
    };
  }
}