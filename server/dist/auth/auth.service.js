"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let AuthService = class AuthService {
    constructor(jwtService, prisma) {
        this.jwtService = jwtService;
        this.prisma = prisma;
    }
    async register(registerDto) {
        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: registerDto.email },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('User with this email already exists');
        }
        // Get the default role (viewer)
        let role = await this.prisma.role.findUnique({
            where: { name: registerDto.role?.toLowerCase() || 'viewer' },
        });
        if (!role) {
            role = await this.prisma.role.findUnique({
                where: { name: 'viewer' },
            });
        }
        if (!role) {
            throw new common_1.BadRequestException('Default role not found');
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(registerDto.password, 12);
        // Create user
        const user = await this.prisma.user.create({
            data: {
                email: registerDto.email,
                password: hashedPassword,
                profile: {
                    create: {
                        email: registerDto.email,
                        displayName: registerDto.displayName,
                    },
                },
                roles: {
                    create: {
                        roleId: role.id,
                    },
                },
            },
            include: {
                roles: {
                    include: {
                        role: true,
                    },
                },
                profile: true,
            },
        });
        const payload = {
            sub: user.id,
            email: user.email,
            roles: user.roles.map((r) => r.role.name),
        };
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
        });
        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
        });
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                displayName: user.profile?.displayName,
                roles: user.roles.map((r) => r.role.name),
            },
        };
    }
    async login(loginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email },
            include: {
                roles: {
                    include: {
                        role: true,
                    },
                },
                profile: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = {
            sub: user.id,
            email: user.email,
            roles: user.roles.map((r) => r.role.name),
        };
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
        });
        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
        });
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                displayName: user.profile?.displayName,
                roles: user.roles.map((r) => r.role.name),
            },
        };
    }
    async refresh(refreshDto) {
        try {
            const payload = this.jwtService.verify(refreshDto.refreshToken);
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                include: {
                    roles: {
                        include: {
                            role: true,
                        },
                    },
                },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
            }
            const newPayload = {
                sub: user.id,
                email: user.email,
                roles: user.roles.map((r) => r.role.name),
            };
            const accessToken = this.jwtService.sign(newPayload, {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
            });
            return { accessToken };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async validateToken(payload) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                include: {
                    roles: {
                        include: {
                            role: true,
                        },
                    },
                    profile: true,
                },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
            }
            return {
                id: user.id,
                email: user.email,
                displayName: user.profile?.displayName,
                roles: user.roles.map((r) => r.role.name),
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
    async getAllUsers() {
        const users = await this.prisma.user.findMany({
            include: {
                roles: {
                    include: {
                        role: true,
                    },
                },
                profile: true,
            },
        });
        return users.map((user) => ({
            id: user.id,
            email: user.email,
            displayName: user.profile?.displayName,
            avatarUrl: user.profile?.avatarUrl,
            roles: user.roles.map((r) => ({
                id: r.role.id,
                name: r.role.name,
                displayName: r.role.displayName,
            })),
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }));
    }
    async changePassword(userId, currentPassword, newPassword) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
            }
            // Verify current password
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Current password is incorrect');
            }
            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 12);
            // Update password
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    password: hashedPassword,
                },
            });
            return {
                success: true,
                message: 'Password changed successfully',
            };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to change password');
        }
    }
    async updateUser(userId, data) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
            }
            // Update user profile if displayName is provided
            if (data.displayName !== undefined) {
                await this.prisma.profile.update({
                    where: { id: userId },
                    data: {
                        displayName: data.displayName,
                    },
                });
            }
            // Update user roles if provided
            if (data.roles && Array.isArray(data.roles)) {
                // Delete existing roles
                await this.prisma.userRole.deleteMany({
                    where: { userId },
                });
                // Create new roles (roles can be role names or IDs)
                for (const roleName of data.roles) {
                    const role = await this.prisma.role.findUnique({
                        where: { name: roleName.toLowerCase() },
                    });
                    if (role) {
                        await this.prisma.userRole.create({
                            data: {
                                userId,
                                roleId: role.id,
                            },
                        });
                    }
                }
            }
            // Fetch updated user
            const updatedUser = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    roles: {
                        include: {
                            role: true,
                        },
                    },
                    profile: true,
                },
            });
            return {
                id: updatedUser?.id,
                email: updatedUser?.email,
                displayName: updatedUser?.profile?.displayName,
                avatarUrl: updatedUser?.profile?.avatarUrl,
                roles: updatedUser?.roles.map((r) => ({
                    id: r.role.id,
                    name: r.role.name,
                    displayName: r.role.displayName,
                })),
            };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to update user');
        }
    }
    async deleteUser(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
            }
            // Delete user (cascade will handle roles and profile)
            await this.prisma.user.delete({
                where: { id: userId },
            });
            return {
                success: true,
                message: 'User deleted successfully',
            };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to delete user');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        prisma_service_1.PrismaService])
], AuthService);
