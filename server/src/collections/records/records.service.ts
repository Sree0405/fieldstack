import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class RecordsService {
  constructor(private prisma: PrismaService) {}

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
      const tableName = await this.getTableName(collectionId);
      const offset = (page - 1) * limit;

      // Get total count - SINGLE STATEMENT
      const countResult = await this.prisma.$queryRawUnsafe(
        `SELECT COUNT(*) as count FROM "${tableName}"`,
      ) as any[];

      const total = parseInt(countResult[0]?.count || '0');

      // Get paginated records - SINGLE STATEMENT
      const data = await this.prisma.$queryRawUnsafe(
        `SELECT * FROM "${tableName}" ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
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
    try {
      const tableName = await this.getTableName(collectionId);

      const columns = Object.keys(data);
      const values = Object.values(data);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      const columnList = columns.map((col) => `"${col}"`).join(', ');

      const query = `
        INSERT INTO "${tableName}" (${columnList}, created_at, updated_at)
        VALUES (${placeholders}, NOW(), NOW())
        RETURNING *
      `;

      const result = await this.prisma.$queryRawUnsafe(query, ...values) as any[];
      return result[0];
    } catch (error: any) {
      throw new BadRequestException(`Failed to create record: ${error.message}`);
    }
  }

  /**
   * Update a record in a collection table
   */
  async updateRecord(collectionId: string, recordId: string, data: any) {
    try {
      const tableName = await this.getTableName(collectionId);

      const entries = Object.entries(data);
      const setClause = entries.map((_, i) => `"${entries[i][0]}" = $${i + 1}`).join(', ');
      const values = [...Object.values(data), recordId];

      const query = `
        UPDATE "${tableName}"
        SET ${setClause}, updated_at = NOW()
        WHERE id = $${values.length}
        RETURNING *
      `;

      const result = await this.prisma.$queryRawUnsafe(query, ...values) as any[];

      if (!result || result.length === 0) {
        throw new NotFoundException(`Record with id "${recordId}" not found`);
      }
      return result[0];
    } catch (error: any) {
      throw new BadRequestException(`Failed to update record: ${error.message}`);
    }
  }

  /**
   * Delete a record from a collection table
   */
  async deleteRecord(collectionId: string, recordId: string) {
    try {
      const tableName = await this.getTableName(collectionId);

      const result = await this.prisma.$queryRawUnsafe(
        `DELETE FROM "${tableName}" WHERE id = $1 RETURNING *`,
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
