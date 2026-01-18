import { SystemService } from './system.service';
declare class CreateFieldDto {
    name: string;
    dbColumn?: string;
    type: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DATETIME' | 'FILE' | 'RELATION';
    required?: boolean;
    defaultValue?: string;
    uiComponent?: string;
}
declare class UpdateCollectionSchemaDto {
    displayName?: string;
    fields?: CreateFieldDto[];
}
export declare class SystemController {
    private systemService;
    constructor(systemService: SystemService);
    getEndpoints(): Promise<{
        endpoints: ({
            method: string;
            path: string;
            description: string;
            requiresAuth: boolean;
            collection?: undefined;
        } | {
            method: string;
            path: string;
            description: string;
            collection: string;
            requiresAuth: boolean;
        })[];
        totalEndpoints: number;
        totalCollections: number;
    }>;
    addFieldToCollection(collectionId: string, createFieldDto: CreateFieldDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        dbColumn: string;
        type: import(".prisma/client").$Enums.FieldType;
        required: boolean;
        collectionId: string;
    }>;
    updateCollectionSchema(collectionId: string, updateDto: UpdateCollectionSchemaDto): Promise<{
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
    getCollectionSchema(collectionId: string): Promise<{
        id: string;
        name: string;
        displayName: string;
        tableName: string;
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
    }>;
    getMetrics(): Promise<{
        users: number;
        collections: number;
        fields: number;
        permissions: number;
        timestamp: string;
    }>;
}
export {};
//# sourceMappingURL=system.controller.d.ts.map