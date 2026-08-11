import { Module } from '@nestjs/common';

import { EmpleadoController } from './empleado.controller';
import { EmpleadoRepository } from './empleado.repository';
import { EmpleadoService } from './empleado.service';
import { EmpleadoTipoRol } from './entities/empleado-tipo-rol.entity';
import { Empleado } from './entities/empleado.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
    TypeOrmModule.forFeature([
      Empleado,
      EmpleadoTipoRol,
    ]),],
  controllers: [EmpleadoController],
  providers: [EmpleadoService, EmpleadoRepository],
  exports: [EmpleadoService],
})
export class EmpleadoModule {}
