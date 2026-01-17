import { Module } from '@nestjs/common';
import { BootstrapService } from './bootstrap.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [BootstrapService],
  exports: [BootstrapService],
})
export class BootstrapModule {}
