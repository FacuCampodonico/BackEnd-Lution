import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidoProducto } from './entities/pedido-producto.entity';
import { PedidoProductoController } from './pedido-producto.controller';
import { PedidoProductoService } from './pedido-producto.service';
import { PedidoProductoRepository } from './pedido-producto.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PedidoProducto])],
  controllers: [PedidoProductoController],
  providers: [PedidoProductoService, PedidoProductoRepository],
  exports: [PedidoProductoService],
})
export class PedidoProductoModule {}