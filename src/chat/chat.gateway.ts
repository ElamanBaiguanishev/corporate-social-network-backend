import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { WsAuthGuard } from 'src/auth/ws-auth.guard';

@WebSocketGateway({
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true
    },
    path: '/socket.io',
    transports: ['websocket']
})
@UseGuards(WsAuthGuard)
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly chatService: ChatService,
        private readonly notificationsService: NotificationsService
    ) {}

    afterInit(server: Server) {
        console.log('WebSocket Gateway initialized');
    }

    async handleConnection(client: Socket) {
        console.log(`[WS] Client connected: ${client.id}`);
        console.log('[WS] Query params:', client.handshake.query);
        console.log('[WS] Auth headers:', client.handshake.headers);
    }

    handleDisconnect(client: Socket) {
        console.log(`[WS] Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinChat')
    async handleJoinChat(client: Socket, chatId: number) {
        const userId = client.data.user.id;
        console.log(`[WS] User ${userId} tries to join chat ${chatId}`);

        const chat = await this.chatService.getChat(chatId);
        const isParticipant = chat.participants.some(p => p.id === userId);

        if (!isParticipant) {
            console.log(`[WS] User ${userId} is NOT a participant of chat ${chatId}`);
            client.emit('error', { message: 'Access denied: not a participant of this chat' });
            return;
        }

        client.join(`chat:${chatId}`);
        console.log(`[WS] User ${userId} joined chat ${chatId}`);
    }

    @SubscribeMessage('leaveChat')
    async handleLeaveChat(client: Socket, chatId: number) {
        console.log(`[WS] Client ${client.id} leaving chat ${chatId}`);
        client.leave(`chat:${chatId}`);
        console.log(`[WS] Client ${client.id} left chat ${chatId}`);
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(client: Socket, payload: { chatId: number; content: string }) {
        console.log(`[WS] Received message from client ${client.id}:`, payload);
        try {
            const userId = client.data.user.id;
            const chat = await this.chatService.getChat(payload.chatId);
            const isParticipant = chat.participants.some(p => p.id === userId);
            
            if (!isParticipant) {
                console.log(`[WS] User ${userId} is NOT a participant of chat ${payload.chatId}`);
                client.emit('error', { message: 'Access denied: not a participant of this chat' });
                return;
            }

            console.log(`[WS] Processing message for user ${userId}`);
            const message = await this.chatService.createMessage(userId, payload);
            console.log('[WS] Message created:', message);

            // Отправляем сообщение всем участникам чата
            this.server.to(`chat:${payload.chatId}`).emit('newMessage', message);

            // Создаем уведомления для всех участников чата, кроме отправителя
            for (const participant of chat.participants) {
                if (participant.id !== userId) {
                    const notification = await this.notificationsService.createChatNotification(
                        `Новое сообщение в чате: ${message.content}`,
                        payload.chatId,
                        participant.id
                    );

                    // Отправляем уведомление конкретному пользователю
                    this.server.to(`user:${participant.id}`).emit('newNotification', notification);
                }
            }

            console.log(`[WS] Message broadcasted to chat ${payload.chatId}`);
        } catch (error) {
            console.log('[WS] Error sending message:', error);
            client.emit('error', { message: 'Failed to send message' });
        }
    }
} 