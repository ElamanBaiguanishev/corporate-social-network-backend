import { Role } from "src/roles/entities/role.entity"


export interface PayloadUser {
    email: string, id: number, role: Role
}

export interface ReqPayloadUser {
    user: { email: string, id: number, role: Role }
}