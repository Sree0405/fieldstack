"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RolesService = class RolesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllRoles() {
        return this.prisma.role.findMany({
            orderBy: {
                createdAt: 'asc',
            },
        });
    }
    async getRoleById(roleId) {
        const role = await this.prisma.role.findUnique({
            where: { id: roleId },
        });
        if (!role) {
            throw new common_1.NotFoundException('Role not found');
        }
        return role;
    }
    async createRole(data) {
        // Check if role already exists
        const existingRole = await this.prisma.role.findUnique({
            where: { name: data.name.toLowerCase() },
        });
        if (existingRole) {
            throw new common_1.BadRequestException('Role with this name already exists');
        }
        return this.prisma.role.create({
            data: {
                name: data.name.toLowerCase(),
                displayName: data.displayName,
                description: data.description,
            },
        });
    }
    async updateRole(roleId, data) {
        const role = await this.prisma.role.findUnique({
            where: { id: roleId },
        });
        if (!role) {
            throw new common_1.NotFoundException('Role not found');
        }
        return this.prisma.role.update({
            where: { id: roleId },
            data,
        });
    }
    async deleteRole(roleId) {
        const role = await this.prisma.role.findUnique({
            where: { id: roleId },
            include: {
                users: true,
            },
        });
        if (!role) {
            throw new common_1.NotFoundException('Role not found');
        }
        // Prevent deletion of built-in roles with users
        if (['admin', 'editor', 'viewer'].includes(role.name) &&
            role.users.length > 0) {
            throw new common_1.BadRequestException('Cannot delete built-in roles that have users assigned');
        }
        // Check if role is in use
        if (role.users.length > 0) {
            throw new common_1.BadRequestException('Cannot delete role with active users');
        }
        return this.prisma.role.delete({
            where: { id: roleId },
        });
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RolesService);
