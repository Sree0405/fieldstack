"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = exports.NotificationType = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
var NotificationType;
(function (NotificationType) {
    NotificationType["INFO"] = "INFO";
    NotificationType["SUCCESS"] = "SUCCESS";
    NotificationType["WARNING"] = "WARNING";
    NotificationType["ERROR"] = "ERROR";
    NotificationType["COLLECTION_CREATED"] = "COLLECTION_CREATED";
    NotificationType["COLLECTION_UPDATED"] = "COLLECTION_UPDATED";
    NotificationType["RECORD_CREATED"] = "RECORD_CREATED";
    NotificationType["RECORD_UPDATED"] = "RECORD_UPDATED";
    NotificationType["RECORD_DELETED"] = "RECORD_DELETED";
    NotificationType["PERMISSION_CHANGED"] = "PERMISSION_CHANGED";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
let NotificationsService = class NotificationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Create a notification for a user
     */
    async createNotification(userId, notificationData) {
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
    async createBulkNotifications(userIds, notificationData) {
        return Promise.all(userIds.map((userId) => this.createNotification(userId, notificationData)));
    }
    /**
     * Create a notification for all users with a specific role
     */
    async createNotificationForRole(roleId, notificationData) {
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
    async getUnreadNotifications(userId, limit = 50) {
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
    async getNotifications(userId, limit = 100, offset = 0) {
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
    async markAsRead(notificationId) {
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
    async markMultipleAsRead(notificationIds) {
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
    async markAllAsRead(userId) {
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
    async deleteNotification(notificationId) {
        return this.prisma.notification.delete({
            where: { id: notificationId },
        });
    }
    /**
     * Delete multiple notifications
     */
    async deleteMultipleNotifications(notificationIds) {
        return this.prisma.notification.deleteMany({
            where: { id: { in: notificationIds } },
        });
    }
    /**
     * Get notification count for a user
     */
    async getUnreadCount(userId) {
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
    async notifyCollectionCreated(collectionName, userId) {
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
    async notifyCollectionUpdated(collectionName, userId, changes) {
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
    async notifyRecordCreated(collectionName, recordId, userId, recordTitle) {
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
    async notifyRecordUpdated(collectionName, recordId, userId, changes, recordTitle) {
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
    async notifyRecordDeleted(collectionName, recordId, userId, recordTitle) {
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
    async notifyPermissionChanged(roleName, collectionName, action, userId) {
        return this.createNotification(userId, {
            type: NotificationType.PERMISSION_CHANGED,
            title: 'Permission Changed',
            message: `Permission for role "${roleName}" on collection "${collectionName}" has been changed to "${action}"`,
            data: { roleName, collectionName, action },
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
