import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mesa } from './entities/mesa.entity';
import { MesaService } from './mesa.service';
import { MesaController } from './mesa.controller';
import { MesaRepository } from './mesa.repository';
import { PedidoModule } from '../pedido/pedido.module';
import { Pedido } from 'src/pedido/entities/pedido.entity';
import { PedidoRepository } from 'src/pedido/pedido.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Mesa,Pedido]), PedidoModule],
  controllers: [MesaController],
  providers: [MesaService, MesaRepository, PedidoRepository],
  exports: [MesaService, MesaRepository],
})
export class MesaModule {}