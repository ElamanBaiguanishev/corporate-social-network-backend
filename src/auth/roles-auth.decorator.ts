import { SetMetadata } from "@nestjs/common"
import { RoleTypes } from "src/roles/entities/role.entity"

export const ROLES_KEY = 'roles'

export const Roles = (...roles: RoleTypes[]) => SetMetadata(ROLES_KEY, roles)