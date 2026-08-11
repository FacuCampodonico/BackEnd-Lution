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

import { CrearEmpleadoDto } from './dto/crear-empleado.dto';
import { EmpleadoService } from './empleado.service';
import  { Empleado } from './entities/empleado.entity';
import { ActualizarEmpleadoDto } from './dto/actualizar-empleado.dto';

@Controller('empleado')
export class EmpleadoController {
  constructor(private readonly empleadoService: EmpleadoService) {}

  @Get()
  getAll(): Promise<Empleado[]> {
    return this.empleadoService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  crear(@Body() datos: CrearEmpleadoDto): Promise<Empleado> {
    return this.empleadoService.create(datos);
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number): Promise<Empleado> {
    return this.empleadoService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarEmpleadoDto,
  ) {
    return this.empleadoService.update(id, dto);
  }

  @Delete(':id')
async delete(
  @Param('id', ParseIntPipe) id: number,
) {
  await this.empleadoService.delete(id);

  return {
    message: 'Empleado eliminado correctamente',
  };
}
}
