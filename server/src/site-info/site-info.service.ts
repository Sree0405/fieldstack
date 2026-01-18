import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SiteInfoService {
  constructor(private prisma: PrismaService) {}

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
  async getSiteInfoById(id: string) {
    const siteInfo = await this.prisma.siteInfo.findUnique({
      where: { id },
    });

    if (!siteInfo) {
      throw new NotFoundException('Site info not found');
    }

    return siteInfo;
  }

  /**
   * Update site info
   */
  async updateSiteInfo(id: string, data: any) {
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
  async updateSiteDetails(data: {
    siteName?: string;
    siteTitle?: string;
    siteDescription?: string;
    siteUrl?: string;
    contactEmail?: string;
    contactPhone?: string;
    socialLinks?: any;
    metadata?: any;
  }) {
    const siteInfo = await this.getOrCreateSiteInfo();
    return this.updateSiteInfo(siteInfo.id, data);
  }

  /**
   * Update site logo
   */
  async updateSiteLogo(logoId: string) {
    const siteInfo = await this.getOrCreateSiteInfo();
    return this.updateSiteInfo(siteInfo.id, { logoId });
  }

  /**
   * Update site favicon
   */
  async updateSiteFavicon(faviconId: string) {
    const siteInfo = await this.getOrCreateSiteInfo();
    return this.updateSiteInfo(siteInfo.id, { faviconId });
  }

  /**
   * Update social links
   */
  async updateSocialLinks(socialLinks: Record<string, string>) {
    const siteInfo = await this.getOrCreateSiteInfo();
    return this.updateSiteInfo(siteInfo.id, { socialLinks });
  }
}
