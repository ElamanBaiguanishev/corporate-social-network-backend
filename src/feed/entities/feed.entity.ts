import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinTable } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';

@Entity('feed')
export class Feed {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    content: string;

    @Column({ nullable: true })
    title: string;

    @ManyToOne(() => User)
    author: User;

    @ManyToMany(() => User)
    @JoinTable({
        name: 'feed_tagged_users',
        joinColumn: {
            name: 'feed_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'user_id',
            referencedColumnName: 'id'
        }
    })
    taggedUsers: User[];

    @ManyToMany(() => Role)
    @JoinTable({
        name: 'feed_tagged_roles',
        joinColumn: {
            name: 'feed_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'role_id',
            referencedColumnName: 'id'
        }
    })
    taggedRoles: Role[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 