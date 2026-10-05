import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity';
import { ProductoService } from './services/producto.service';
import { ProductoController } from './controllers/producto.controller';
import { ProductoRepository } from './repositories/producto.repository';
import { Receta } from './entities/receta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Producto, Receta])],
  controllers: [ProductoController],
  providers: [ProductoService, ProductoRepository],
  exports: [ProductoService, ProductoRepository],
})
export class ProductoModule {}