import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { PagoService } from './pago.service';
import { CrearPagoDto } from './dto/crear-pago.dto';
import { ActualizarPagoDto } from './dto/actualiza-pago.dto';

@Controller('pagos')
export class PagoController {
  constructor(private readonly pagoService: PagoService) {}

  @Post()
  create(@Body() crearPagoDto: CrearPagoDto) {
    return this.pagoService.create(crearPagoDto);
  }

  @Get()
  findAll() {
    return this.pagoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pagoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarPagoDto: ActualizarPagoDto,
  ) {
    return this.pagoService.update(id, actualizarPagoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pagoService.remove(id);
  }
}