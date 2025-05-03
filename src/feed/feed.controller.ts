import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { FeedService } from './feed.service';
import { CreateFeedDto } from './dto/create-feed.dto';
import { RolesGuard } from '../auth/roles-guard';
import { Roles } from '../auth/roles-auth.decorator';
import { RoleTypes } from '../roles/entities/role.entity';

@Controller('feed')
@UseGuards(RolesGuard)
export class FeedController {
    constructor(private readonly feedService: FeedService) {}

    @Post()
    @UseGuards(RolesGuard)
    @Roles(RoleTypes.ADMIN, RoleTypes.DEPUTY, RoleTypes.MANAGER)
    create(@Body() createFeedDto: CreateFeedDto, @Request() req) {
        return this.feedService.create(createFeedDto, req.user.id);
    }

    @Get()
    findAll() {
        return this.feedService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.feedService.findOne(+id);
    }

    @Get('user/:userId')
    findByUser(@Param('userId') userId: string) {
        return this.feedService.findByUser(+userId);
    }

    @Get('tagged/user/:userId')
    findByTaggedUser(@Param('userId') userId: string) {
        return this.feedService.findByTaggedUser(+userId);
    }

    @Get('tagged/role/:roleId')
    findByTaggedRole(@Param('roleId') roleId: string) {
        return this.feedService.findByTaggedRole(+roleId);
    }
} 