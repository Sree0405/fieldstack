import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { BootstrapService } from './bootstrap/bootstrap.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  const isDevelopment = process.env.NODE_ENV === 'development';
  const  corsOrigins = isDevelopment
    ? ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:5173']
    : (process.env.FRONTEND_URL || 'http://localhost:3000');

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // Global validation
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Run bootstrap on startup
  const bootstrapService = app.get(BootstrapService);
  await bootstrapService.init();

  const port = process.env.PORT || 4000;
  await app.listen(port);

  console.log(`\n✅ NovaCMS Backend running on http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api`);
  console.log(`🔐 Admin Panel: http://localhost:3000\n`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});
