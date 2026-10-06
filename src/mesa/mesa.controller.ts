import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MesaService } from './mesa.service';
import { CrearMesaDto } from './dto/crear-mesa.dto';
import { ActualizarMesaDto } from './dto/actualizar-mesa.dto';
import { PedidoService } from '../pedido/pedido.service';
import { CrearPedidoMesaDto } from '../pedido/dto/crear-pedido-mesa.dto';

@Controller('mesas')
export class MesaController {
  constructor(
    private readonly mesaService: MesaService,
    private readonly pedidoService: PedidoService,
  ) {}

  @Post()
  create(@Body() crearMesaDto: CrearMesaDto) {
    return this.mesaService.create(crearMesaDto);
  }

  @Get()
  findAll() {
    return this.mesaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mesaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarMesaDto: ActualizarMesaDto,
  ) {
    return this.mesaService.update(id, actualizarMesaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mesaService.remove(id);
  }


  @Get(':mesaId/pedido')
  getPedidoAbierto(@Param('mesaId', ParseIntPipe) mesaId: number) {
    return this.pedidoService.obtenerPedidoAbiertoPorMesa(mesaId);
  }

  @Post(':mesaId/pedido')
  @HttpCode(HttpStatus.CREATED)
  crearPedidoMesa(
    @Param('mesaId', ParseIntPipe) mesaId: number,
    @Body() dto: CrearPedidoMesaDto,
  ) {
    return this.pedidoService.crearPedidoPorMesa(mesaId, dto);
  }
}