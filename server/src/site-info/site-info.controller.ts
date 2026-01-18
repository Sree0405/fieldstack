import { Controller, Get, Patch, Body, Param } from '@nestjs/common';
import { SiteInfoService } from './site-info.service';

@Controller('api/site-info')
export class SiteInfoController {
  constructor(private siteInfoService: SiteInfoService) {}

  /**
   * Get site info
   * GET /api/site-info
   */
  @Get()
  async getSiteInfo() {
    return this.siteInfoService.getOrCreateSiteInfo();
  }

  /**
   * Get site info by ID
   * GET /api/site-info/:id
   */
  @Get(':id')
  async getSiteInfoById(@Param('id') id: string) {
    return this.siteInfoService.getSiteInfoById(id);
  }

  /**
   * Update site details
   * PATCH /api/site-info
   */
  @Patch()
  async updateSiteDetails(
    @Body()
    data: {
      siteName?: string;
      siteTitle?: string;
      siteDescription?: string;
      siteUrl?: string;
      contactEmail?: string;
      contactPhone?: string;
      socialLinks?: any;
      metadata?: any;
    }
  ) {
    return this.siteInfoService.updateSiteDetails(data);
  }

  /**
   * Update full site info by ID
   * PATCH /api/site-info/:id
   */
  @Patch(':id')
  async updateSiteInfo(@Param('id') id: string, @Body() data: any) {
    return this.siteInfoService.updateSiteInfo(id, data);
  }
}
