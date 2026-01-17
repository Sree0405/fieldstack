import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getAllRoles() {
    return this.rolesService.getAllRoles();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getRoleById(@Param('id') roleId: string) {
    return this.rolesService.getRoleById(roleId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createRole(
    @Body() data: { name: string; displayName: string; description?: string }
  ) {
    return this.rolesService.createRole(data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateRole(
    @Param('id') roleId: string,
    @Body() data: { displayName?: string; description?: string }
  ) {
    return this.rolesService.updateRole(roleId, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteRole(@Param('id') roleId: string) {
    return this.rolesService.deleteRole(roleId);
  }
}
