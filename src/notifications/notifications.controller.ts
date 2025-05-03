import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { RolesGuard } from 'src/auth/roles-guard';

@Controller('notifications')
@UseGuards(RolesGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    @Get()
    async getUserNotifications(@Request() req) {
        return this.notificationsService.getUserNotifications(req.user.id);
    }

    @Get('unread-count')
    async getUnreadCount(@Request() req) {
        return this.notificationsService.getUnreadCount(req.user.id);
    }

    @Post(':id/read')
    async markAsRead(@Param('id') id: number) {
        return this.notificationsService.markAsRead(id);
    }

    @Post('read-all')
    async markAllAsRead(@Request() req) {
        return this.notificationsService.markAllAsRead(req.user.id);
    }
} 