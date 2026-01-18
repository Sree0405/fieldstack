import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RecordsService {
  constructor(private prisma: PrismaService) { }

  /**
   * Resolve collection ID to table name
   */
  private async getTableName(collectionId: string): Promise<string> {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException(`Collection with id "${collectionId}" not found`);
    }

    return collection.tableName;
  }

  /**
   * Get all records from a collection table
   */
  async getRecords(collectionId: string, page: number = 1, limit: number = 25) {
    try {
      const collection = await this.prisma.collection.findUnique({
        where: { id: collectionId },
        include: { fields: true },
      });

      if (!collection) {
        throw new NotFoundException(`Collection with id "${collectionId}" not found`);
      }

      const tableName = collection.tableName;
      const fields = collection.fields;
      const offset = (page - 1) * limit;

      // Explicitly list columns to avoid "cached plan must not change result type" errors after ALTER TABLE
      const columnNames = fields.map(f => `"${f.dbColumn}"`);
      // Always include system fields if not in metadata
      if (!columnNames.includes('"id"')) columnNames.unshift('"id"');
      if (!columnNames.includes('"created_at"')) columnNames.push('"created_at"');
      if (!columnNames.includes('"updated_at"')) columnNames.push('"updated_at"');

      const selectClause = columnNames.join(', ');

      // Get total count
      const countResult = await this.prisma.$queryRawUnsafe(
        `SELECT COUNT(*) as count FROM "${tableName}"`,
      ) as any[];

      const total = parseInt(countResult[0]?.count || '0');

      // Get paginated records with explicit columns
      const data = await this.prisma.$queryRawUnsafe(
        `SELECT ${selectClause} FROM "${tableName}" ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
        limit,
        offset,
      );

      return {
        data: data || [],
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      throw new BadRequestException(`Failed to fetch records: ${error.message}`);
    }
  }

  /**
   * Create a record in a collection table
   */
  async createRecord(collectionId: string, data: any) {
    console.log(`[RecordsService] createRecord for ${collectionId}`, data);
    try {
      const collection = await this.prisma.collection.findUnique({
        where: { id: collectionId },
        include: { fields: true },
      });

      if (!collection) {
        throw new NotFoundException(`Collection with id "${collectionId}" not found`);
      }

      const tableName = collection.tableName;
      const fields = collection.fields;

      const columnsToInsert: string[] = [];
      const valuesToInsert: any[] = [];
      const placeholders: string[] = [];

      // Map incoming data to database columns
      fields.forEach((field) => {
        const val = data[field.name];
        if (val !== undefined) {
          columnsToInsert.push(`"${field.dbColumn}"`);
          valuesToInsert.push(val);
          placeholders.push(`$${valuesToInsert.length}`);
        }
      });

      // Handle system timestamps if not already mapped from user fields
      if (!columnsToInsert.includes('"created_at"')) {
        columnsToInsert.push('"created_at"');
        const timestamp = data['created_at'] || new Date().toISOString();
        valuesToInsert.push(timestamp);
        placeholders.push(`$${valuesToInsert.length}`);
      }

      if (!columnsToInsert.includes('"updated_at"')) {
        columnsToInsert.push('"updated_at"');
        const timestamp = data['updated_at'] || new Date().toISOString();
        valuesToInsert.push(timestamp);
        placeholders.push(`$${valuesToInsert.length}`);
      }

      const query = `
        INSERT INTO "${tableName}" (${columnsToInsert.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING *
      `;

      console.log(`[RecordsService] Executing INSERT on ${tableName}`);
      const result = await this.prisma.$queryRawUnsafe(query, ...valuesToInsert) as any[];
      return result[0];
    } catch (error: any) {
      console.error(`[RecordsService] Create Error: ${error.message}`);
      throw new BadRequestException(`Failed to create record [ERR_CREATE]: ${error.message}`);
    }
  }

  /**
   * Update a record in a collection table
   */
  async updateRecord(collectionId: string, recordId: string, data: any) {
    console.log(`[RecordsService] updateRecord for ${collectionId}/${recordId}`, data);
    try {
      const collection = await this.prisma.collection.findUnique({
        where: { id: collectionId },
        include: { fields: true },
      });

      if (!collection) {
        throw new NotFoundException(`Collection with id "${collectionId}" not found`);
      }

      const tableName = collection.tableName;
      const fields = collection.fields;

      const setClauses: string[] = [];
      const valuesToUpdate: any[] = [];

      // Map incoming data to database columns
      fields.forEach((field) => {
        const val = data[field.name];
        if (val !== undefined && field.name !== 'id') {
          valuesToUpdate.push(val);
          setClauses.push(`"${field.dbColumn}" = $${valuesToUpdate.length}`);
        }
      });

      // Handle updated_at automatically if not already mapped
      if (!setClauses.some(c => c.includes('"updated_at"'))) {
        const timestamp = data['updated_at'] || new Date().toISOString();
        valuesToUpdate.push(timestamp);
        setClauses.push(`"updated_at" = $${valuesToUpdate.length}`);
      }

      if (setClauses.length === 0) {
        return this.prisma.$queryRawUnsafe(`SELECT * FROM "${tableName}" WHERE id = $1::uuid`, recordId);
      }

      // Add recordId as the last parameter
      valuesToUpdate.push(recordId);
      const query = `
        UPDATE "${tableName}"
        SET ${setClauses.join(', ')}
        WHERE id = $${valuesToUpdate.length}::uuid
        RETURNING *
      `;

      console.log(`[RecordsService] Executing UPDATE on ${tableName}`);
      const result = await this.prisma.$queryRawUnsafe(query, ...valuesToUpdate) as any[];

      if (!result || result.length === 0) {
        throw new NotFoundException(`Record with id "${recordId}" not found`);
      }
      return result[0];
    } catch (error: any) {
      console.error(`[RecordsService] Update Error: ${error.message}`);
      throw new BadRequestException(`Failed to update record [ERR_UPDATE]: ${error.message}`);
    }
  }

  /**
   * Delete a record from a collection table
   */
  async deleteRecord(collectionId: string, recordId: string) {
    try {
      const tableName = await this.getTableName(collectionId);

      const result = await this.prisma.$queryRawUnsafe(
        `DELETE FROM "${tableName}" WHERE id = $1::uuid RETURNING *`,
        recordId,
      ) as any[];

      if (!result || result.length === 0) {
        throw new NotFoundException(`Record with id "${recordId}" not found`);
      }
      return { success: true, message: 'Record deleted successfully' };
    } catch (error: any) {
      throw new BadRequestException(`Failed to delete record: ${error.message}`);
    }
  }
}
