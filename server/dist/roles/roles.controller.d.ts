import { RolesService } from './roles.service';
export declare class RolesController {
    private rolesService;
    constructor(rolesService: RolesService);
    getAllRoles(): Promise<{
        id: string;
        name: string;
        displayName: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getRoleById(roleId: string): Promise<{
        id: string;
        name: string;
        displayName: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createRole(data: {
        name: string;
        displayName: string;
        description?: string;
    }): Promise<{
        id: string;
        name: string;
        displayName: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateRole(roleId: string, data: {
        displayName?: string;
        description?: string;
    }): Promise<{
        id: string;
        name: string;
        displayName: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteRole(roleId: string): Promise<{
        id: string;
        name: string;
        displayName: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
//# sourceMappingURL=roles.controller.d.ts.map