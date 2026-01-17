import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { SystemService } from './system.service';

// DTOs
class CreateFieldDto {
  name!: string;
  dbColumn?: string;
  type!: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DATETIME' | 'FILE' | 'RELATION';
  required?: boolean;
  defaultValue?: string;
  uiComponent?: string;
}

class UpdateCollectionSchemaDto {
  displayName?: string;
  fields?: CreateFieldDto[];
}

@Controller('system')
@UseGuards(JwtAuthGuard)
export class SystemController {
  constructor(private systemService: SystemService) {}

  @Get('endpoints')
  async getEndpoints() {
    return this.systemService.getEndpoints();
  }

  @Post('collections/:collectionId/fields')
  async addFieldToCollection(
    @Param('collectionId') collectionId: string,
    @Body() createFieldDto: CreateFieldDto,
  ) {
    return this.systemService.addFieldToCollection(collectionId, createFieldDto);
  }

  @Patch('collections/:collectionId')
  async updateCollectionSchema(
    @Param('collectionId') collectionId: string,
    @Body() updateDto: UpdateCollectionSchemaDto,
  ) {
    return this.systemService.updateCollectionSchema(collectionId, updateDto);
  }

  @Get('collections/:collectionId/schema')
  async getCollectionSchema(@Param('collectionId') collectionId: string) {
    return this.systemService.getCollectionSchema(collectionId);
  }

  @Get('metrics')
  async getMetrics() {
    return this.systemService.getMetrics();
  }
}
