import { Module } from '@nestjs/common';

import { InsumoRepository } from './insumo.repository';
import { Insumo } from './entities/insumo.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InsumoController } from './insumo.controller';
import { InsumoService } from './insumo.service';

@Module({
    imports: [
    TypeOrmModule.forFeature([
      Insumo,
    ]),],
  controllers: [InsumoController],
  providers: [InsumoService, InsumoRepository],
  exports: [InsumoService],
})
export class InsumoModule {}
