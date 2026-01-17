import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async getAllRoles() {
    return this.prisma.role.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async getRoleById(roleId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async createRole(data: {
    name: string;
    displayName: string;
    description?: string;
  }) {
    // Check if role already exists
    const existingRole = await this.prisma.role.findUnique({
      where: { name: data.name.toLowerCase() },
    });

    if (existingRole) {
      throw new BadRequestException('Role with this name already exists');
    }

    return this.prisma.role.create({
      data: {
        name: data.name.toLowerCase(),
        displayName: data.displayName,
        description: data.description,
      },
    });
  }

  async updateRole(
    roleId: string,
    data: {
      displayName?: string;
      description?: string;
    }
  ) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return this.prisma.role.update({
      where: { id: roleId },
      data,
    });
  }

  async deleteRole(roleId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        users: true,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Prevent deletion of built-in roles with users
    if (
      ['admin', 'editor', 'viewer'].includes(role.name) &&
      role.users.length > 0
    ) {
      throw new BadRequestException(
        'Cannot delete built-in roles that have users assigned'
      );
    }

    // Check if role is in use
    if (role.users.length > 0) {
      throw new BadRequestException('Cannot delete role with active users');
    }

    return this.prisma.role.delete({
      where: { id: roleId },
    });
  }
}
