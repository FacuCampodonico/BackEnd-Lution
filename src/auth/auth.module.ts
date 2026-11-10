import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { EmpleadoModule } from '../empleado/empleado.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

type ExpiracionJwt = NonNullable<JwtModuleOptions['signOptions']>['expiresIn'];

@Module({
  imports: [
    EmpleadoModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => {
        const secret = config.get<string>('jwt.secret');

        if (!secret) {
          throw new Error(
            'Falta la variable de entorno JWT_SECRET: definila en el .env antes de iniciar el backend',
          );
        }

        return {
          secret,
          signOptions: {
            expiresIn: config.get<string>(
              'jwt.expiresIn',
              '8h',
            ) as ExpiracionJwt,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule],
})
export class AuthModule {}
