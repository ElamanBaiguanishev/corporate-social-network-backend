import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleTypes } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(@InjectRepository(Role) private readonly rolesRepository: Repository<Role>) { }

  async findAll() {
    return this.rolesRepository.find();
  }

  async getRoleById(id: number): Promise<Role> {
    const role = await this.rolesRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException('Роль не найдена');
    }
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const studyMode = await this.getRoleById(id);
    this.rolesRepository.merge(studyMode, updateRoleDto);
    return await this.rolesRepository.save(studyMode);
  }

  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    const newRole = this.rolesRepository.create(createRoleDto);
    return await this.rolesRepository.save(newRole);
  }

  async getRoleByName(value: string) {
    console.log(value)
    const role = await this.rolesRepository.findOne({
      where: {
        name: value
      }
    })
    return role
  }

  async getRoleByType(value: RoleTypes) {
    const role = await this.rolesRepository.find({
      where: {
        type: value
      }
    })
    return role
  }
}
