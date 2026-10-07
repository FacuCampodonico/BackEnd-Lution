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
import { ActualizarEmpleadoDto } from './dto/actualizar-empleado.dto';

@Controller('empleados')
export class EmpleadoController {
  constructor(private readonly empleadoService: EmpleadoService) {}

  @Get()
  getAll() {
    return this.empleadoService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  crear(@Body() datos: CrearEmpleadoDto) {
    return this.empleadoService.create(datos);
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.empleadoService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarEmpleadoDto,
  ) {
    return this.empleadoService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.empleadoService.delete(id);
  }
}
