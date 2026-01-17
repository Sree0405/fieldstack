import { Controller, Get, Post, Patch, Delete, Param, Query, Body } from '@nestjs/common';
import { CrudService } from './crud.service';

@Controller('api')
export class CrudController {
  constructor(private crudService: CrudService) {}

  @Get(':collection')
  async list(
    @Param('collection') collection: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '25',
  ) {
    return this.crudService.list(collection, parseInt(page), parseInt(limit));
  }

  @Get(':collection/:id')
  async getOne(@Param('collection') collection: string, @Param('id') id: string) {
    return this.crudService.getOne(collection, id);
  }

  @Post(':collection')
  async create(@Param('collection') collection: string, @Body() data: any) {
    return this.crudService.create(collection, data);
  }

  @Patch(':collection/:id')
  async update(
    @Param('collection') collection: string,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.crudService.update(collection, id, data);
  }

  @Delete(':collection/:id')
  async delete(@Param('collection') collection: string, @Param('id') id: string) {
    return this.crudService.delete(collection, id);
  }
}
