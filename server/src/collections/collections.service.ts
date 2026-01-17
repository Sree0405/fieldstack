import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { SchemaGeneratorService, SystemFieldConfig } from './schema-generator.service';
import { FieldValidationService, ValidationRule } from './field-validation.service';
import { NotificationsService, NotificationType } from '../notifications/notifications.service';
import { getPgType } from './field-types';

@Injectable()
export class CollectionsService {
  constructor(
    private prisma: PrismaService,
    private schemaGenerator: SchemaGeneratorService,
    private fieldValidation: FieldValidationService,
    private notificationsService: NotificationsService,
  ) {}

  async findAll() {
    return this.prisma.collection.findMany({
      include: {
        fields: true,
        relations: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
      include: {
        fields: true,
        relations: true,
      },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    return collection;
  }

  async create(createCollectionDto: CreateCollectionDto, systemConfig?: SystemFieldConfig, userId?: string) {
    // Validate collection name
    if (!createCollectionDto.name || createCollectionDto.name.trim().length === 0) {
      throw new BadRequestException('Collection name is required');
    }

    if (!createCollectionDto.displayName || createCollectionDto.displayName.trim().length === 0) {
      throw new BadRequestException('Display name is required');
    }

    // Check if collection already exists
    const existingCollection = await this.prisma.collection.findUnique({
      where: { name: createCollectionDto.name },
    });

    if (existingCollection) {
      throw new BadRequestException(`Collection with name "${createCollectionDto.name}" already exists`);
    }

    // Generate table name if not provided
    const tableName =
      createCollectionDto.tableName ||
      `tbl_${createCollectionDto.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    // Create the Prisma collection metadata
    const collection = await this.prisma.collection.create({
      data: {
        name: createCollectionDto.name,
        displayName: createCollectionDto.displayName,
        description: createCollectionDto.description,
        tableName,
      },
      include: {
        fields: true,
      },
    });

    // Create the actual PostgreSQL table with system fields
    try {
      const systemFields = this.schemaGenerator.generateSystemFields(systemConfig);
      const systemFieldsData = systemFields.map((field) => ({
        collectionId: collection.id,
        name: field.name,
        dbColumn: field.name,
        type: field.type as any,
        required: true,
      }));

      // Create all system fields in database
      if (systemFieldsData.length > 0) {
        await this.prisma.field.createMany({
          data: systemFieldsData,
        });
      }

      const createTableSQL = this.schemaGenerator.generateCreateTableSQL(
        tableName,
        [],
        systemConfig,
      );

      await this.prisma.$executeRawUnsafe(createTableSQL);
      console.log(`Created table: ${tableName}`);

      // Create updated_at trigger
      const triggerSQL = this.schemaGenerator.generateUpdatedAtTriggerSQL(tableName);
      await this.prisma.$executeRawUnsafe(triggerSQL);

      // Create default indexes for system fields
      const indexesSQL = this.schemaGenerator.generateIndexesSQL(tableName, systemFields, systemConfig);
      if (indexesSQL) {
        await this.prisma.$executeRawUnsafe(indexesSQL);
      }
    } catch (error: any) {
      console.error('Error creating table:', error);
      throw new BadRequestException(`Failed to create collection table: ${error?.message || 'Unknown error'}`);
    }

    // Notify user
    if (userId) {
      await this.notificationsService.notifyCollectionCreated(createCollectionDto.name, userId);
    }

    return collection;
  }

  async delete(id: string, userId?: string) {
    const collection = await this.findOne(id);

    // Drop the PostgreSQL table
    try {
      const dropTableQuery = `DROP TABLE IF EXISTS "${collection.tableName}" CASCADE;`;
      await this.prisma.$executeRawUnsafe(dropTableQuery);
      console.log(`Dropped table: ${collection.tableName}`);
    } catch (error: any) {
      console.error('Error dropping table:', error);
      throw new BadRequestException(`Failed to delete collection table: ${error?.message || 'Unknown error'}`);
    }

    // Delete the Prisma collection (and related fields due to cascade)
    const result = await this.prisma.collection.delete({
      where: { id },
    });

    // Notify user
    if (userId) {
      await this.notificationsService.createNotification(userId, {
        type: NotificationType.INFO,
        title: 'Collection Deleted',
        message: `Collection "${collection.name}" has been deleted`,
        data: { collectionName: collection.name },
      });
    }

    return result;
  }

  async addField(
    collectionId: string,
    fieldName: string,
    fieldType: string,
    dbColumn?: string,
    required: boolean = false,
    validationRules?: ValidationRule,
  ) {
    const collection = await this.findOne(collectionId);

    // Validate field type
    if (!getPgType(fieldType)) {
      throw new BadRequestException(`Invalid field type: ${fieldType}`);
    }

    // Check if field already exists
    const existingField = await this.prisma.field.findFirst({
      where: {
        collectionId,
        name: fieldName,
      },
    });

    if (existingField) {
      throw new BadRequestException(`Field "${fieldName}" already exists in this collection`);
    }

    // Generate db column name
    const finalDbColumn = dbColumn || this.toDbColumnName(fieldName);

    // Add column to PostgreSQL table
    try {
      const addColumnSQL = this.schemaGenerator.generateAddColumnSQL(
        collection.tableName,
        fieldName,
        fieldType,
        required,
      );

      await this.prisma.$executeRawUnsafe(addColumnSQL);
      console.log(`Added column ${finalDbColumn} to table ${collection.tableName}`);
    } catch (error: any) {
      console.error('Error adding column:', error);
      throw new BadRequestException(`Failed to add field: ${error?.message || 'Unknown error'}`);
    }

    // Create Field record
    const field = await this.prisma.field.create({
      data: {
        collectionId,
        name: fieldName,
        dbColumn: finalDbColumn,
        type: fieldType.toUpperCase() as any,
        required,
      },
    });

    return field;
  }

  async updateField(collectionId: string, fieldId: string, updateData: any) {
    const field = await this.prisma.field.findUnique({
      where: { id: fieldId },
    });

    if (!field || field.collectionId !== collectionId) {
      throw new NotFoundException('Field not found');
    }

    const collection = await this.findOne(collectionId);

    // If changing type, alter table
    if (updateData.type && updateData.type !== field.type) {
      try {
        const modifyColumnSQL = this.schemaGenerator.generateModifyColumnSQL(
          collection.tableName,
          field.name,
          updateData.type,
        );
        await this.prisma.$executeRawUnsafe(modifyColumnSQL);
      } catch (error: any) {
        console.error('Error modifying column:', error);
        throw new BadRequestException(`Failed to update field type: ${error?.message || 'Unknown error'}`);
      }
    }

    // Update field metadata
    const updatedField = await this.prisma.field.update({
      where: { id: fieldId },
      data: {
        type: updateData.type,
        required: updateData.required,
      },
    });

    return updatedField;
  }

  async deleteField(collectionId: string, fieldId: string) {
    const field = await this.prisma.field.findUnique({
      where: { id: fieldId },
    });

    if (!field || field.collectionId !== collectionId) {
      throw new NotFoundException('Field not found');
    }

    const collection = await this.findOne(collectionId);

    // Drop column from PostgreSQL table
    try {
      const dropColumnSQL = this.schemaGenerator.generateDropColumnSQL(collection.tableName, field.name);
      await this.prisma.$executeRawUnsafe(dropColumnSQL);
      console.log(`Dropped column ${field.dbColumn} from table ${collection.tableName}`);
    } catch (error: any) {
      console.error('Error dropping column:', error);
      throw new BadRequestException(`Failed to delete field: ${error?.message || 'Unknown error'}`);
    }

    // Delete field record
    return this.prisma.field.delete({
      where: { id: fieldId },
    });
  }

  /**
   * Convert field name to database column name (snake_case)
   */
  private toDbColumnName(fieldName: string): string {
    return fieldName
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
      .toLowerCase();
  }
}

