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
exports.SystemController = void 0;
const common_1 = require("@nestjs/common");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const system_service_1 = require("./system.service");
const site_info_service_1 = require("../site-info/site-info.service");
// DTOs
class CreateFieldDto {
}
class UpdateCollectionSchemaDto {
}
let SystemController = class SystemController {
    constructor(systemService, siteInfoService) {
        this.systemService = systemService;
        this.siteInfoService = siteInfoService;
    }
    async getEndpoints() {
        return this.systemService.getEndpoints();
    }
    async getSettings() {
        return this.siteInfoService.getOrCreateSiteInfo();
    }
    async updateSettings(data) {
        return this.siteInfoService.updateSiteDetails(data);
    }
    async addFieldToCollection(collectionId, createFieldDto) {
        return this.systemService.addFieldToCollection(collectionId, createFieldDto);
    }
    async updateCollectionSchema(collectionId, updateDto) {
        return this.systemService.updateCollectionSchema(collectionId, updateDto);
    }
    async getCollectionSchema(collectionId) {
        return this.systemService.getCollectionSchema(collectionId);
    }
    async getMetrics() {
        return this.systemService.getMetrics();
    }
};
exports.SystemController = SystemController;
__decorate([
    (0, common_1.Get)('endpoints'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "getEndpoints", null);
__decorate([
    (0, common_1.Get)('settings'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Patch)('settings'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.Post)('collections/:collectionId/fields'),
    __param(0, (0, common_1.Param)('collectionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreateFieldDto]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "addFieldToCollection", null);
__decorate([
    (0, common_1.Patch)('collections/:collectionId'),
    __param(0, (0, common_1.Param)('collectionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateCollectionSchemaDto]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "updateCollectionSchema", null);
__decorate([
    (0, common_1.Get)('collections/:collectionId/schema'),
    __param(0, (0, common_1.Param)('collectionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "getCollectionSchema", null);
__decorate([
    (0, common_1.Get)('metrics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "getMetrics", null);
exports.SystemController = SystemController = __decorate([
    (0, common_1.Controller)('system'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [system_service_1.SystemService,
        site_info_service_1.SiteInfoService])
], SystemController);
