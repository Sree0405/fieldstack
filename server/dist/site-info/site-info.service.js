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
exports.SiteInfoService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SiteInfoService = class SiteInfoService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Get or create site info
     */
    async getOrCreateSiteInfo() {
        let siteInfo = await this.prisma.siteInfo.findFirst();
        if (!siteInfo) {
            siteInfo = await this.prisma.siteInfo.create({
                data: {
                    siteName: 'My Site',
                    siteTitle: 'Welcome',
                },
            });
        }
        return siteInfo;
    }
    /**
     * Get site info by ID
     */
    async getSiteInfoById(id) {
        const siteInfo = await this.prisma.siteInfo.findUnique({
            where: { id },
        });
        if (!siteInfo) {
            throw new common_1.NotFoundException('Site info not found');
        }
        return siteInfo;
    }
    /**
     * Update site info
     */
    async updateSiteInfo(id, data) {
        // Remove id field if present
        delete data.id;
        delete data.createdAt;
        const siteInfo = await this.prisma.siteInfo.update({
            where: { id },
            data,
        });
        return siteInfo;
    }
    /**
     * Update site name and details
     */
    async updateSiteDetails(data) {
        const siteInfo = await this.getOrCreateSiteInfo();
        return this.updateSiteInfo(siteInfo.id, data);
    }
    /**
     * Update site logo
     */
    async updateSiteLogo(logoId) {
        const siteInfo = await this.getOrCreateSiteInfo();
        return this.updateSiteInfo(siteInfo.id, { logoId });
    }
    /**
     * Update site favicon
     */
    async updateSiteFavicon(faviconId) {
        const siteInfo = await this.getOrCreateSiteInfo();
        return this.updateSiteInfo(siteInfo.id, { faviconId });
    }
    /**
     * Update social links
     */
    async updateSocialLinks(socialLinks) {
        const siteInfo = await this.getOrCreateSiteInfo();
        return this.updateSiteInfo(siteInfo.id, { socialLinks });
    }
};
exports.SiteInfoService = SiteInfoService;
exports.SiteInfoService = SiteInfoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SiteInfoService);
