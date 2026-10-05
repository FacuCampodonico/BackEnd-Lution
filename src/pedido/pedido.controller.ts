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
import  { Pedido } from './entities/pedido.entity';
import { ActualizarPedidoDto } from './dto/actualizar-pedido.dto';
import { PedidoProducto } from './entities/pedido-producto.entity';
import { CrearPedidoProductoDto } from './dto/crear-pedido-producto.dto';
import { ActualizarPedidoProductoDto } from './dto/actualizar-pedido-producto.dto';


@Controller('pedido')
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  @Get()
  getAll(): Promise<Pedido[]> {
    return this.pedidoService.findAll();
  }

//   @Post('crear-pedido')
//   @HttpCode(HttpStatus.CREATED)
//   crear(@Body() datos: CrearPedidoDto): Promise<Pedido> {
//     return this.pedidoService.create(datos);
//   }

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
async delete(
  @Param('id', ParseIntPipe) id: number,
) {
  await this.pedidoService.delete(id);

  return {
    message: 'Pedido eliminado correctamente',
  };
}

  @Get(':id/productos')
  getProductos(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PedidoProducto[]> {
    return this.pedidoService.findProductos(id);
  }

  @Post(':id/productos')
  @HttpCode(HttpStatus.CREATED)
  agregarProducto(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CrearPedidoProductoDto,
  ): Promise<PedidoProducto> {
    return this.pedidoService.agregarProducto(id, dto);
  }

  @Patch(':id/productos/:itemId')
  actualizarProducto(
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: ActualizarPedidoProductoDto,
  ) {
    return this.pedidoService.actualizarProducto(id, itemId, dto);
  }

  @Delete(':id/productos/:itemId')
  async eliminarProducto(
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    await this.pedidoService.eliminarProducto(id, itemId);

    return {
      message: 'Producto eliminado del pedido correctamente',
    };
  }
}
