import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mesa } from './entities/mesa.entity';
import { MesaService } from './mesa.service';
import { MesaController } from './mesa.controller';
import { MesaRepository } from './mesa.repository';
import { PedidoModule } from '../pedido/pedido.module';

@Module({
  imports: [TypeOrmModule.forFeature([Mesa]), PedidoModule],
  controllers: [MesaController],
  providers: [MesaService, MesaRepository],
  exports: [MesaService, MesaRepository],
})
export class MesaModule {}