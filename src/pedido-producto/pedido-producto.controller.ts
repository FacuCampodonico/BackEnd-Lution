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
import { PedidoProductoService } from './pedido-producto.service';
import { CrearPedidoProductoDto } from './dto/crear-pedido-producto.dto';
import { ActualizarPedidoProductoDto } from './dto/actualizar-pedido-producto.dto';
import { PedidoProducto } from './entities/pedido-producto.entity';

@Controller('pedido-producto')
export class PedidoProductoController {
  constructor(
    private readonly pedidoProductoService: PedidoProductoService,
  ) {}

  @Get()
  getAll(): Promise<PedidoProducto[]> {
    return this.pedidoProductoService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CrearPedidoProductoDto): Promise<PedidoProducto> {
    return this.pedidoProductoService.create(dto);
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number): Promise<PedidoProducto> {
    return this.pedidoProductoService.findById(id);
  }

  @Get('pedido/:pedidoId')
  getByPedido(@Param('pedidoId', ParseIntPipe) pedidoId: number) {
    return this.pedidoProductoService.findByPedido(pedidoId);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarPedidoProductoDto,
  ) {
    return this.pedidoProductoService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.pedidoProductoService.delete(id);

    return {
      message: 'Item de pedido eliminado correctamente',
    };
  }
}