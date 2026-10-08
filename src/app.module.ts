import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import configuration from './config/configuration';
import { HealthModule } from './health/health.module';
import { EmpleadoModule } from './empleado/empleado.module';
import { CategoriaModule } from './categoria/categoria.module';
import { MesaModule } from './mesa/mesa.module';
import { ProductoModule } from './producto/producto.module';
import { PedidoModule } from './pedido/pedido.module';
import { InsumoModule } from './insumo/insumo.module';
import { PagoModule } from './pago/pago.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { NivelesGuard } from './common/guards/niveles.guard';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.username'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.name'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),

    AuthModule,
    HealthModule,
    EmpleadoModule,
    CategoriaModule,
    MesaModule,
    ProductoModule,
    PedidoModule,
    InsumoModule,
    PagoModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: NivelesGuard },
  ],
})
export class AppModule {}
