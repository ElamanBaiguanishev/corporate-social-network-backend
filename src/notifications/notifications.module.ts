import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notification } from './entities/notification.entity';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        TypeOrmModule.forFeature([Notification, User, Role]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (ConfigService: ConfigService) => ({
                secret: ConfigService.get('JWT_SECRET'),
                signOptions: { expiresIn: '30d' }
            }),
            inject: [ConfigService]
        })
    ],
    controllers: [NotificationsController],
    providers: [NotificationsService],
    exports: [NotificationsService]
})
export class NotificationsModule { } 