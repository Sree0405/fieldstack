import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  /**
   * Get user's notifications with pagination
   */
  @Get()
  async getNotifications(
    @Request() req: any,
    @Query('limit') limit: string = '100',
    @Query('offset') offset: string = '0',
  ) {
    return this.notificationsService.getNotifications(
      req.user.id,
      parseInt(limit),
      parseInt(offset),
    );
  }

  /**
   * Get unread notifications
   */
  @Get('unread')
  async getUnreadNotifications(@Request() req: any, @Query('limit') limit: string = '50') {
    const notifications = await this.notificationsService.getUnreadNotifications(
      req.user.id,
      parseInt(limit),
    );
    const count = await this.notificationsService.getUnreadCount(req.user.id);

    return {
      notifications,
      unreadCount: count,
    };
  }

  /**
   * Get unread notification count
   */
  @Get('unread/count')
  async getUnreadCount(@Request() req: any) {
    const count = await this.notificationsService.getUnreadCount(req.user.id);
    return { unreadCount: count };
  }

  /**
   * Get a single notification
   */
  @Get(':id')
  async getNotification(@Param('id') id: string, @Request() req: any) {
    const notification = await this.notificationsService.getNotifications(req.user.id, 1, 0);
    const found = notification.notifications.find((n: any) => n.id === id);

    if (!found) {
      return { error: 'Notification not found', statusCode: 404 };
    }

    return found;
  }

  /**
   * Mark a notification as read
   */
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  /**
   * Mark multiple notifications as read
   */
  @Patch('read/bulk')
  async markMultipleAsRead(@Body() body: { notificationIds: string[] }) {
    return this.notificationsService.markMultipleAsRead(body.notificationIds);
  }

  /**
   * Mark all notifications as read
   */
  @Patch('read/all')
  async markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  /**
   * Delete a notification
   */
  @Delete(':id')
  async deleteNotification(@Param('id') id: string) {
    await this.notificationsService.deleteNotification(id);
    return { success: true, message: 'Notification deleted' };
  }

  /**
   * Delete multiple notifications
   */
  @Delete('bulk')
  async deleteMultipleNotifications(@Body() body: { notificationIds: string[] }) {
    await this.notificationsService.deleteMultipleNotifications(body.notificationIds);
    return { success: true, message: 'Notifications deleted' };
  }

  /**
   * Clear all notifications for a user (with soft-delete approach: mark all as deleted)
   */
  @Delete()
  async clearAllNotifications(@Request() req: any) {
    const { notifications } = await this.notificationsService.getNotifications(req.user.id, 10000, 0);
    const notificationIds = notifications.map((n: any) => n.id);

    if (notificationIds.length === 0) {
      return { success: true, message: 'No notifications to clear' };
    }

    await this.notificationsService.deleteMultipleNotifications(notificationIds);
    return { success: true, message: `${notificationIds.length} notifications cleared` };
  }
}
