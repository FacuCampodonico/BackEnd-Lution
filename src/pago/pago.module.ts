import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pago } from './entities/pago.entity';
import { PagoController } from './pago.controller';
import { PagoService } from './pago.service';
import { PagoRepository } from './pago.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Pago])],
  controllers: [PagoController],
  providers: [PagoService, PagoRepository],
  exports: [PagoService, PagoRepository],
})
export class PagoModule {}