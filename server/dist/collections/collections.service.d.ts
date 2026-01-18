import { PrismaService } from '../prisma/prisma.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { SchemaGeneratorService, SystemFieldConfig } from './schema-generator.service';
import { FieldValidationService, ValidationRule } from './field-validation.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class CollectionsService {
    private prisma;
    private schemaGenerator;
    private fieldValidation;
    private notificationsService;
    constructor(prisma: PrismaService, schemaGenerator: SchemaGeneratorService, fieldValidation: FieldValidationService, notificationsService: NotificationsService);
    findAll(): Promise<({
        fields: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            dbColumn: string;
            type: import(".prisma/client").$Enums.FieldType;
            required: boolean;
            collectionId: string;
        }[];
        relations: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            collectionId: string;
            relatedCollectionId: string;
            relationType: import(".prisma/client").$Enums.RelationType;
            onDelete: string;
        }[];
    } & {
        id: string;
        name: string;
        displayName: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        tableName: string;
        status: import(".prisma/client").$Enums.CollectionStatus;
    })[]>;
    findOne(id: string): Promise<{
        fields: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            dbColumn: string;
            type: import(".prisma/client").$Enums.FieldType;
            required: boolean;
            collectionId: string;
        }[];
        relations: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            collectionId: string;
            relatedCollectionId: string;
            relationType: import(".prisma/client").$Enums.RelationType;
            onDelete: string;
        }[];
    } & {
        id: string;
        name: string;
        displayName: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        tableName: string;
        status: import(".prisma/client").$Enums.CollectionStatus;
    }>;
    create(createCollectionDto: CreateCollectionDto, systemConfig?: SystemFieldConfig, userId?: string): Promise<{
        fields: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            dbColumn: string;
            type: import(".prisma/client").$Enums.FieldType;
            required: boolean;
            collectionId: string;
        }[];
    } & {
        id: string;
        name: string;
        displayName: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        tableName: string;
        status: import(".prisma/client").$Enums.CollectionStatus;
    }>;
    delete(id: string, userId?: string): Promise<{
        id: string;
        name: string;
        displayName: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        tableName: string;
        status: import(".prisma/client").$Enums.CollectionStatus;
    }>;
    addField(collectionId: string, fieldName: string, fieldType: string, dbColumn?: string, required?: boolean, validationRules?: ValidationRule): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        dbColumn: string;
        type: import(".prisma/client").$Enums.FieldType;
        required: boolean;
        collectionId: string;
    }>;
    updateField(collectionId: string, fieldId: string, updateData: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        dbColumn: string;
        type: import(".prisma/client").$Enums.FieldType;
        required: boolean;
        collectionId: string;
    }>;
    deleteField(collectionId: string, fieldId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        dbColumn: string;
        type: import(".prisma/client").$Enums.FieldType;
        required: boolean;
        collectionId: string;
    }>;
    /**
     * Convert field name to database column name (snake_case)
     */
    private toDbColumnName;
}
//# sourceMappingURL=collections.service.d.ts.map