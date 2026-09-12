import { Module } from '@nestjs/common';

import { PedidoController } from './pedido.controller';
import { PedidoService } from './pedido.service';
import { PedidoRepository } from './pedido.repository';
import { Pedido } from './entities/pedido.entity';
import { PedidoProducto } from './entities/pedido-producto.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Pedido, PedidoProducto])],
  controllers: [PedidoController],
  providers: [PedidoService, PedidoRepository],
  exports: [PedidoService],
})
export class PedidoModule {}
