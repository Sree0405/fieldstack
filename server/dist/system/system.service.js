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
exports.SystemService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SystemService = class SystemService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async addFieldToCollection(collectionId, createFieldDto) {
        const collection = await this.prisma.collection.findUnique({
            where: { id: collectionId },
            include: { fields: true },
        });
        if (!collection) {
            throw new Error(`Collection ${collectionId} not found`);
        }
        const field = await this.prisma.field.create({
            data: {
                name: createFieldDto.name,
                dbColumn: createFieldDto.dbColumn || createFieldDto.name.toLowerCase(),
                type: createFieldDto.type,
                required: createFieldDto.required || false,
                collectionId,
            },
        });
        // Add column to dynamic table
        const tableName = collection.tableName;
        const columnType = this.getPostgresColumnType(createFieldDto.type);
        const nullable = createFieldDto.required ? 'NOT NULL' : '';
        const defaultVal = createFieldDto.defaultValue
            ? `DEFAULT '${createFieldDto.defaultValue}'`
            : '';
        const alterQuery = `ALTER TABLE "${tableName}" ADD COLUMN "${createFieldDto.dbColumn || createFieldDto.name.toLowerCase()}" ${columnType} ${nullable} ${defaultVal}`;
        try {
            await this.prisma.$executeRawUnsafe(alterQuery);
        }
        catch (error) {
            console.error('Error adding column:', error);
        }
        return field;
    }
    async updateCollectionSchema(collectionId, updateDto) {
        const collection = await this.prisma.collection.findUnique({
            where: { id: collectionId },
        });
        if (!collection) {
            throw new Error(`Collection ${collectionId} not found`);
        }
        const updateData = {};
        if (updateDto.displayName)
            updateData.displayName = updateDto.displayName;
        const updated = await this.prisma.collection.update({
            where: { id: collectionId },
            data: updateData,
            include: { fields: true },
        });
        return updated;
    }
    async getCollectionSchema(collectionId) {
        const collection = await this.prisma.collection.findUnique({
            where: { id: collectionId },
            include: { fields: true },
        });
        if (!collection) {
            throw new Error(`Collection ${collectionId} not found`);
        }
        return {
            id: collection.id,
            name: collection.name,
            displayName: collection.displayName,
            tableName: collection.tableName,
            fields: collection.fields,
        };
    }
    async getEndpoints() {
        const collections = await this.prisma.collection.findMany({
            include: { fields: true },
        });
        const endpoints = [];
        // Auth endpoints
        endpoints.push({
            method: 'POST',
            path: '/auth/login',
            description: 'User login',
            requiresAuth: false,
        });
        endpoints.push({
            method: 'POST',
            path: '/auth/refresh',
            description: 'Refresh JWT token',
            requiresAuth: false,
        });
        endpoints.push({
            method: 'GET',
            path: '/auth/me',
            description: 'Get current user',
            requiresAuth: true,
        });
        // Collections endpoints
        endpoints.push({
            method: 'GET',
            path: '/collections',
            description: 'List all collections',
            requiresAuth: true,
        });
        endpoints.push({
            method: 'POST',
            path: '/collections',
            description: 'Create new collection',
            requiresAuth: true,
        });
        endpoints.push({
            method: 'GET',
            path: '/collections/:id',
            description: 'Get collection details',
            requiresAuth: true,
        });
        endpoints.push({
            method: 'DELETE',
            path: '/collections/:id',
            description: 'Delete collection',
            requiresAuth: true,
        });
        // Dynamic CRUD endpoints
        for (const collection of collections) {
            endpoints.push({
                method: 'GET',
                path: `/api/${collection.name}`,
                description: `List ${collection.displayName} records`,
                collection: collection.name,
                requiresAuth: true,
            });
            endpoints.push({
                method: 'GET',
                path: `/api/${collection.name}/:id`,
                description: `Get single ${collection.displayName} record`,
                collection: collection.name,
                requiresAuth: true,
            });
            endpoints.push({
                method: 'POST',
                path: `/api/${collection.name}`,
                description: `Create ${collection.displayName} record`,
                collection: collection.name,
                requiresAuth: true,
            });
            endpoints.push({
                method: 'PATCH',
                path: `/api/${collection.name}/:id`,
                description: `Update ${collection.displayName} record`,
                collection: collection.name,
                requiresAuth: true,
            });
            endpoints.push({
                method: 'DELETE',
                path: `/api/${collection.name}/:id`,
                description: `Delete ${collection.displayName} record`,
                collection: collection.name,
                requiresAuth: true,
            });
        }
        return { endpoints, totalEndpoints: endpoints.length, totalCollections: collections.length };
    }
    async getMetrics() {
        const users = await this.prisma.user.count();
        const collections = await this.prisma.collection.count();
        const fields = await this.prisma.field.count();
        const permissions = await this.prisma.permission.count();
        return {
            users,
            collections,
            fields,
            permissions,
            timestamp: new Date().toISOString(),
        };
    }
    getPostgresColumnType(fieldType) {
        const typeMap = {
            TEXT: 'VARCHAR(255)',
            NUMBER: 'DECIMAL(10,2)',
            BOOLEAN: 'BOOLEAN',
            DATETIME: 'TIMESTAMP',
            FILE: 'TEXT',
            RELATION: 'UUID',
        };
        return typeMap[fieldType] || 'TEXT';
    }
};
exports.SystemService = SystemService;
exports.SystemService = SystemService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SystemService);
