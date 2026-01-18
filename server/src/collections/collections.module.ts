import { Module } from '@nestjs/common';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';
import { FieldValidationService } from './field-validation.service';
import { RecordsModule } from './records/records.module';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule, RecordsModule],
  controllers: [CollectionsController],
  providers: [CollectionsService, FieldValidationService],
  exports: [CollectionsService, RecordsModule],
})
export class CollectionsModule {}
