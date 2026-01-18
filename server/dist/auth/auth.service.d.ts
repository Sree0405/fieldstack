import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private jwtService;
    private prisma;
    constructor(jwtService: JwtService, prisma: PrismaService);
    register(registerDto: any): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            displayName: string | null | undefined;
            roles: string[];
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            displayName: string | null | undefined;
            roles: string[];
        };
    }>;
    refresh(refreshDto: {
        refreshToken: string;
    }): Promise<{
        accessToken: string;
    }>;
    validateToken(payload: any): Promise<{
        id: string;
        email: string;
        displayName: string | null | undefined;
        roles: any[];
    }>;
    getAllUsers(): Promise<{
        id: string;
        email: string;
        displayName: string | null | undefined;
        avatarUrl: string | null | undefined;
        roles: {
            id: string;
            name: string;
            displayName: string;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        success: boolean;
        message: string;
    }>;
    updateUser(userId: string, data: any): Promise<{
        id: string | undefined;
        email: string | undefined;
        displayName: string | null | undefined;
        avatarUrl: string | null | undefined;
        roles: {
            id: string;
            name: string;
            displayName: string;
        }[] | undefined;
    }>;
    deleteUser(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map