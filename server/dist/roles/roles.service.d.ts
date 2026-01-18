import { PrismaService } from '../prisma/prisma.service';
export declare class RolesService {
    private prisma;
    constructor(prisma: PrismaService);
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
//# sourceMappingURL=roles.service.d.ts.map