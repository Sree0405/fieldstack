import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { BootstrapService } from './bootstrap/bootstrap.service';
import type { Request, Response } from 'express';

import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ API namespace
  app.setGlobalPrefix('api');

  // ✅ Correct env detection
  const isDevelopment = process.env.NODE_ENV !== 'production';

  // ✅ CORS only needed in dev (same-domain in prod)
  if (isDevelopment) {
    app.enableCors({
      origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:8080',
      ],
      credentials: true,
    });
  }

  // ✅ Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // ✅ Bootstrap DB / roles / admin
  const bootstrapService = app.get(BootstrapService);
  await bootstrapService.init();

  // ✅ Serve dashboard in production
  if (!isDevelopment) {
    const clientPath = join(__dirname, '..', '..', 'dist');
    const server = app.getHttpAdapter().getInstance() as any;

    // Static assets
    server.use('/assets', express.static(join(clientPath, 'assets')));

    // SPA fallback (exclude /api)
server.get(/^\/(?!api).*/, (_req: Request, res: Response) => {
  res.sendFile(join(clientPath, 'index.html'));
});

  }

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Fieldstack running on port ${port}`);
}

bootstrap().catch((err) => {
  console.error('❌ Bootstrap failed', err);
  process.exit(1);
});
