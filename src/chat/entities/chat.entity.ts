import { User } from 'src/users/entities/user.entity';
import { Message } from './message.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany, CreateDateColumn, UpdateDateColumn, JoinTable } from 'typeorm';

@Entity('chats')
export class Chat {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    name: string;

    @Column({ default: false })
    isGroup: boolean;

    @ManyToMany(() => User, user => user.chats)
    @JoinTable({
        name: 'chat_participants',
        joinColumn: {
            name: 'chat_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'user_id',
            referencedColumnName: 'id'
        }
    })
    participants: User[];

    @OneToMany(() => Message, message => message.chat)
    messages: Message[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 