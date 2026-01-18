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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const notifications_service_1 = require("./notifications.service");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
let NotificationsController = class NotificationsController {
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    /**
     * Get user's notifications with pagination
     */
    async getNotifications(req, limit = '100', offset = '0') {
        return this.notificationsService.getNotifications(req.user.id, parseInt(limit), parseInt(offset));
    }
    /**
     * Get unread notifications
     */
    async getUnreadNotifications(req, limit = '50') {
        const notifications = await this.notificationsService.getUnreadNotifications(req.user.id, parseInt(limit));
        const count = await this.notificationsService.getUnreadCount(req.user.id);
        return {
            notifications,
            unreadCount: count,
        };
    }
    /**
     * Get unread notification count
     */
    async getUnreadCount(req) {
        const count = await this.notificationsService.getUnreadCount(req.user.id);
        return { unreadCount: count };
    }
    /**
     * Get a single notification
     */
    async getNotification(id, req) {
        const notification = await this.notificationsService.getNotifications(req.user.id, 1, 0);
        const found = notification.notifications.find((n) => n.id === id);
        if (!found) {
            return { error: 'Notification not found', statusCode: 404 };
        }
        return found;
    }
    /**
     * Mark a notification as read
     */
    async markAsRead(id) {
        return this.notificationsService.markAsRead(id);
    }
    /**
     * Mark multiple notifications as read
     */
    async markMultipleAsRead(body) {
        return this.notificationsService.markMultipleAsRead(body.notificationIds);
    }
    /**
     * Mark all notifications as read
     */
    async markAllAsRead(req) {
        return this.notificationsService.markAllAsRead(req.user.id);
    }
    /**
     * Delete a notification
     */
    async deleteNotification(id) {
        await this.notificationsService.deleteNotification(id);
        return { success: true, message: 'Notification deleted' };
    }
    /**
     * Delete multiple notifications
     */
    async deleteMultipleNotifications(body) {
        await this.notificationsService.deleteMultipleNotifications(body.notificationIds);
        return { success: true, message: 'Notifications deleted' };
    }
    /**
     * Clear all notifications for a user (with soft-delete approach: mark all as deleted)
     */
    async clearAllNotifications(req) {
        const { notifications } = await this.notificationsService.getNotifications(req.user.id, 10000, 0);
        const notificationIds = notifications.map((n) => n.id);
        if (notificationIds.length === 0) {
            return { success: true, message: 'No notifications to clear' };
        }
        await this.notificationsService.deleteMultipleNotifications(notificationIds);
        return { success: true, message: `${notificationIds.length} notifications cleared` };
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Get)('unread'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getUnreadNotifications", null);
__decorate([
    (0, common_1.Get)('unread/count'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getNotification", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Patch)('read/bulk'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markMultipleAsRead", null);
__decorate([
    (0, common_1.Patch)('read/all'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAllAsRead", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "deleteNotification", null);
__decorate([
    (0, common_1.Delete)('bulk'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "deleteMultipleNotifications", null);
__decorate([
    (0, common_1.Delete)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "clearAllNotifications", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], NotificationsController);
