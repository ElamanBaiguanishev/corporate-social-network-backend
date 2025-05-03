import { Message } from './message.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';

@Entity('attachments')
export class Attachment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    filename: string;

    @Column()
    path: string;

    @Column()
    mimeType: string;

    @Column({ nullable: true })
    size: number;

    @ManyToOne(() => Message, message => message.attachments)
    message: Message;

    @CreateDateColumn()
    createdAt: Date;
} 