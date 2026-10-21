import { Module } from '@nestjs/common';

import { InsumoRepository } from './insumo.repository';
import { Insumo } from './entities/insumo.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InsumoController } from './insumo.controller';
import { InsumoService } from './insumo.service';
import { StockService } from './stock.service';

@Module({
  imports: [TypeOrmModule.forFeature([Insumo])],
  controllers: [InsumoController],
  providers: [InsumoService, InsumoRepository, StockService],
  exports: [InsumoService, StockService],
})
export class InsumoModule {}
