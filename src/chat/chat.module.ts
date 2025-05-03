import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { Attachment } from './entities/attachment.entity';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { User } from 'src/users/entities/user.entity';
import { RolesModule } from 'src/roles/roles.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
@Module({
    imports: [
        TypeOrmModule.forFeature([Chat, Message, Attachment, User]),
        AuthModule,
        UsersModule,
        RolesModule,
        NotificationsModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (ConfigService: ConfigService) => ({
                secret: ConfigService.get('JWT_SECRET'),
                signOptions: { expiresIn: '30d' }
            }),
            inject: [ConfigService]
        })
    ],
    providers: [ChatService, ChatGateway],
    controllers: [ChatController],
    exports: [ChatService],
})
export class ChatModule { } 