import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  COLLECTION_CREATED = 'COLLECTION_CREATED',
  COLLECTION_UPDATED = 'COLLECTION_UPDATED',
  RECORD_CREATED = 'RECORD_CREATED',
  RECORD_UPDATED = 'RECORD_UPDATED',
  RECORD_DELETED = 'RECORD_DELETED',
  PERMISSION_CHANGED = 'PERMISSION_CHANGED',
}

export interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
}

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a notification for a user
   */
  async createNotification(userId: string, notificationData: NotificationData) {
    return this.prisma.notification.create({
      data: {
        userId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        data: notificationData.data || {},
      },
    });
  }

  /**
   * Create notifications for multiple users
   */
  async createBulkNotifications(userIds: string[], notificationData: NotificationData) {
    return Promise.all(userIds.map((userId) => this.createNotification(userId, notificationData)));
  }

  /**
   * Create a notification for all users with a specific role
   */
  async createNotificationForRole(roleId: string, notificationData: NotificationData) {
    // Get all users with the role
    const userRoles = await this.prisma.userRole.findMany({
      where: { roleId },
      select: { userId: true },
    });

    const userIds = userRoles.map((ur) => ur.userId);
    return this.createBulkNotifications(userIds, notificationData);
  }

  /**
   * Get unread notifications for a user
   */
  async getUnreadNotifications(userId: string, limit: number = 50) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        read: false,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get all notifications for a user
   */
  async getNotifications(userId: string, limit: number = 100, offset: number = 0) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await this.prisma.notification.count({ where: { userId } });

    return {
      notifications,
      total,
      limit,
      offset,
    };
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(notificationIds: string[]) {
    return this.prisma.notification.updateMany({
      where: { id: { in: notificationIds } },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string) {
    return this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  /**
   * Delete multiple notifications
   */
  async deleteMultipleNotifications(notificationIds: string[]) {
    return this.prisma.notification.deleteMany({
      where: { id: { in: notificationIds } },
    });
  }

  /**
   * Get notification count for a user
   */
  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  }

  /**
   * Notify collection created event
   */
  async notifyCollectionCreated(collectionName: string, userId: string) {
    return this.createNotification(userId, {
      type: NotificationType.COLLECTION_CREATED,
      title: 'Collection Created',
      message: `New collection "${collectionName}" has been created`,
      data: { collectionName },
    });
  }

  /**
   * Notify collection updated event
   */
  async notifyCollectionUpdated(collectionName: string, userId: string, changes: string) {
    return this.createNotification(userId, {
      type: NotificationType.COLLECTION_UPDATED,
      title: 'Collection Updated',
      message: `Collection "${collectionName}" has been updated: ${changes}`,
      data: { collectionName, changes },
    });
  }

  /**
   * Notify record created event
   */
  async notifyRecordCreated(
    collectionName: string,
    recordId: string,
    userId: string,
    recordTitle?: string,
  ) {
    return this.createNotification(userId, {
      type: NotificationType.RECORD_CREATED,
      title: 'Record Created',
      message: `New record ${recordTitle ? `"${recordTitle}" ` : ''}has been created in "${collectionName}"`,
      data: { collectionName, recordId, recordTitle },
    });
  }

  /**
   * Notify record updated event
   */
  async notifyRecordUpdated(
    collectionName: string,
    recordId: string,
    userId: string,
    changes: string,
    recordTitle?: string,
  ) {
    return this.createNotification(userId, {
      type: NotificationType.RECORD_UPDATED,
      title: 'Record Updated',
      message: `Record ${recordTitle ? `"${recordTitle}" ` : ''}in "${collectionName}" has been updated: ${changes}`,
      data: { collectionName, recordId, recordTitle, changes },
    });
  }

  /**
   * Notify record deleted event
   */
  async notifyRecordDeleted(collectionName: string, recordId: string, userId: string, recordTitle?: string) {
    return this.createNotification(userId, {
      type: NotificationType.RECORD_DELETED,
      title: 'Record Deleted',
      message: `Record ${recordTitle ? `"${recordTitle}" ` : ''}in "${collectionName}" has been deleted`,
      data: { collectionName, recordId, recordTitle },
    });
  }

  /**
   * Notify permission changed event
   */
  async notifyPermissionChanged(roleName: string, collectionName: string, action: string, userId: string) {
    return this.createNotification(userId, {
      type: NotificationType.PERMISSION_CHANGED,
      title: 'Permission Changed',
      message: `Permission for role "${roleName}" on collection "${collectionName}" has been changed to "${action}"`,
      data: { roleName, collectionName, action },
    });
  }
}
