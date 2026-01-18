import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CollectionsService } from '../collections/collections.service';

import { CreateFieldDto, UpdateCollectionSchemaDto } from './dto/system.dto';

@Injectable()
export class SystemService {
  constructor(
    private prisma: PrismaService,
    private collectionsService: CollectionsService
  ) { }

  async addFieldToCollection(
    collectionId: string,
    createFieldDto: CreateFieldDto,
  ) {
    return this.collectionsService.addField(
      collectionId,
      createFieldDto.name,
      createFieldDto.type,
      createFieldDto.dbColumn,
      createFieldDto.required,
      createFieldDto.uiComponent ? { uiComponent: createFieldDto.uiComponent } : undefined
    );
  }

  async updateCollectionSchema(
    collectionId: string,
    updateDto: UpdateCollectionSchemaDto,
  ) {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new Error(`Collection ${collectionId} not found`);
    }

    const updateData: any = {};
    if (updateDto.displayName) updateData.displayName = updateDto.displayName;

    const updated = await this.prisma.collection.update({
      where: { id: collectionId },
      data: updateData,
      include: { fields: true },
    });

    return updated;
  }

  async getCollectionSchema(collectionId: string) {
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

  async getCollectionFields(collectionId: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
      include: { fields: true },
    });

    if (!collection) {
      throw new Error(`Collection ${collectionId} not found`);
    }

    return collection.fields;
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

  private getPostgresColumnType(fieldType: string): string {
    const typeMap: Record<string, string> = {
      TEXT: 'VARCHAR(255)',
      NUMBER: 'DECIMAL(10,2)',
      BOOLEAN: 'BOOLEAN',
      DATETIME: 'TIMESTAMP',
      FILE: 'TEXT',
      RELATION: 'UUID',
    };
    return typeMap[fieldType] || 'TEXT';
  }
}
