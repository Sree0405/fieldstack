"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
let FilesService = class FilesService {
    constructor(prisma) {
        this.prisma = prisma;
        this.uploadDir = path.join(process.cwd(), 'uploads', 'files');
        this.assetBaseUrl = '/assets';
        this.ensureUploadDir();
    }
    async ensureUploadDir() {
        try {
            await fs.mkdir(this.uploadDir, { recursive: true });
        }
        catch (error) {
            console.error('Error creating upload directory:', error);
        }
    }
    /**
     * Upload a single file
     */
    async uploadFile(file, metadata) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        try {
            const fileId = (0, uuid_1.v4)();
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
        }
        catch (error) {
            console.error('File upload error:', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new common_1.BadRequestException(`File upload failed: ${message}`);
        }
    }
    /**
     * Upload multiple files
     */
    async uploadMultipleFiles(files) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No files provided');
        }
        const uploadPromises = files.map((file) => this.uploadFile(file));
        return Promise.all(uploadPromises);
    }
    /**
     * Get file by ID
     */
    async getFileById(fileId) {
        const file = await this.prisma.file.findUnique({
            where: { id: fileId },
        });
        if (!file) {
            throw new common_1.NotFoundException('File not found');
        }
        return file;
    }
    /**
     * Serve file content
     */
    async serveFile(fileId) {
        const file = await this.getFileById(fileId);
        try {
            const filePath = path.join(process.cwd(), file.path);
            const fileContent = await fs.readFile(filePath);
            return fileContent;
        }
        catch (error) {
            throw new common_1.NotFoundException('File not found on disk');
        }
    }
    /**
     * Delete file
     */
    async deleteFile(fileId) {
        const file = await this.getFileById(fileId);
        try {
            const filePath = path.join(process.cwd(), file.path);
            await fs.unlink(filePath);
            await this.prisma.file.delete({
                where: { id: fileId },
            });
            return { success: true, id: fileId };
        }
        catch (error) {
            console.error('File deletion error:', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new common_1.BadRequestException(`Failed to delete file: ${message}`);
        }
    }
    /**
     * Get all files
     */
    async getAllFiles(limit = 50, offset = 0) {
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
    getAssetUrl(fileId) {
        return `${this.assetBaseUrl}/${fileId}`;
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FilesService);
