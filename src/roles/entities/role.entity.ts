// role.entity.ts
import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

export enum RoleTypes {
    ADMIN = 'ADMIN',
    DEPUTY = 'DEPUTY',
    MANAGER = 'MANAGER'
}

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: RoleTypes,
        default: RoleTypes.ADMIN
    })
    type: RoleTypes;

    @Column()
    name: string;

    @OneToMany(() => User, user => user.role)
    users: User[];
}
