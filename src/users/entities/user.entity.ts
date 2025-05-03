import { Role } from 'src/roles/entities/role.entity';
import { Chat } from 'src/chat/entities/chat.entity';
import { Message } from 'src/chat/entities/message.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, OneToMany } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    username: string;

    @ManyToOne(() => Role, role => role.users)
    role: Role;

    @ManyToMany(() => Chat, chat => chat.participants)
    chats: Chat[];

    @OneToMany(() => Message, message => message.sender)
    messages: Message[];
}
