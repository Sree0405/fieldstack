import { Module } from '@nestjs/common';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';
import { SchemaGeneratorService } from './schema-generator.service';
import { FieldValidationService } from './field-validation.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [CollectionsController],
  providers: [CollectionsService, SchemaGeneratorService, FieldValidationService],
  exports: [CollectionsService, SchemaGeneratorService, FieldValidationService],
})
export class CollectionsModule {}
