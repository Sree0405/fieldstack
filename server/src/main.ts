import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { BootstrapService } from './bootstrap/bootstrap.service';

import * as express from 'express';
import type { Request, Response } from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    app.enableCors({
      origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:8080',
      ],
      credentials: true,
    });
  }

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const bootstrapService = app.get(BootstrapService);
  await bootstrapService.init();
if (isProduction) {
  const clientPath = join(__dirname, '..', '..', 'dist');

  const server = app.getHttpAdapter().getInstance() as express.Express;

  server.use(express.static(clientPath));

  server.get('*', (_req: Request, res: Response) => {
    res.sendFile(join(clientPath, 'index.html'));
  });
}


  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
}

bootstrap();
