import { Module } from '@nestjs/common';

import { PedidoController } from './pedido.controller';
import { PedidoService } from './pedido.service';
import { PedidoRepository } from './pedido.repository';
import { PedidoProductoRepository } from './pedido-producto.repository';
import { Pedido } from './entities/pedido.entity';
import { PedidoProducto } from './entities/pedido-producto.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoModule } from '../producto/producto.module';

@Module({
  imports: [TypeOrmModule.forFeature([Pedido, PedidoProducto]), ProductoModule],
  controllers: [PedidoController],
  providers: [PedidoService, PedidoRepository, PedidoProductoRepository],
  exports: [PedidoService],
})
export class PedidoModule {}
