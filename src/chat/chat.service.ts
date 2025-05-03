import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { Attachment } from './entities/attachment.entity';
import { User } from 'src/users/entities/user.entity';
import { In } from 'typeorm';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(Chat)
        private readonly chatRepository: Repository<Chat>,
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
        @InjectRepository(Attachment)
        private readonly attachmentRepository: Repository<Attachment>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async createPrivateChat(userId1: number, userId2: number): Promise<Chat> {
        // Check if a private chat already exists between these users
        const existingChat = await this.chatRepository
            .createQueryBuilder('chat')
            .leftJoinAndSelect('chat.participants', 'participants')
            .where('chat.isGroup = :isGroup', { isGroup: false })
            .andWhere('participants.id IN (:...userIds)', { userIds: [userId1, userId2] })
            .getOne();

        if (existingChat) {
            return existingChat;
        }

        const user1 = await this.userRepository.findOne({ where: { id: userId1 } });
        const user2 = await this.userRepository.findOne({ where: { id: userId2 } });

        if (!user1 || !user2) {
            throw new Error('One or both users not found');
        }

        const chat = new Chat();
        chat.isGroup = false;
        chat.participants = [user1, user2];

        return this.chatRepository.save(chat);
    }

    async createGroupChat(name: string, creatorId: number, participantIds: number[]): Promise<Chat> {
        const creator = await this.userRepository.findOne({ where: { id: creatorId } });
        const participants = await this.userRepository.findBy({ id: In(participantIds) });

        if (!creator) {
            throw new Error('Creator not found');
        }

        const chat = new Chat();
        chat.name = name;
        chat.isGroup = true;
        chat.participants = [creator, ...participants];

        return this.chatRepository.save(chat);
    }

    async getChat(chatId: number): Promise<Chat> {
        const chat = await this.chatRepository.findOne({
            where: { id: chatId },
            relations: ['participants', 'messages', 'messages.sender', 'messages.attachments'],
        });

        if (!chat) {
            throw new Error('Chat not found');
        }

        return chat;
    }

    async getUserChatsByUserId(userId: number): Promise<Chat[]> {
        // 1. Получаем chatId всех чатов, где участвует userId
        const chatIds = (await this.chatRepository
            .createQueryBuilder('chat')
            .leftJoin('chat.participants', 'participants')
            .where('participants.id = :userId', { userId })
            .select('chat.id')
            .getMany()).map(chat => chat.id);

        if (!chatIds.length) return [];

        // 2. Получаем все чаты с нужными связями по этим chatId
        return this.chatRepository
            .createQueryBuilder('chat')
            .leftJoinAndSelect('chat.participants', 'participants')
            .leftJoinAndSelect('chat.messages', 'messages')
            .leftJoinAndSelect('messages.sender', 'sender')
            .leftJoinAndSelect('messages.attachments', 'attachments')
            .where('chat.id IN (:...chatIds)', { chatIds })
            .orderBy('messages.createdAt', 'DESC')
            .getMany();
    }

    async getUserChats(): Promise<Chat[]> {
        return this.chatRepository
            .createQueryBuilder('chat')
            .leftJoinAndSelect('chat.participants', 'participants')
            .leftJoinAndSelect('chat.messages', 'messages')
            .leftJoinAndSelect('messages.sender', 'sender')
            .leftJoinAndSelect('messages.attachments', 'attachments')
            .orderBy('messages.createdAt', 'DESC')
            .getMany();
    }

    async createMessage(userId: number, payload: { chatId: number; content: string; attachments?: any[] }): Promise<Message> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        const chat = await this.chatRepository.findOne({ where: { id: payload.chatId } });

        if (!user || !chat) {
            throw new Error('User or chat not found');
        }

        const message = new Message();
        message.content = payload.content;
        message.sender = user;
        message.chat = chat;

        const savedMessage = await this.messageRepository.save(message);

        if (payload.attachments && payload.attachments.length > 0) {
            const attachments = payload.attachments.map(attachment => {
                const newAttachment = new Attachment();
                newAttachment.filename = attachment.filename;
                newAttachment.path = attachment.path;
                newAttachment.mimeType = attachment.mimeType;
                newAttachment.size = attachment.size;
                newAttachment.message = savedMessage;
                return newAttachment;
            });

            await this.attachmentRepository.save(attachments);
        }

        return this.messageRepository.findOneOrFail({
            where: { id: savedMessage.id },
            relations: ['sender', 'attachments'],
        });
    }

    async getChatMessages(chatId: number, page: number = 1, limit: number = 50): Promise<Message[]> {
        return this.messageRepository.find({
            where: { chat: { id: chatId } },
            relations: ['sender', 'attachments'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
    }
} 