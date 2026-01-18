import { Module } from '@nestjs/common';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CollectionsModule } from '../collections/collections.module';
import { SiteInfoModule } from '../site-info/site-info.module';

@Module({
  imports: [PrismaModule, CollectionsModule, SiteInfoModule],
  controllers: [SystemController],
  providers: [SystemService],
  exports: [SystemService],
})
export class SystemModule { }
