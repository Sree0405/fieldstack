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
            const tableName = await this.getTableName(collectionId);
            const offset = (page - 1) * limit;
            // Get total count - SINGLE STATEMENT
            const countResult = await this.prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${tableName}"`);
            const total = parseInt(countResult[0]?.count || '0');
            // Get paginated records - SINGLE STATEMENT
            const data = await this.prisma.$queryRawUnsafe(`SELECT * FROM "${tableName}" ORDER BY created_at DESC LIMIT $1 OFFSET $2`, limit, offset);
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
            const result = await this.prisma.$queryRawUnsafe(query, ...values);
            return result[0];
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to create record: ${error.message}`);
        }
    }
    /**
     * Update a record in a collection table
     */
    async updateRecord(collectionId, recordId, data) {
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
            const result = await this.prisma.$queryRawUnsafe(query, ...values);
            if (!result || result.length === 0) {
                throw new common_1.NotFoundException(`Record with id "${recordId}" not found`);
            }
            return result[0];
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to update record: ${error.message}`);
        }
    }
    /**
     * Delete a record from a collection table
     */
    async deleteRecord(collectionId, recordId) {
        try {
            const tableName = await this.getTableName(collectionId);
            const result = await this.prisma.$queryRawUnsafe(`DELETE FROM "${tableName}" WHERE id = $1 RETURNING *`, recordId);
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
