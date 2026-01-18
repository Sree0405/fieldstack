import { PrismaService } from '../prisma/prisma.service';
export declare enum NotificationType {
    INFO = "INFO",
    SUCCESS = "SUCCESS",
    WARNING = "WARNING",
    ERROR = "ERROR",
    COLLECTION_CREATED = "COLLECTION_CREATED",
    COLLECTION_UPDATED = "COLLECTION_UPDATED",
    RECORD_CREATED = "RECORD_CREATED",
    RECORD_UPDATED = "RECORD_UPDATED",
    RECORD_DELETED = "RECORD_DELETED",
    PERMISSION_CHANGED = "PERMISSION_CHANGED"
}
export interface NotificationData {
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
}
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    /**
     * Create a notification for a user
     */
    createNotification(userId: string, notificationData: NotificationData): Promise<{
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        userId: string;
        message: string;
        read: boolean;
        readAt: Date | null;
    }>;
    /**
     * Create notifications for multiple users
     */
    createBulkNotifications(userIds: string[], notificationData: NotificationData): Promise<{
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        userId: string;
        message: string;
        read: boolean;
        readAt: Date | null;
    }[]>;
    /**
     * Create a notification for all users with a specific role
     */
    createNotificationForRole(roleId: string, notificationData: NotificationData): Promise<{
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        userId: string;
        message: string;
        read: boolean;
        readAt: Date | null;
    }[]>;
    /**
     * Get unread notifications for a user
     */
    getUnreadNotifications(userId: string, limit?: number): Promise<{
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        userId: string;
        message: string;
        read: boolean;
        readAt: Date | null;
    }[]>;
    /**
     * Get all notifications for a user
     */
    getNotifications(userId: string, limit?: number, offset?: number): Promise<{
        notifications: {
            id: string;
            createdAt: Date;
            data: import("@prisma/client/runtime/library").JsonValue | null;
            type: import(".prisma/client").$Enums.NotificationType;
            title: string;
            userId: string;
            message: string;
            read: boolean;
            readAt: Date | null;
        }[];
        total: number;
        limit: number;
        offset: number;
    }>;
    /**
     * Mark a notification as read
     */
    markAsRead(notificationId: string): Promise<{
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        userId: string;
        message: string;
        read: boolean;
        readAt: Date | null;
    }>;
    /**
     * Mark multiple notifications as read
     */
    markMultipleAsRead(notificationIds: string[]): Promise<import(".prisma/client").Prisma.BatchPayload>;
    /**
     * Mark all notifications as read for a user
     */
    markAllAsRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    /**
     * Delete a notification
     */
    deleteNotification(notificationId: string): Promise<{
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        userId: string;
        message: string;
        read: boolean;
        readAt: Date | null;
    }>;
    /**
     * Delete multiple notifications
     */
    deleteMultipleNotifications(notificationIds: string[]): Promise<import(".prisma/client").Prisma.BatchPayload>;
    /**
     * Get notification count for a user
     */
    getUnreadCount(userId: string): Promise<number>;
    /**
     * Notify collection created event
     */
    notifyCollectionCreated(collectionName: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        userId: string;
        message: string;
        read: boolean;
        readAt: Date | null;
    }>;
    /**
     * Notify collection updated event
     */
    notifyCollectionUpdated(collectionName: string, userId: string, changes: string): Promise<{
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        userId: string;
        message: string;
        read: boolean;
        readAt: Date | null;
    }>;
    /**
     * Notify record created event
     */
    notifyRecordCreated(collectionName: string, recordId: string, userId: string, recordTitle?: string): Promise<{
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        userId: string;
        message: string;
        read: boolean;
        readAt: Date | null;
    }>;
    /**
     * Notify record updated event
     */
    notifyRecordUpdated(collectionName: string, recordId: string, userId: string, changes: string, recordTitle?: string): Promise<{
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        userId: string;
        message: string;
        read: boolean;
        readAt: Date | null;
    }>;
    /**
     * Notify record deleted event
     */
    notifyRecordDeleted(collectionName: string, recordId: string, userId: string, recordTitle?: string): Promise<{
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        userId: string;
        message: string;
        read: boolean;
        readAt: Date | null;
    }>;
    /**
     * Notify permission changed event
     */
    notifyPermissionChanged(roleName: string, collectionName: string, action: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        userId: string;
        message: string;
        read: boolean;
        readAt: Date | null;
    }>;
}
//# sourceMappingURL=notifications.service.d.ts.map