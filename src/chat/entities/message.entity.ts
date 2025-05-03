import { User } from 'src/users/entities/user.entity';
import { Chat } from './chat.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Attachment } from './attachment.entity';

@Entity('messages')
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    content: string;

    @ManyToOne(() => User, user => user.messages)
    sender: User;

    @ManyToOne(() => Chat, chat => chat.messages)
    chat: Chat;

    @OneToMany(() => Attachment, attachment => attachment.message)
    attachments: Attachment[];

    @CreateDateColumn()
    createdAt: Date;
} 