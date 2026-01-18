import { Controller, Get, Param, Res, NotFoundException, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { FilesService } from './files.service';

@Controller('assets')
export class AssetsController {
  constructor(private filesService: FilesService) {}

  /**
   * Serve file content
   * GET /assets/:id
   */
  @Get(':id')
  async serveFile(@Param('id') fileId: string, @Res() res: Response) {
    try {
      const file = await this.filesService.getFileById(fileId);
      const content = await this.filesService.serveFile(fileId);

      // Set proper headers
      res.setHeader('Content-Type', file.mimeType);
      res.setHeader('Content-Length', file.size);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache

      res.send(content);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        res.status(404).json({ message: 'File not found' });
      } else {
        res.status(500).json({ message: 'Error serving file' });
      }
    }
  }
}
