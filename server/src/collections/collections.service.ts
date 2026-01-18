import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '..//prisma/prisma.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { FieldType } from '@prisma/client';
import { getPgType } from './field-types';

@Injectable()
export class CollectionsService {
  constructor(private prisma: PrismaService) { }

  async findAll() {
    return this.prisma.collection.findMany({
      include: {
        fields: true,
      } as any,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
      include: {
        fields: true,
      } as any,
    });

    if (!collection) {
      throw new NotFoundException(`Collection with id "${id}" not found`);
    }

    return collection;
  }

  async create(createCollectionDto: CreateCollectionDto, systemConfig?: any, userId?: string) {
    try {
      // Generate table name
      const tableName = createCollectionDto.tableName ||
        `tbl_${createCollectionDto.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

      // Check if collection with this tableName already exists
      const existingCollection = await this.prisma.collection.findUnique({
        where: { tableName },
      }).catch(() => null);

      if (existingCollection) {
        throw new ConflictException(`Collection with table name "${tableName}" already exists`);
      }

      // Create the dynamic table BEFORE creating the collection record
      await this.createDynamicTable(tableName, createCollectionDto.fields || []);

      // Create the Prisma collection metadata record
      const collection = await this.prisma.collection.create({
        data: {
          name: createCollectionDto.name,
          displayName: createCollectionDto.displayName,
          description: createCollectionDto.description,
          tableName,
          status: 'ACTIVE',
          fields: {
            create: (createCollectionDto.fields || []).map((field: any) => ({
              name: field.name,
              type: field.type,
              dbColumn: field.dbColumn || field.name,
              required: field.required || false,
              metadata: { validationRules: field.validationRules || {} },
            })),
          },
        },
        include: {
          fields: true,
        } as any,
      });

      return collection;
    } catch (error: any) {
      // Cleanup: drop table if collection creation failed
      if (error.code !== 'P2002' && error.message && !error.message.includes('already exists')) {
        const tableName = createCollectionDto.tableName ||
          `tbl_${createCollectionDto.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        await this.dropDynamicTable(tableName).catch(() => { });
      }

      throw new BadRequestException(`Failed to create collection: ${error.message}`);
    }
  }

  async delete(id: string, userId?: string) {
    try {
      const collection = await this.prisma.collection.findUnique({
        where: { id },
      });

      if (!collection) {
        throw new NotFoundException(`Collection with id "${id}" not found`);
      }

      // Drop the dynamic table
      await this.dropDynamicTable(collection.tableName);

      // Delete collection metadata
      return this.prisma.collection.delete({
        where: { id },
      });
    } catch (error: any) {
      throw new BadRequestException(`Failed to delete collection: ${error.message}`);
    }
  }

  async addField(collectionId: string, name: string, type: string, dbColumn?: string, required?: boolean, validationRules?: any) {
    try {
      const collection = await this.prisma.collection.findUnique({
        where: { id: collectionId },
      });

      if (!collection) {
        throw new NotFoundException(`Collection with id "${collectionId}" not found`);
      }

      // Normalize field type to match Prisma Enum
      const normalizedType = this.normalizeFieldType(type);

      // Add column to dynamic table
      const columnName = dbColumn || name;
      // Use getPgType for consistency, fallback to mapFieldTypeToSql if needed or direct logic
      const sqlType = getPgType(normalizedType) || this.mapFieldTypeToSql(normalizedType);
      const nullable = required ? 'NOT NULL' : 'NULL';

      const addColumnQuery = `ALTER TABLE "${collection.tableName}" ADD COLUMN IF NOT EXISTS "${columnName}" ${sqlType} ${nullable}`;

      return await this.prisma.$transaction(async (tx) => {
        try {
          await tx.$executeRawUnsafe(addColumnQuery);
        } catch (dbError: any) {
          // If column already exists, continue
          if (!dbError.message.includes('already exists')) {
            throw dbError;
          }
        }

        // Add field metadata
        return tx.field.create({
          data: {
            name,
            type: normalizedType,
            dbColumn: columnName,
            required: required || false,
            metadata: { validationRules: validationRules || {} },
            collectionId,
          },
        });
      });
    } catch (error: any) {
      throw new BadRequestException(`Failed to add field: ${error.message}`);
    }
  }

  private normalizeFieldType(type: string): FieldType {
    const upper = type.toUpperCase();
    const map: Record<string, FieldType> = {
      'NUMBER': FieldType.INTEGER,
      'DATETIME': FieldType.DATETIME,
      'BOOL': FieldType.BOOLEAN,
      'FILE': FieldType.FILE,
      'RELATION': FieldType.RELATION,
    };

    if (map[upper]) return map[upper];
    if (upper in FieldType) return upper as FieldType;

    return FieldType.STRING; // Fallback
  }

