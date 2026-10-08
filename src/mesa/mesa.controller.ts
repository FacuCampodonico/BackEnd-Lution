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
  UseInterceptors,
} from '@nestjs/common';
import { MesaService } from './mesa.service';
import { CrearMesaDto } from './dto/crear-mesa.dto';
import { ActualizarMesaDto } from './dto/actualizar-mesa.dto';
import { PedidoService } from '../pedido/pedido.service';
import { CrearPedidoMesaDto } from '../pedido/dto/crear-pedido-mesa.dto';
import { JsonNullInterceptor } from '../common/interceptors/json-null.interceptor';
import { Niveles } from '../common/decorators/niveles.decorator';
import {
  EmpleadoActual,
  type EmpleadoAutenticado,
} from '../common/decorators/empleado-actual.decorator';

@Controller('mesas')
export class MesaController {
  constructor(
    private readonly mesaService: MesaService,
    private readonly pedidoService: PedidoService,
  ) {}

  @Post(':mesaId/cerrar')
  @HttpCode(HttpStatus.OK)
  cerrarMesa(@Param('mesaId', ParseIntPipe) mesaId: number) {
    return this.mesaService.cerrarMesa(mesaId);
  }

  @Post()
  @Niveles('admin', 'mozo')
  create(@Body() crearMesaDto: CrearMesaDto) {
    return this.mesaService.create(crearMesaDto);
  }

  @Get()
  @Niveles('admin', 'mozo')
  findAll() {
    return this.mesaService.findAll();
  }

  @Get(':id')
  @Niveles('admin', 'mozo')
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
  @Niveles('admin', 'mozo')
  @UseInterceptors(JsonNullInterceptor)
  getPedidoAbierto(@Param('mesaId', ParseIntPipe) mesaId: number) {
    return this.pedidoService.obtenerPedidoAbiertoPorMesa(mesaId);
  }

  @Post(':mesaId/pedido')
  @HttpCode(HttpStatus.CREATED)
  @Niveles('admin', 'mozo')
  crearPedidoMesa(
    @Param('mesaId', ParseIntPipe) mesaId: number,
    @Body() dto: CrearPedidoMesaDto,
    @EmpleadoActual() empleado: EmpleadoAutenticado,
  ) {
    return this.pedidoService.crearPedidoPorMesa(mesaId, {
      ...dto,
      empleadoId: empleado.id,
    });
  }
}
