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
exports.SiteInfoController = void 0;
const common_1 = require("@nestjs/common");
const site_info_service_1 = require("./site-info.service");
let SiteInfoController = class SiteInfoController {
    constructor(siteInfoService) {
        this.siteInfoService = siteInfoService;
    }
    /**
     * Get site info
     * GET /api/site-info
     */
    async getSiteInfo() {
        return this.siteInfoService.getOrCreateSiteInfo();
    }
    /**
     * Get site info by ID
     * GET /api/site-info/:id
     */
    async getSiteInfoById(id) {
        return this.siteInfoService.getSiteInfoById(id);
    }
    /**
     * Update site details
     * PATCH /api/site-info
     */
    async updateSiteDetails(data) {
        return this.siteInfoService.updateSiteDetails(data);
    }
    /**
     * Update full site info by ID
     * PATCH /api/site-info/:id
     */
    async updateSiteInfo(id, data) {
        return this.siteInfoService.updateSiteInfo(id, data);
    }
};
exports.SiteInfoController = SiteInfoController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SiteInfoController.prototype, "getSiteInfo", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SiteInfoController.prototype, "getSiteInfoById", null);
__decorate([
    (0, common_1.Patch)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SiteInfoController.prototype, "updateSiteDetails", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SiteInfoController.prototype, "updateSiteInfo", null);
exports.SiteInfoController = SiteInfoController = __decorate([
    (0, common_1.Controller)('api/site-info'),
    __metadata("design:paramtypes", [site_info_service_1.SiteInfoService])
], SiteInfoController);
