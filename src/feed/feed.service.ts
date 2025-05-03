import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feed } from './entities/feed.entity';
import { CreateFeedDto } from './dto/create-feed.dto';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class FeedService {
    constructor(
        @InjectRepository(Feed)
        private feedRepository: Repository<Feed>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
        private notificationsService: NotificationsService
    ) {}

    async create(createFeedDto: CreateFeedDto, authorId: number): Promise<Feed> {
        const author = await this.userRepository.findOne({ where: { id: authorId } });
        if (!author) {
            throw new NotFoundException('Author not found');
        }

        const feed = this.feedRepository.create({
            ...createFeedDto,
            author
        });

        // Handle tagged users
        if (createFeedDto.taggedUserIds?.length) {
            const taggedUsers = await this.userRepository.findByIds(createFeedDto.taggedUserIds);
            feed.taggedUsers = taggedUsers;
        }

        // Handle tagged roles
        if (createFeedDto.taggedRoleIds?.length) {
            const taggedRoles = await this.roleRepository.findByIds(createFeedDto.taggedRoleIds);
            feed.taggedRoles = taggedRoles;
        }

        const savedFeed = await this.feedRepository.save(feed);

        // Create notifications for tagged users
        if (feed.taggedUsers?.length) {
            for (const user of feed.taggedUsers) {
                await this.notificationsService.createNewsNotification(
                    `Вас отметили в публикации: ${feed.title || feed.content.substring(0, 50)}...`,
                    user.id
                );
            }
        }

        // Create notifications for users with tagged roles
        if (feed.taggedRoles?.length) {
            for (const role of feed.taggedRoles) {
                const usersWithRole = await this.userRepository.find({
                    where: { role: { id: role.id } }
                });
                
                for (const user of usersWithRole) {
                    await this.notificationsService.createNewsNotification(
                        `Новая публикация для вашей роли ${role.name}: ${feed.title || feed.content.substring(0, 50)}...`,
                        user.id
                    );
                }
            }
        }

        return savedFeed;
    }

    async findAll(): Promise<Feed[]> {
        return this.feedRepository.find({
            relations: ['author', 'taggedUsers', 'taggedRoles'],
            order: { createdAt: 'DESC' }
        });
    }

    async findOne(id: number): Promise<Feed> {
        const feed = await this.feedRepository.findOne({
            where: { id },
            relations: ['author', 'taggedUsers', 'taggedRoles']
        });

        if (!feed) {
            throw new NotFoundException('Feed post not found');
        }

        return feed;
    }

    async findByUser(userId: number): Promise<Feed[]> {
        return this.feedRepository.find({
            where: { author: { id: userId } },
            relations: ['author', 'taggedUsers', 'taggedRoles'],
            order: { createdAt: 'DESC' }
        });
    }

    async findByTaggedUser(userId: number): Promise<Feed[]> {
        return this.feedRepository
            .createQueryBuilder('feed')
            .leftJoinAndSelect('feed.taggedUsers', 'user')
            .leftJoinAndSelect('feed.author', 'author')
            .leftJoinAndSelect('feed.taggedRoles', 'role')
            .where('user.id = :userId', { userId })
            .orderBy('feed.createdAt', 'DESC')
            .getMany();
    }

    async findByTaggedRole(roleId: number): Promise<Feed[]> {
        return this.feedRepository
            .createQueryBuilder('feed')
            .leftJoinAndSelect('feed.taggedRoles', 'role')
            .leftJoinAndSelect('feed.author', 'author')
            .leftJoinAndSelect('feed.taggedUsers', 'user')
            .where('role.id = :roleId', { roleId })
            .orderBy('feed.createdAt', 'DESC')
            .getMany();
    }
} 