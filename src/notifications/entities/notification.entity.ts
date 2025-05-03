import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';

export enum NotificationType {
    NEWS = 'news',
    CHAT = 'chat'
}

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: NotificationType
    })
    type: NotificationType;

    @Column('text')
    content: string;

    @Column({ default: false })
    isRead: boolean;

    @ManyToOne(() => User, { nullable: true })
    recipient: User;

    @ManyToOne(() => Role, { nullable: true })
    role: Role;

    @Column({ nullable: true })
    chatId: number;

    @CreateDateColumn()
    createdAt: Date;
} 