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
const prisma_service_1 = require("../prisma/prisma.service");
const schema_generator_service_1 = require("./schema-generator.service");
const field_validation_service_1 = require("./field-validation.service");
const notifications_service_1 = require("../notifications/notifications.service");
const field_types_1 = require("./field-types");
let CollectionsService = class CollectionsService {
    constructor(prisma, schemaGenerator, fieldValidation, notificationsService) {
        this.prisma = prisma;
        this.schemaGenerator = schemaGenerator;
        this.fieldValidation = fieldValidation;
        this.notificationsService = notificationsService;
    }
    async findAll() {
        return this.prisma.collection.findMany({
            include: {
                fields: true,
                relations: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const collection = await this.prisma.collection.findUnique({
            where: { id },
            include: {
                fields: true,
                relations: true,
            },
        });
        if (!collection) {
            throw new common_1.NotFoundException('Collection not found');
        }
        return collection;
    }
    async create(createCollectionDto, systemConfig, userId) {
        // Validate collection name
        if (!createCollectionDto.name || createCollectionDto.name.trim().length === 0) {
            throw new common_1.BadRequestException('Collection name is required');
        }
        if (!createCollectionDto.displayName || createCollectionDto.displayName.trim().length === 0) {
            throw new common_1.BadRequestException('Display name is required');
        }
        // Check if collection already exists
        const existingCollection = await this.prisma.collection.findUnique({
            where: { name: createCollectionDto.name },
        });
        if (existingCollection) {
            throw new common_1.BadRequestException(`Collection with name "${createCollectionDto.name}" already exists`);
        }
        // Generate table name if not provided
        const tableName = createCollectionDto.tableName ||
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
                type: field.type,
                required: true,
            }));
            // Create all system fields in database
            if (systemFieldsData.length > 0) {
                await this.prisma.field.createMany({
                    data: systemFieldsData,
                });
            }
            const createTableSQL = this.schemaGenerator.generateCreateTableSQL(tableName, [], systemConfig);
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
        }
        catch (error) {
            console.error('Error creating table:', error);
            throw new common_1.BadRequestException(`Failed to create collection table: ${error?.message || 'Unknown error'}`);
        }
        // Notify user
        if (userId) {
            await this.notificationsService.notifyCollectionCreated(createCollectionDto.name, userId);
        }
        return collection;
    }
    async delete(id, userId) {
        const collection = await this.findOne(id);
        // Drop the PostgreSQL table
        try {
            const dropTableQuery = `DROP TABLE IF EXISTS "${collection.tableName}" CASCADE;`;
            await this.prisma.$executeRawUnsafe(dropTableQuery);
            console.log(`Dropped table: ${collection.tableName}`);
        }
        catch (error) {
            console.error('Error dropping table:', error);
            throw new common_1.BadRequestException(`Failed to delete collection table: ${error?.message || 'Unknown error'}`);
        }
        // Delete the Prisma collection (and related fields due to cascade)
        const result = await this.prisma.collection.delete({
            where: { id },
        });
        // Notify user
        if (userId) {
            await this.notificationsService.createNotification(userId, {
                type: notifications_service_1.NotificationType.INFO,
                title: 'Collection Deleted',
                message: `Collection "${collection.name}" has been deleted`,
                data: { collectionName: collection.name },
            });
        }
        return result;
    }
    async addField(collectionId, fieldName, fieldType, dbColumn, required = false, validationRules) {
        const collection = await this.findOne(collectionId);
        // Validate field type
        if (!(0, field_types_1.getPgType)(fieldType)) {
            throw new common_1.BadRequestException(`Invalid field type: ${fieldType}`);
        }
        // Check if field already exists
        const existingField = await this.prisma.field.findFirst({
            where: {
                collectionId,
                name: fieldName,
            },
        });
        if (existingField) {
            throw new common_1.BadRequestException(`Field "${fieldName}" already exists in this collection`);
        }
        // Generate db column name
        const finalDbColumn = dbColumn || this.toDbColumnName(fieldName);
        // Add column to PostgreSQL table
        try {
            const addColumnSQL = this.schemaGenerator.generateAddColumnSQL(collection.tableName, fieldName, fieldType, required);
            await this.prisma.$executeRawUnsafe(addColumnSQL);
            console.log(`Added column ${finalDbColumn} to table ${collection.tableName}`);
        }
        catch (error) {
            console.error('Error adding column:', error);
            throw new common_1.BadRequestException(`Failed to add field: ${error?.message || 'Unknown error'}`);
        }
        // Create Field record
        const field = await this.prisma.field.create({
            data: {
                collectionId,
                name: fieldName,
                dbColumn: finalDbColumn,
                type: fieldType.toUpperCase(),
                required,
            },
        });
        return field;
    }
    async updateField(collectionId, fieldId, updateData) {
        const field = await this.prisma.field.findUnique({
            where: { id: fieldId },
        });
        if (!field || field.collectionId !== collectionId) {
            throw new common_1.NotFoundException('Field not found');
        }
        const collection = await this.findOne(collectionId);
        // If changing type, alter table
        if (updateData.type && updateData.type !== field.type) {
            try {
                const modifyColumnSQL = this.schemaGenerator.generateModifyColumnSQL(collection.tableName, field.name, updateData.type);
                await this.prisma.$executeRawUnsafe(modifyColumnSQL);
            }
            catch (error) {
                console.error('Error modifying column:', error);
                throw new common_1.BadRequestException(`Failed to update field type: ${error?.message || 'Unknown error'}`);
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
    async deleteField(collectionId, fieldId) {
        const field = await this.prisma.field.findUnique({
            where: { id: fieldId },
        });
        if (!field || field.collectionId !== collectionId) {
            throw new common_1.NotFoundException('Field not found');
        }
        const collection = await this.findOne(collectionId);
        // Drop column from PostgreSQL table
        try {
            const dropColumnSQL = this.schemaGenerator.generateDropColumnSQL(collection.tableName, field.name);
            await this.prisma.$executeRawUnsafe(dropColumnSQL);
            console.log(`Dropped column ${field.dbColumn} from table ${collection.tableName}`);
        }
        catch (error) {
            console.error('Error dropping column:', error);
            throw new common_1.BadRequestException(`Failed to delete field: ${error?.message || 'Unknown error'}`);
        }
        // Delete field record
        return this.prisma.field.delete({
            where: { id: fieldId },
        });
    }
    /**
     * Convert field name to database column name (snake_case)
     */
    toDbColumnName(fieldName) {
        return fieldName
            .replace(/([a-z])([A-Z])/g, '$1_$2')
            .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
            .toLowerCase();
    }
};
exports.CollectionsService = CollectionsService;
exports.CollectionsService = CollectionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        schema_generator_service_1.SchemaGeneratorService,
        field_validation_service_1.FieldValidationService,
        notifications_service_1.NotificationsService])
], CollectionsService);
