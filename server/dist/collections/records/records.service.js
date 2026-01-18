"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let RecordsService = class RecordsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Resolve collection ID to table name
     */
    async getTableName(collectionId) {
        const collection = await this.prisma.collection.findUnique({
            where: { id: collectionId },
        });
        if (!collection) {
            throw new common_1.NotFoundException(`Collection with id "${collectionId}" not found`);
        }
        return collection.tableName;
    }
    /**
     * Get all records from a collection table
     */
    async getRecords(collectionId, page = 1, limit = 25) {
        try {
            const collection = await this.prisma.collection.findUnique({
                where: { id: collectionId },
                include: { fields: true },
            });
            if (!collection) {
                throw new common_1.NotFoundException(`Collection with id "${collectionId}" not found`);
            }
            const tableName = collection.tableName;
            const fields = collection.fields;
            const offset = (page - 1) * limit;
            // Explicitly list columns to avoid "cached plan must not change result type" errors after ALTER TABLE
            const columnNames = fields.map(f => `"${f.dbColumn}"`);
            // Always include system fields if not in metadata
            if (!columnNames.includes('"id"'))
                columnNames.unshift('"id"');
            if (!columnNames.includes('"created_at"'))
                columnNames.push('"created_at"');
            if (!columnNames.includes('"updated_at"'))
                columnNames.push('"updated_at"');
            const selectClause = columnNames.join(', ');
            // Get total count
            const countResult = await this.prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${tableName}"`);
            const total = parseInt(countResult[0]?.count || '0');
            // Get paginated records with explicit columns
            const data = await this.prisma.$queryRawUnsafe(`SELECT ${selectClause} FROM "${tableName}" ORDER BY created_at DESC LIMIT $1 OFFSET $2`, limit, offset);
            return {
                data: data || [],
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to fetch records: ${error.message}`);
        }
    }
    /**
     * Create a record in a collection table
     */
    async createRecord(collectionId, data) {
        console.log(`[RecordsService] createRecord for ${collectionId}`, data);
        try {
            const collection = await this.prisma.collection.findUnique({
                where: { id: collectionId },
                include: { fields: true },
            });
            if (!collection) {
                throw new common_1.NotFoundException(`Collection with id "${collectionId}" not found`);
            }
            const tableName = collection.tableName;
            const fields = collection.fields;
            const columnsToInsert = [];
            const valuesToInsert = [];
            const placeholders = [];
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
            const result = await this.prisma.$queryRawUnsafe(query, ...valuesToInsert);
            return result[0];
        }
        catch (error) {
            console.error(`[RecordsService] Create Error: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to create record [ERR_CREATE]: ${error.message}`);
        }
    }
    /**
     * Update a record in a collection table
     */
    async updateRecord(collectionId, recordId, data) {
        console.log(`[RecordsService] updateRecord for ${collectionId}/${recordId}`, data);
        try {
            const collection = await this.prisma.collection.findUnique({
                where: { id: collectionId },
                include: { fields: true },
            });
            if (!collection) {
                throw new common_1.NotFoundException(`Collection with id "${collectionId}" not found`);
            }
            const tableName = collection.tableName;
            const fields = collection.fields;
            const setClauses = [];
            const valuesToUpdate = [];
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
            const result = await this.prisma.$queryRawUnsafe(query, ...valuesToUpdate);
            if (!result || result.length === 0) {
                throw new common_1.NotFoundException(`Record with id "${recordId}" not found`);
            }
            return result[0];
        }
        catch (error) {
            console.error(`[RecordsService] Update Error: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to update record [ERR_UPDATE]: ${error.message}`);
        }
    }
    /**
     * Delete a record from a collection table
     */
    async deleteRecord(collectionId, recordId) {
        try {
            const tableName = await this.getTableName(collectionId);
            const result = await this.prisma.$queryRawUnsafe(`DELETE FROM "${tableName}" WHERE id = $1::uuid RETURNING *`, recordId);
            if (!result || result.length === 0) {
                throw new common_1.NotFoundException(`Record with id "${recordId}" not found`);
            }
            return { success: true, message: 'Record deleted successfully' };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to delete record: ${error.message}`);
        }
    }
};
exports.RecordsService = RecordsService;
exports.RecordsService = RecordsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecordsService);
