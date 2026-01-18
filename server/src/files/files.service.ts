import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';
import type { Express } from 'express';

@Injectable()
export class FilesService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'files');
  private readonly assetBaseUrl = '/assets';

  constructor(private prisma: PrismaService) {
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }
  }

  /**
   * Upload a single file
   */
  async uploadFile(
    file: Express.Multer.File,
    metadata?: { description?: string; tags?: string }
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      const fileId = randomUUID();
      const fileExtension = path.extname(file.originalname);
      const fileName = `${fileId}${fileExtension}`;
      const filePath = path.join(this.uploadDir, fileName);
      const relativeFilePath = path.join('uploads', 'files', fileName);

      // Save file to disk
      await fs.writeFile(filePath, file.buffer);

      // Save file record to database
      const fileRecord = await this.prisma.file.create({
        data: {
          id: fileId,
          fileName,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          path: relativeFilePath,
          url: `${this.assetBaseUrl}/${fileId}`,
        },
      });

      return {
        id: fileRecord.id,
        fileName: fileRecord.fileName,
        originalName: fileRecord.originalName,
        mimeType: fileRecord.mimeType,
        size: fileRecord.size,
        url: fileRecord.url,
        createdAt: fileRecord.createdAt,
      };
    } catch (error) {
      console.error('File upload error:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`File upload failed: ${message}`);
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploadPromises = files.map((file) => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }

  /**
   * Get file by ID
   */
  async getFileById(fileId: string) {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  /**
   * Serve file content
   */
  async serveFile(fileId: string): Promise<Buffer> {
    const file = await this.getFileById(fileId);

    try {
      const filePath = path.join(process.cwd(), file.path);
      const fileContent = await fs.readFile(filePath);
      return fileContent;
    } catch (error) {
      throw new NotFoundException('File not found on disk');
    }
  }

  /**
   * Delete file
   */
  async deleteFile(fileId: string) {
    const file = await this.getFileById(fileId);

    try {
      const filePath = path.join(process.cwd(), file.path);
      await fs.unlink(filePath);

      await this.prisma.file.delete({
        where: { id: fileId },
      });

      return { success: true, id: fileId };
    } catch (error) {
      console.error('File deletion error:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to delete file: ${message}`);
    }
  }

  /**
   * Get all files
   */
  async getAllFiles(limit: number = 50, offset: number = 0) {
    const [files, total] = await Promise.all([
      this.prisma.file.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.file.count(),
    ]);

    return {
      data: files,
      total,
      limit,
      offset,
    };
  }

  /**
   * Get asset URL for a file ID
   */
  getAssetUrl(fileId: string): string {
    return `${this.assetBaseUrl}/${fileId}`;
  }
}
