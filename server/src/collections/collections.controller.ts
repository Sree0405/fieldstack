import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Request,
  Patch,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { FieldValidationService } from './field-validation.service';
import { CreateCollectionDto } from './dto/create-collection.dto';

@Controller('collections')
export class CollectionsController {
  constructor(
    private collectionsService: CollectionsService,
    private fieldValidation: FieldValidationService,
  ) {}

  /**
   * Get all collections
   */
  @Get()
  async findAll() {
    return this.collectionsService.findAll();
  }

  /**
   * Get a single collection by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.collectionsService.findOne(id);
  }

  /**
   * Create a new collection
   */
  @Post()
  async create(@Body() body: CreateCollectionDto & { systemConfig?: any }, @Request() req: any) {
    return this.collectionsService.create(
      {
        name: body.name,
        displayName: body.displayName,
        description: body.description,
        tableName: body.tableName || '',
      },
      body.systemConfig,
      req.user?.id,
    );
  }

  /**
   * Delete a collection
   */
  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.collectionsService.delete(id, req.user?.id);
  }

  /**
   * Add a field to a collection
   */
  @Post(':collectionId/fields')
  async addField(
    @Param('collectionId') collectionId: string,
    @Body()
    body: {
      name: string;
      type: string;
      dbColumn?: string;
      required?: boolean;
      validationRules?: any;
    },
  ) {
    if (!body.name) {
      throw new BadRequestException('Field name is required');
    }
    if (!body.type) {
      throw new BadRequestException('Field type is required');
    }

    return this.collectionsService.addField(
      collectionId,
      body.name,
      body.type,
      body.dbColumn,
      body.required || false,
      body.validationRules,
    );
  }

  /**
   * Update a field in a collection
   */
  @Patch(':collectionId/fields/:fieldId')
  async updateField(
    @Param('collectionId') collectionId: string,
    @Param('fieldId') fieldId: string,
    @Body() updateData: any,
  ) {
    return this.collectionsService.updateField(collectionId, fieldId, updateData);
  }

  /**
   * Delete a field from a collection
   */
  @Delete(':collectionId/fields/:fieldId')
  async deleteField(@Param('collectionId') collectionId: string, @Param('fieldId') fieldId: string) {
    return this.collectionsService.deleteField(collectionId, fieldId);
  }

  /**
   * Validate a value against a field type
   */
  @Post('validate')
  async validateValue(
    @Body()
    body: {
      fieldType: string;
      value: any;
      validationRules?: any;
    },
  ) {
    return this.fieldValidation.validateValue(body.value, body.fieldType, body.validationRules);
  }
}
