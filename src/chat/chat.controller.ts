import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { RolesGuard } from 'src/auth/roles-guard';

@Controller('chat')
@UseGuards(RolesGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Get()
    async getUserChats() {
        return this.chatService.getUserChats();
    }

    @Get(':id')
    async getChat(@Param('id') id: number) {
        return this.chatService.getChat(id);
    }

    @Get('by-user/:userId')
    async getUserChatsByUserId(@Param('userId') userId: number) {
        return this.chatService.getUserChatsByUserId(userId);
    }

    @Post('private')
    async createPrivateChat(@Body() payload: { userId1: number; userId2: number }) {
        return this.chatService.createPrivateChat(payload.userId1, payload.userId2);
    }

    @Post('group')
    async createGroupChat(
        @Body() payload: { name: string; creatorId: number; participantIds: number[] }
    ) {
        return this.chatService.createGroupChat(
            payload.name,
            payload.creatorId,
            payload.participantIds
        );
    }

    @Get(':id/messages')
    async getChatMessages(
        @Param('id') chatId: number,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 50
    ) {
        return this.chatService.getChatMessages(chatId, page, limit);
    }
} 