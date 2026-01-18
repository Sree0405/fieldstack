import { PrismaService } from '../prisma/prisma.service';
import { FieldValidationService } from '../collections/field-validation.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class CrudService {
    private prisma;
    private fieldValidation;
    private notificationsService;
    constructor(prisma: PrismaService, fieldValidation: FieldValidationService, notificationsService: NotificationsService);
    list(collectionName: string, page?: number, limit?: number, userId?: string): Promise<{
        collection: string;
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        data: unknown;
        fields: {
            id: any;
            name: any;
            displayName: any;
            dbColumn: any;
            type: any;
            required: any;
            uiComponent: any;
            searchable: any;
            sortable: any;
            filterable: any;
        }[];
    } | {
        collection: string;
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        data: never[];
        fields: {
            id: any;
            name: any;
            displayName: any;
            dbColumn: any;
            type: any;
            required: any;
        }[];
    }>;
    getOne(collectionName: string, id: string): Promise<{
        id: string;
        collection: string;
        data: any;
    }>;
    create(collectionName: string, data: any, userId?: string): Promise<{
        id: any;
        collection: string;
        data: any;
        createdAt: Date;
    }>;
    update(collectionName: string, id: string, data: any, userId?: string): Promise<{
        id: string;
        collection: string;
        data: any;
        updatedAt: Date;
    }>;
    delete(collectionName: string, id: string, userId?: string): Promise<{
        success: boolean;
        id: string;
    }>;
}
//# sourceMappingURL=crud.service.d.ts.map