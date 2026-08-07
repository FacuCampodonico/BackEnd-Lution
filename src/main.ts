import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // descarta propiedades no declaradas en el DTO
      forbidNonWhitelisted: true, // y responde 400 si llegan
      transform: true, // convierte el payload a la clase del DTO
    }),
  );

  const config = app.get(ConfigService);
  const port = config.get<number>('port', 3000);
  const env = config.get<string>('env', 'development');

  await app.listen(port);
  console.log(`Servidor escuchando en http://localhost:${port}/api [${env}]`);
}

void bootstrap();
