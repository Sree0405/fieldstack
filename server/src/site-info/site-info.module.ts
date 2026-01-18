import { Module } from '@nestjs/common';
import { SiteInfoController } from './site-info.controller';
import { SiteInfoService } from './site-info.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SiteInfoController],
  providers: [SiteInfoService],
  exports: [SiteInfoService],
})
export class SiteInfoModule {}
