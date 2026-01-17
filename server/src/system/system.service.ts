import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreateFieldDto {
  name: string;
  dbColumn?: string;
  type: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DATETIME' | 'FILE' | 'RELATION';
  required?: boolean;
  defaultValue?: string;
  uiComponent?: string;
}

interface UpdateCollectionSchemaDto {
  displayName?: string;
  fields?: CreateFieldDto[];
}

@Injectable()
export class SystemService {
  constructor(private prisma: PrismaService) {}

  async addFieldToCollection(
    collectionId: string,
    createFieldDto: CreateFieldDto,
  ) {
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
        type: createFieldDto.type as any,
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
    } catch (error) {
      console.error('Error adding column:', error);
    }

    return field;
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
