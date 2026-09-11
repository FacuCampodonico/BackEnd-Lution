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


@Controller('pedido')
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  @Get()
  getAll(): Promise<Pedido[]> {
    return this.pedidoService.findAll();
  }

  @Post('crear-pedido')
  @HttpCode(HttpStatus.CREATED)
  crear(@Body() datos: CrearPedidoDto): Promise<Pedido> {
    return this.pedidoService.create(datos);
  }

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
}
