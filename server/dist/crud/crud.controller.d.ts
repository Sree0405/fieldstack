import { CrudService } from './crud.service';
export declare class CrudController {
    private crudService;
    constructor(crudService: CrudService);
    list(collection: string, page?: string, limit?: string): Promise<{
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
    getOne(collection: string, id: string): Promise<{
        id: string;
        collection: string;
        data: any;
    }>;
    create(collection: string, data: any): Promise<{
        id: any;
        collection: string;
        data: any;
        createdAt: Date;
    }>;
    update(collection: string, id: string, data: any): Promise<{
        id: string;
        collection: string;
        data: any;
        updatedAt: Date;
    }>;
    delete(collection: string, id: string): Promise<{
        success: boolean;
        id: string;
    }>;
}
//# sourceMappingURL=crud.controller.d.ts.map