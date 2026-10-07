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
import { PedidoService } from './pedido.service';
import { ActualizarPedidoDto } from './dto/actualizar-pedido.dto';
import { CrearPedidoProductoDto } from './dto/crear-pedido-producto.dto';
import { ActualizarPedidoProductoDto } from './dto/actualizar-pedido-producto.dto';
import { CrearPagoDto } from '../pago/dto/crear-pago.dto';

@Controller('pedidos')
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  @Get()
  getAll() {
    return this.pedidoService.findAll();
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.pedidoService.obtenerPedidoPorId(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarPedidoDto,
  ) {
    return this.pedidoService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.pedidoService.delete(id);
  }

  @Get(':id/items')
  getProductos(@Param('id', ParseIntPipe) id: number) {
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
  ) {
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
  removeItem(
    @Param('pedidoId', ParseIntPipe) pedidoId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.pedidoService.eliminarProducto(pedidoId, itemId);
  }
}
