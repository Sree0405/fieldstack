import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { memoryStorage } from 'multer';
import { Response } from 'express';

@Controller()
export class FilesController {
  constructor(private filesService: FilesService) { }

  /**
   * Upload a single file
   * POST /api/files
   */
  @Post('files')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
      },
    })
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.filesService.uploadFile(file);
  }

  /**
   * Upload multiple files
   * POST /api/files/multiple
   */
  @Post('files/multiple')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
      },
    })
  )
  async uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]) {
    return this.filesService.uploadMultipleFiles(files);
  }

  /**
   * Get all files (with pagination)
   * GET /api/files?limit=50&offset=0
   */
  @Get('files')
  async getAllFiles(
    @Query('limit') limit: string = '50',
    @Query('offset') offset: string = '0'
  ) {
    return this.filesService.getAllFiles(parseInt(limit), parseInt(offset));
  }

  /**
   * Get file metadata
   * GET /api/files/:id
   */
  @Get('files/:id')
  async getFile(@Param('id') fileId: string) {
    return this.filesService.getFileById(fileId);
  }

  /**
   * Serve file content
   * GET /api/assets/:id
   */
  @Get('assets/:id')
  async serveFile(@Param('id') fileId: string, @Res({ passthrough: true }) res: Response) {
    const file = await this.filesService.getFileById(fileId);
    const stream = await this.filesService.getFileStream(fileId);

    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `inline; filename="${file.originalName}"`,
      'Content-Length': file.size.toString(),
    });

    return new StreamableFile(stream as any);
  }

  /**
   * Delete file
   * DELETE /api/files/:id
   */
  @Delete('files/:id')
  async deleteFile(@Param('id') fileId: string) {
    return this.filesService.deleteFile(fileId);
  }
}
