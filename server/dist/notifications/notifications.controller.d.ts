import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
    /**
     * Get user's notifications with pagination
     */
    getNotifications(req: any, limit?: string, offset?: string): Promise<{
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
     * Get unread notifications
     */
    getUnreadNotifications(req: any, limit?: string): Promise<{
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
        unreadCount: number;
    }>;
    /**
     * Get unread notification count
     */
    getUnreadCount(req: any): Promise<{
        unreadCount: number;
    }>;
    /**
     * Get a single notification
     */
    getNotification(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        userId: string;
        message: string;
        read: boolean;
        readAt: Date | null;
    } | {
        error: string;
        statusCode: number;
    }>;
    /**
     * Mark a notification as read
     */
    markAsRead(id: string): Promise<{
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
    markMultipleAsRead(body: {
        notificationIds: string[];
    }): Promise<import(".prisma/client").Prisma.BatchPayload>;
    /**
     * Mark all notifications as read
     */
    markAllAsRead(req: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    /**
     * Delete a notification
     */
    deleteNotification(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Delete multiple notifications
     */
    deleteMultipleNotifications(body: {
        notificationIds: string[];
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Clear all notifications for a user (with soft-delete approach: mark all as deleted)
     */
    clearAllNotifications(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=notifications.controller.d.ts.map