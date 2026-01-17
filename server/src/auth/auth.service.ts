import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async register(registerDto: any) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
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
      throw new BadRequestException('Default role not found');
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
      roles: user.roles.map((r: any) => r.role.name),
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: (process.env.ACCESS_TOKEN_EXPIRES_IN as any) || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN as any) || '7d',
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

  async login(loginDto: LoginDto) {
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
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((r: any) => r.role.name),
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: (process.env.ACCESS_TOKEN_EXPIRES_IN as any) || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN as any) || '7d',
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

  async refresh(refreshDto: { refreshToken: string }) {
    try {
      const payload = this.jwtService.verify(refreshDto.refreshToken) as any;
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
        throw new UnauthorizedException('User not found');
      }

      const newPayload = {
        sub: user.id,
        email: user.email,
        roles: user.roles.map((r: any) => r.role.name),
      };

      const accessToken = this.jwtService.sign(newPayload, {
        expiresIn: (process.env.ACCESS_TOKEN_EXPIRES_IN as any) || '15m',
      });

      return { accessToken };
    } catch (error: any) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateToken(payload: any) {
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
        throw new UnauthorizedException('User not found');
      }

      return {
        id: user.id,
        email: user.email,
        displayName: user.profile?.displayName,
        roles: user.roles.map((r: any) => r.role.name),
      };
    } catch (error: any) {
      throw new UnauthorizedException('Invalid token');
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

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
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
    } catch (error: any) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Failed to change password');
    }
  }

  async updateUser(userId: string, data: any) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
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
    } catch (error: any) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Failed to update user');
    }
  }

  async deleteUser(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Delete user (cascade will handle roles and profile)
      await this.prisma.user.delete({
        where: { id: userId },
      });

      return {
        success: true,
        message: 'User deleted successfully',
      };
    } catch (error: any) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete user');
    }
  }
}
