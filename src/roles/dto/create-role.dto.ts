import { RoleTypes } from "../entities/role.entity";

export class CreateRoleDto {
    id?: number; // Необязательное поле, если роль уже существует
    type: RoleTypes; // Используем перечисление RoleTypes
    name: string;
    semesters?: string[];
}
