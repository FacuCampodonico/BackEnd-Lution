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
import  { Insumo } from './entities/insumo.entity';
import { ActualizarInsumoDto } from './dto/actualizar-insumo.dto';

@Controller('insumo')
export class InsumoController {
  constructor(private readonly insumoService: InsumoService) {}

  @Get()
  getAll(): Promise<Insumo[]> {
    return this.insumoService.findAll();
  }

  @Post('crear-insumo')
  @HttpCode(HttpStatus.CREATED)
  crear(@Body() datos: CrearInsumoDto): Promise<Insumo> {
    return this.insumoService.create(datos);
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number): Promise<Insumo> {
    return this.insumoService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarInsumoDto,
  ) {
    return this.insumoService.update(id, dto);
  }

  @Delete(':id')
async delete(
  @Param('id', ParseIntPipe) id: number,
) {
  await this.insumoService.delete(id);

  return {
    message: 'Insumo eliminado correctamente',
  };
}
}
