import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { BootstrapService } from './bootstrap/bootstrap.service';

import * as express from 'express';
import { join } from 'path';
import { Request, Response } from 'express';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  const isDevelopment = process.env.NODE_ENV === 'development';
  const corsOrigins = isDevelopment
    ? ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:5173']
    : (process.env.FRONTEND_URL || 'http://localhost:3000');

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  // Run bootstrap on startup
  const bootstrapService = app.get(BootstrapService);
  await bootstrapService.init();

  /* ----------------------------------------------------
     SERVE ADMIN DASHBOARD (PRODUCTION ONLY)
     (Does NOT affect dev behavior)
  ---------------------------------------------------- */
if (!isDevelopment) {
  const distPath = join(__dirname, '..', '..', 'dist');

  const server = app.getHttpAdapter().getInstance();

  server.use(express.static(distPath));

  // SPA fallback (React Router)
  server.get('*', (_req: Request, res: Response) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

  const port = Number(process.env.PORT) || 4000;
  await app.listen(port);

  console.log(`\n✅ fieldstack Backend running on http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api`);

  if (isDevelopment) {
    console.log(`🔐 Admin Panel: http://localhost:3000\n`);
  } else {
    console.log(`🔐 Admin Panel: http://localhost:${port}\n`);
  }
}

bootstrap().catch((error: unknown) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});
