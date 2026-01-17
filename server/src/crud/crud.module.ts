import { Module } from '@nestjs/common';
import { CrudController } from './crud.controller';
import { CrudService } from './crud.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FieldValidationService } from '../collections/field-validation.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [CrudController],
  providers: [CrudService, FieldValidationService],
})
export class CrudModule {}