  async updateField(collectionId: string, fieldId: string, updateData: any) {
    try {
      // Verify collection exists
      await this.prisma.collection.findUnique({
        where: { id: collectionId },
      });

      return this.prisma.field.update({
        where: { id: fieldId },
        data: updateData,
      });
    } catch (error: any) {
      throw new BadRequestException(`Failed to update field: ${error.message}`);
    }
  }

  async deleteField(collectionId: string, fieldId: string) {
    try {
      const field = await this.prisma.field.findUnique({
        where: { id: fieldId },
      });

      if (!field) {
        throw new NotFoundException(`Field with id "${fieldId}" not found`);
      }

      const collection = await this.prisma.collection.findUnique({
        where: { id: collectionId },
      });

      if (!collection) {
        throw new NotFoundException(`Collection with id "${collectionId}" not found`);
      }

      // Drop column from dynamic table - SINGLE STATEMENT ONLY
      const dropColumnQuery = `ALTER TABLE "${collection.tableName}" DROP COLUMN IF EXISTS "${field.dbColumn}"`;

      try {
        await this.prisma.$executeRawUnsafe(dropColumnQuery);
      } catch (dbError: any) {
        // Continue even if column doesn't exist
        console.warn(`Column drop warning: ${dbError.message}`);
      }

      // Delete field metadata
      return this.prisma.field.delete({
        where: { id: fieldId },
      });
    } catch (error: any) {
      throw new BadRequestException(`Failed to delete field: ${error.message}`);
    }
  }

  /**
   * Create dynamic table with separate SQL statements
   * CRITICAL: Each $executeRawUnsafe() call must contain ONLY ONE SQL statement
   */
  private async createDynamicTable(tableName: string, fields: any[]) {
    try {
      // Build columns array
      const columns: string[] = [
        'id UUID PRIMARY KEY DEFAULT gen_random_uuid()',
        'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
        'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      ];

      // Add field columns
      fields.forEach((field) => {
        const sqlType = this.mapFieldTypeToSql(field.type);
        const nullable = field.required ? 'NOT NULL' : 'NULL';
        columns.push(`"${field.name}" ${sqlType} ${nullable}`);
      });

      const columnDefinitions = columns.join(', ');
      const createTableQuery = `CREATE TABLE IF NOT EXISTS "${tableName}" (${columnDefinitions})`;

      // Execute CREATE TABLE - SINGLE STATEMENT
      console.log(`[DB] Executing: ${createTableQuery.substring(0, 100)}...`);
      await this.prisma.$executeRawUnsafe(createTableQuery);
      console.log(`✓ Created table: ${tableName}`);

      // Create index separately - ANOTHER SINGLE STATEMENT
      const createIndexQuery = `CREATE INDEX IF NOT EXISTS "idx_${tableName}_created_at" ON "${tableName}" (created_at DESC)`;
      console.log(`[DB] Executing: ${createIndexQuery.substring(0, 100)}...`);
      await this.prisma.$executeRawUnsafe(createIndexQuery);
      console.log(`✓ Created index on ${tableName}`);

    } catch (error: any) {
      console.error(`[DB Error] Failed to create table "${tableName}":`, error.message);
      throw new Error(`Failed to create collection table: ${error.message}`);
    }
  }

  /**
   * Drop dynamic table - SINGLE STATEMENT ONLY
   */
  private async dropDynamicTable(tableName: string) {
    try {
      const dropTableQuery = `DROP TABLE IF EXISTS "${tableName}" CASCADE`;
      console.log(`[DB] Executing: ${dropTableQuery}`);
      await this.prisma.$executeRawUnsafe(dropTableQuery);
      console.log(`✓ Dropped table: ${tableName}`);
    } catch (error: any) {
      console.error(`[DB Warning] Failed to drop table: ${error.message}`);
      // Don't throw - this is cleanup
    }
  }

  /**
   * Map field types to PostgreSQL SQL types
   */
  private mapFieldTypeToSql(fieldType: string): string {
    const typeMap: { [key: string]: string } = {
      text: 'VARCHAR(255)',
      email: 'VARCHAR(255)',
      number: 'DECIMAL(10, 2)',
      integer: 'INTEGER',
      boolean: 'BOOLEAN',
      date: 'DATE',
      datetime: 'TIMESTAMP',
      json: 'JSONB',
      richtext: 'TEXT',
      url: 'VARCHAR(2048)',
      file: 'TEXT',      // ID of the file
      relation: 'UUID',  // ID of the related record
      uuid: 'UUID',
    };

    return typeMap[fieldType.toLowerCase()] || 'VARCHAR(255)';
  }
}
