import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleTypes } from './entities/role.entity';
import { RolesService } from './roles.service';
import { RolesGuard } from 'src/auth/roles-guard';
import { Roles } from 'src/auth/roles-auth.decorator';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  @Get()
  findAll() {
    return this.rolesService.findAll()
  }

  @Post()
  @Roles(RoleTypes.ADMIN)
  @UseGuards(RolesGuard)
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.createRole(dto)
  }

  @Patch(':id')
  @Roles(RoleTypes.ADMIN)
  @UseGuards(RolesGuard)
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(+id, dto)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.getRoleById(+id);
  }

  @Get('/by-name/:name')
  getByName(@Param('name') value: string) {
    return this.rolesService.getRoleByName(value);
  }

  @Get('/by-type/:type')
  getByType(@Param('type') value: RoleTypes) {
    return this.rolesService.getRoleByType(value);
  }
}
