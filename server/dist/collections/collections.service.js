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
exports.CollectionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("..//prisma/prisma.service");
const client_1 = require("@prisma/client");
const field_types_1 = require("./field-types");
let CollectionsService = class CollectionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.collection.findMany({
            include: {
                fields: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOne(id) {
        const collection = await this.prisma.collection.findUnique({
            where: { id },
            include: {
                fields: true,
            },
        });
        if (!collection) {
            throw new common_1.NotFoundException(`Collection with id "${id}" not found`);
        }
        return collection;
    }
    async create(createCollectionDto, systemConfig, userId) {
        try {
            // Generate table name
            const tableName = createCollectionDto.tableName ||
                `tbl_${createCollectionDto.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
            // Check if collection with this tableName already exists
            const existingCollection = await this.prisma.collection.findUnique({
                where: { tableName },
            }).catch(() => null);
            if (existingCollection) {
                throw new common_1.ConflictException(`Collection with table name "${tableName}" already exists`);
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
                        create: (createCollectionDto.fields || []).map((field) => ({
                            name: field.name,
                            type: this.normalizeFieldType(field.type),
                            dbColumn: field.dbColumn || field.name,
                            required: field.required || false,
                            metadata: { validationRules: field.validationRules || {} },
                        })),
                    },
                },
                include: {
                    fields: true,
                },
            });
            return collection;
        }
        catch (error) {
            // Cleanup: drop table if collection creation failed
            if (error.code !== 'P2002' && error.message && !error.message.includes('already exists')) {
                const tableName = createCollectionDto.tableName ||
                    `tbl_${createCollectionDto.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
                await this.dropDynamicTable(tableName).catch(() => { });
            }
            throw new common_1.BadRequestException(`Failed to create collection: ${error.message}`);
        }
    }
    async delete(id, userId) {
        try {
            const collection = await this.prisma.collection.findUnique({
                where: { id },
            });
            if (!collection) {
                throw new common_1.NotFoundException(`Collection with id "${id}" not found`);
            }
            // Drop the dynamic table
            await this.dropDynamicTable(collection.tableName);
            // Delete collection metadata
            return this.prisma.collection.delete({
                where: { id },
            });
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to delete collection: ${error.message}`);
        }
    }
    async addField(collectionId, name, type, dbColumn, required, validationRules) {
        console.log(`[CollectionsService] addField called for collection ${collectionId}: name=${name}, type=${type}`);
        try {
            const collection = await this.prisma.collection.findUnique({
                where: { id: collectionId },
            });
            if (!collection) {
                throw new common_1.NotFoundException(`Collection with id "${collectionId}" not found`);
            }
            // Normalize field type to match Prisma Enum
            const normalizedType = this.normalizeFieldType(type);
            // Add column to dynamic table
            const columnName = dbColumn || name;
            // Use getPgType for consistency, fallback to mapFieldTypeToSql if needed or direct logic
            const sqlType = (0, field_types_1.getPgType)(normalizedType) || this.mapFieldTypeToSql(normalizedType);
            const nullable = required ? 'NOT NULL' : 'NULL';
            const addColumnQuery = `ALTER TABLE "${collection.tableName}" ADD COLUMN IF NOT EXISTS "${columnName}" ${sqlType} ${nullable}`;
            return await this.prisma.$transaction(async (tx) => {
                try {
                    await tx.$executeRawUnsafe(addColumnQuery);
                }
                catch (dbError) {
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
        }
        catch (error) {
            console.error(`[CollectionsService] Error adding field [ERR_02]: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to add field [ERR_02]: ${error.message}`);
        }
    }
    normalizeFieldType(type) {
        if (!type) {
            console.warn('[CollectionsService] normalizeFieldType called with undefined/empty type, falling back to STRING');
            return client_1.FieldType.STRING;
        }
        const upper = type.toUpperCase();
        const map = {
            'NUMBER': client_1.FieldType.INTEGER,
            'DATETIME': client_1.FieldType.DATETIME,
            'BOOL': client_1.FieldType.BOOLEAN,
            'FILE': client_1.FieldType.FILE,
            'RELATION': client_1.FieldType.RELATION,
        };
        if (map[upper])
            return map[upper];
        // Check if it's a valid enum value directly
        if (Object.values(client_1.FieldType).includes(upper)) {
            return upper;
        }
        return client_1.FieldType.STRING; // Fallback
    }
    async updateField(collectionId, fieldId, updateData) {
        try {
            // Verify collection exists
            await this.prisma.collection.findUnique({
                where: { id: collectionId },
            });
            return this.prisma.field.update({
                where: { id: fieldId },
                data: updateData,
            });
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to update field: ${error.message}`);
        }
    }
    async deleteField(collectionId, fieldId) {
        try {
            const field = await this.prisma.field.findUnique({
                where: { id: fieldId },
            });
            if (!field) {
                throw new common_1.NotFoundException(`Field with id "${fieldId}" not found`);
            }
            const collection = await this.prisma.collection.findUnique({
                where: { id: collectionId },
            });
            if (!collection) {
                throw new common_1.NotFoundException(`Collection with id "${collectionId}" not found`);
            }
            // Drop column from dynamic table - SINGLE STATEMENT ONLY
            const dropColumnQuery = `ALTER TABLE "${collection.tableName}" DROP COLUMN IF EXISTS "${field.dbColumn}"`;
            try {
                await this.prisma.$executeRawUnsafe(dropColumnQuery);
            }
            catch (dbError) {
                // Continue even if column doesn't exist
                console.warn(`Column drop warning: ${dbError.message}`);
            }
            // Delete field metadata
            return this.prisma.field.delete({
                where: { id: fieldId },
            });
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to delete field: ${error.message}`);
        }
    }
    /**
     * Create dynamic table with separate SQL statements
     * CRITICAL: Each $executeRawUnsafe() call must contain ONLY ONE SQL statement
     */
    async createDynamicTable(tableName, fields) {
        try {
            // Build columns array
            const columns = [
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
        }
        catch (error) {
            console.error(`[DB Error] Failed to create table "${tableName}":`, error.message);
            throw new Error(`Failed to create collection table: ${error.message}`);
        }
    }
    /**
     * Drop dynamic table - SINGLE STATEMENT ONLY
     */
    async dropDynamicTable(tableName) {
        try {
            const dropTableQuery = `DROP TABLE IF EXISTS "${tableName}" CASCADE`;
            console.log(`[DB] Executing: ${dropTableQuery}`);
            await this.prisma.$executeRawUnsafe(dropTableQuery);
            console.log(`✓ Dropped table: ${tableName}`);
        }
        catch (error) {
            console.error(`[DB Warning] Failed to drop table: ${error.message}`);
            // Don't throw - this is cleanup
        }
    }
    /**
     * Map field types to PostgreSQL SQL types
     */
    mapFieldTypeToSql(fieldType) {
        const typeMap = {
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
            file: 'TEXT', // ID of the file
            relation: 'UUID', // ID of the related record
            uuid: 'UUID',
        };
        return typeMap[fieldType.toLowerCase()] || 'VARCHAR(255)';
    }
};
exports.CollectionsService = CollectionsService;
exports.CollectionsService = CollectionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CollectionsService);
