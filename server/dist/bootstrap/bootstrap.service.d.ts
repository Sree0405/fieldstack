import { PrismaService } from '../prisma/prisma.service';
export declare class BootstrapService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    init(): Promise<void>;
    private checkDatabase;
    private seedRoles;
    private seedCollections;
    private seedAdminUser;
    private seedPermissions;
}
//# sourceMappingURL=bootstrap.service.d.ts.map