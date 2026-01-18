import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { AssetsController } from './assets.controller';
import { FilesService } from './files.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FilesController, AssetsController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
