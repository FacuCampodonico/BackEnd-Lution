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

import { CrearInsumoDto } from './dto/crear-insumo.dto';
import { InsumoService } from './insumo.service';
import { ActualizarInsumoDto } from './dto/actualizar-insumo.dto';

@Controller('insumos')
export class InsumoController {
  constructor(private readonly insumoService: InsumoService) {}

  @Get()
  getAll() {
    return this.insumoService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  crear(@Body() datos: CrearInsumoDto) {
    return this.insumoService.create(datos);
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.insumoService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarInsumoDto,
  ) {
    return this.insumoService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.insumoService.delete(id);
  }
}
