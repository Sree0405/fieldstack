import { CollectionsService } from './collections.service';
import { FieldValidationService } from './field-validation.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
export declare class CollectionsController {
    private collectionsService;
    private fieldValidation;
    constructor(collectionsService: CollectionsService, fieldValidation: FieldValidationService);
    /**
     * Get all collections
     */
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
    /**
     * Get a single collection by ID
     */
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
    /**
     * Create a new collection
     */
    create(body: CreateCollectionDto & {
        systemConfig?: any;
    }, req: any): Promise<{
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
    /**
     * Delete a collection
     */
    delete(id: string, req: any): Promise<{
        id: string;
        name: string;
        displayName: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        tableName: string;
        status: import(".prisma/client").$Enums.CollectionStatus;
    }>;
    /**
     * Add a field to a collection
     */
    addField(collectionId: string, body: {
        name: string;
        type: string;
        dbColumn?: string;
        required?: boolean;
        validationRules?: any;
    }): Promise<{
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
     * Update a field in a collection
     */
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
    /**
     * Delete a field from a collection
     */
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
     * Validate a value against a field type
     */
    validateValue(body: {
        fieldType: string;
        value: any;
        validationRules?: any;
    }): Promise<{
        valid: boolean;
        error?: string;
    }>;
}
//# sourceMappingURL=collections.controller.d.ts.map