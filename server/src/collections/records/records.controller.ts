import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { RecordsService } from './records.service';

@Controller('collections/:collectionId/records')
export class RecordsController {
  constructor(private recordsService: RecordsService) {}

  /**
   * Get all records from a collection table
   */
  @Get()
  async getRecords(
    @Param('collectionId') collectionId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '25',
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 25;

    if (pageNum < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }
    if (limitNum < 1 || limitNum > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    return this.recordsService.getRecords(collectionId, pageNum, limitNum);
  }

  /**
   * Create a record in a collection table
   */
  @Post()
  async createRecord(
    @Param('collectionId') collectionId: string,
    @Body() data: any,
  ) {
    if (!data || Object.keys(data).length === 0) {
      throw new BadRequestException('Record data is required');
    }

    return this.recordsService.createRecord(collectionId, data);
  }

  /**
   * Update a record in a collection table
   */
  @Patch(':recordId')
  async updateRecord(
    @Param('collectionId') collectionId: string,
    @Param('recordId') recordId: string,
    @Body() data: any,
  ) {
    if (!data || Object.keys(data).length === 0) {
      throw new BadRequestException('Update data is required');
    }

    return this.recordsService.updateRecord(collectionId, recordId, data);
  }

  /**
   * Delete a record from a collection table
   */
  @Delete(':recordId')
  async deleteRecord(
    @Param('collectionId') collectionId: string,
    @Param('recordId') recordId: string,
  ) {
    return this.recordsService.deleteRecord(collectionId, recordId);
  }
}
