import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
    ) {}

    async createNewsNotification(content: string, roleId?: number, userIds?: number[]) {
        const notifications: Notification[] = [];

        if (roleId) {
            const role = await this.roleRepository.findOne({ where: { id: roleId } });
            if (role) {
                const notification = this.notificationRepository.create({
                    type: NotificationType.NEWS,
                    content,
                    role
                });
                notifications.push(notification);
            }
        }

        if (userIds && userIds.length > 0) {
            const users = await this.userRepository.find({ where: { id: In(userIds) } });
            for (const user of users) {
                const notification = this.notificationRepository.create({
                    type: NotificationType.NEWS,
                    content,
                    recipient: user
                });
                notifications.push(notification);
            }
        }

        return this.notificationRepository.save(notifications);
    }

    async createChatNotification(content: string, chatId: number, recipientId: number) {
        const recipient = await this.userRepository.findOne({ where: { id: recipientId } });
        if (!recipient) return null;

        const notification = this.notificationRepository.create({
            type: NotificationType.CHAT,
            content,
            recipient,
            chatId
        });

        return this.notificationRepository.save(notification);
    }

    async getUserNotifications(userId: number) {
        return this.notificationRepository.find({
            where: [
                { recipient: { id: userId } },
                { role: { users: { id: userId } } }
            ],
            relations: ['recipient', 'role'],
            order: { createdAt: 'DESC' }
        });
    }

    async markAsRead(notificationId: number) {
        const notification = await this.notificationRepository.findOne({
            where: { id: notificationId }
        });
        
        if (notification) {
            notification.isRead = true;
            return this.notificationRepository.save(notification);
        }
        
        return null;
    }

    async markAllAsRead(userId: number) {
        await this.notificationRepository.update(
            { recipient: { id: userId }, isRead: false },
            { isRead: true }
        );
    }

    async getUnreadCount(userId: number) {
        return this.notificationRepository.count({
            where: [
                { recipient: { id: userId }, isRead: false },
                { role: { users: { id: userId } }, isRead: false }
            ]
        });
    }
} 