import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
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
    refresh(refreshDto: RefreshDto): Promise<{
        accessToken: string;
    }>;
    getMe(req: any): Promise<{
        id: string;
        email: string;
        displayName: string | null | undefined;
        roles: any[];
    }>;
    changePassword(req: any, body: {
        currentPassword: string;
        newPassword: string;
    }): Promise<{
        success: boolean;
        message: string;
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
    updateUser(userId: string, body: any): Promise<{
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
//# sourceMappingURL=auth.controller.d.ts.map