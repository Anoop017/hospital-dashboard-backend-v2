import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user notifications with pagination and filters' })
  findMyNotifications(@Request() req: any, @Query() queryDto: QueryNotificationDto) {
    const userId = Number(req.user.userId || req.user.sub || req.user.id);
    return this.notificationsService.findMyNotifications(userId, queryDto);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count for the current user' })
  @ApiResponse({ status: 200, description: 'Returns { count: number }' })
  getUnreadCount(@Request() req: any) {
    const userId = Number(req.user.userId || req.user.sub || req.user.id);
    return this.notificationsService.getUnreadCount(userId);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all unread notifications as read for the current user' })
  markAllAsRead(@Request() req: any) {
    const userId = Number(req.user.userId || req.user.sub || req.user.id);
    return this.notificationsService.markAllAsRead(userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a single notification as read' })
  markAsRead(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userId = Number(req.user.userId || req.user.sub || req.user.id);
    return this.notificationsService.markAsRead(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete/dismiss a notification' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userId = Number(req.user.userId || req.user.sub || req.user.id);
    return this.notificationsService.remove(id, userId);
  }
}
