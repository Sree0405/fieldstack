import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FieldValidationService } from '../collections/field-validation.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CrudService {
  constructor(
    private prisma: PrismaService,
    private fieldValidation: FieldValidationService,
    private notificationsService: NotificationsService,
  ) {}

  async list(collectionName: string, page: number = 1, limit: number = 50, userId?: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { name: collectionName },
      include: { fields: true },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    try {
      // Query dynamic table with pagination
      const offset = (page - 1) * limit;
      const query = `SELECT * FROM "${collection.tableName}" ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
      const countQuery = `SELECT COUNT(*) as total FROM "${collection.tableName}"`;

      const data = await this.prisma.$queryRawUnsafe(query);
      const countResult: any = await this.prisma.$queryRawUnsafe(countQuery);
      const total = parseInt(countResult[0]?.total || 0);

      return {
        collection: collection.name,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        data,
        fields: collection.fields.map((f: any) => ({
          id: f.id,
          name: f.name,
          displayName: f.displayName || f.name,
          dbColumn: f.dbColumn,
          type: f.type,
          required: f.required,
          uiComponent: f.uiComponent || '',
          searchable: f.searchable || false,
          sortable: f.sortable || false,
          filterable: f.filterable || false,
        })),
      };
    } catch (error) {
      console.error('Error querying collection:', error);
      return {
        collection: collection.name,
        total: 0,
        page,
        limit,
        totalPages: 0,
        data: [],
        fields: collection.fields.map((f: any) => ({
          id: f.id,
          name: f.name,
          displayName: f.displayName,
          dbColumn: f.dbColumn,
          type: f.type,
          required: f.required,
        })),
      };
    }
  }

  async getOne(collectionName: string, id: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { name: collectionName },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    try {
      const query = `SELECT * FROM "${collection.tableName}" WHERE id = $1`;
      const result: any = await this.prisma.$queryRawUnsafe(query, id);

      if (!result || result.length === 0) {
        throw new NotFoundException('Record not found');
      }

      return {
        id,
        collection: collection.name,
        data: result[0],
      };
    } catch (error) {
      throw new NotFoundException('Record not found');
    }
  }

  async create(collectionName: string, data: any, userId?: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { name: collectionName },
      include: { fields: true },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    try {
      // Remove auto-managed fields
      const cleanData = { ...data };
      delete cleanData.id;
      delete cleanData.created_at;
      delete cleanData.updated_at;
      delete cleanData.deleted_at;

      // Validate each field - skip system timestamp fields
      for (const field of collection.fields) {
        // Skip auto-managed system fields
        if (['created_at', 'updated_at', 'deleted_at', 'id'].includes(field.name)) {
          continue;
        }

        if (field.name in cleanData) {
          const validationResult = this.fieldValidation.validateValue(cleanData[field.name], field.type, {
            required: field.required,
          });

          if (!validationResult.valid) {
            throw new BadRequestException(`Validation failed for field "${field.name}": ${validationResult.error}`);
          }
        } else if (field.required) {
          throw new BadRequestException(`Field "${field.name}" is required`);
        }
      }

      // Map field names to db columns
      const fieldMap = new Map(collection.fields.map((f: any) => [f.name, f.dbColumn]));

      // Build columns and values using db column names
      const dataEntries = Object.entries(cleanData).filter(
        ([k]) => k !== 'id' && cleanData[k] !== undefined && cleanData[k] !== '',
      );

      if (dataEntries.length === 0) {
        // If no data provided, just insert with defaults
        const query = `INSERT INTO "${collection.tableName}" (id, created_at, updated_at) VALUES (gen_random_uuid(), NOW(), NOW()) RETURNING *`;
        const result: any = await this.prisma.$queryRawUnsafe(query);

        const recordId = result[0]?.id;

        // Notify user
        if (userId) {
          await this.notificationsService.notifyRecordCreated(collection.name, recordId, userId);
        }

        return {
          id: recordId,
          collection: collection.name,
          data: result[0],
          createdAt: new Date(),
        };
      }

      const columns = dataEntries
        .map(([fieldName]) => {
          const dbColumn = fieldMap.get(fieldName) || fieldName;
          return `"${dbColumn}"`;
        })
        .join(', ');

      const values = dataEntries.map((_, i) => `$${i + 1}`).join(', ');

      const vals = dataEntries.map(([_, v]) => v);

      const query = `INSERT INTO "${collection.tableName}" (id, ${columns}, created_at, updated_at) VALUES (gen_random_uuid(), ${values}, NOW(), NOW()) RETURNING *`;
      const result: any = await this.prisma.$queryRawUnsafe(query, ...vals);

      const recordId = result[0]?.id;
      const recordTitle = cleanData.title || cleanData.name || undefined;

      // Notify user
      if (userId) {
        await this.notificationsService.notifyRecordCreated(collection.name, recordId, userId, recordTitle);
      }

      return {
        id: recordId,
        collection: collection.name,
        data: result[0],
        createdAt: new Date(),
      };
    } catch (error: any) {
      console.error('CRUD Create Error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to create record: ${error.message}`);
    }
  }

  async update(collectionName: string, id: string, data: any, userId?: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { name: collectionName },
      include: { fields: true },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    try {
      // Remove auto-managed fields
      const cleanData = { ...data };
      delete cleanData.id;
      delete cleanData.created_at;
      delete cleanData.updated_at;
      delete cleanData.deleted_at;

      // Validate fields - skip system timestamp fields
      for (const field of collection.fields) {
        // Skip auto-managed system fields
        if (['created_at', 'updated_at', 'deleted_at', 'id'].includes(field.name)) {
          continue;
        }

        if (field.name in cleanData) {
          const validationResult = this.fieldValidation.validateValue(cleanData[field.name], field.type, {
            required: field.required,
          });

          if (!validationResult.valid) {
            throw new BadRequestException(`Validation failed for field "${field.name}": ${validationResult.error}`);
          }
        }
      }

      // Map field names to db columns for UPDATE statement
      const fieldMap = new Map(collection.fields.map((f: any) => [f.name, f.dbColumn]));
      
      const dataEntries = Object.entries(cleanData);
      if (dataEntries.length === 0) {
        // If no data to update, just return current record
        const query = `SELECT * FROM "${collection.tableName}" WHERE id = $1`;
        const result: any = await this.prisma.$queryRawUnsafe(query, id);
        
        if (!result || result.length === 0) {
          throw new NotFoundException('Record not found');
        }

        return {
          id,
          collection: collection.name,
          data: result[0],
          updatedAt: new Date(),
        };
      }

      const updates = dataEntries
        .map(([fieldName, _], i) => {
          const dbColumn = fieldMap.get(fieldName) || fieldName;
          return `"${dbColumn}" = $${i + 1}`;
        })
        .join(',');

      const vals = dataEntries.map(([_, v]) => v);
      const query = `UPDATE "${collection.tableName}" SET ${updates}, updated_at = NOW() WHERE id = $${vals.length + 1} RETURNING *`;

      const result: any = await this.prisma.$queryRawUnsafe(query, ...vals, id);

      if (!result || result.length === 0) {
        throw new NotFoundException('Record not found');
      }

      const recordTitle = result[0].title || result[0].name || undefined;

      // Notify user
      if (userId) {
        const changes = Object.keys(data).join(', ');
        await this.notificationsService.notifyRecordUpdated(collection.name, id, userId, changes, recordTitle);
      }

      return {
        id,
        collection: collection.name,
        data: result[0],
        updatedAt: new Date(),
      };
    } catch (error: any) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to update record: ${error.message}`);
    }
  }

  async delete(collectionName: string, id: string, userId?: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { name: collectionName },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    try {
      // Get record title before deleting
      const getQuery = `SELECT * FROM "${collection.tableName}" WHERE id = $1`;
      const getResult: any = await this.prisma.$queryRawUnsafe(getQuery, id);
      const recordTitle = getResult?.[0]?.title || getResult?.[0]?.name || undefined;

      const query = `DELETE FROM "${collection.tableName}" WHERE id = $1`;
      await this.prisma.$queryRawUnsafe(query, id);

      // Notify user
      if (userId) {
        await this.notificationsService.notifyRecordDeleted(collection.name, id, userId, recordTitle);
      }

      return { success: true, id };
    } catch (error: any) {
      throw new BadRequestException(`Failed to delete record: ${error.message}`);
    }
  }
}
