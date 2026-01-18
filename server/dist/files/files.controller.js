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
exports.FilesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const files_service_1 = require("./files.service");
const multer_1 = require("multer");
let FilesController = class FilesController {
    constructor(filesService) {
        this.filesService = filesService;
    }
    /**
     * Upload a single file
     * POST /api/files
     */
    async uploadFile(file) {
        return this.filesService.uploadFile(file);
    }
    /**
     * Upload multiple files
     * POST /api/files/multiple
     */
    async uploadMultipleFiles(files) {
        return this.filesService.uploadMultipleFiles(files);
    }
    /**
     * Get all files (with pagination)
     * GET /api/files?limit=50&offset=0
     */
    async getAllFiles(limit = '50', offset = '0') {
        return this.filesService.getAllFiles(parseInt(limit), parseInt(offset));
    }
    /**
     * Get file metadata
     * GET /api/files/:id
     */
    async getFile(fileId) {
        return this.filesService.getFileById(fileId);
    }
    /**
     * Delete file
     * DELETE /api/files/:id
     */
    async deleteFile(fileId) {
        return this.filesService.deleteFile(fileId);
    }
};
exports.FilesController = FilesController;
__decorate([
    (0, common_1.Post)('files'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
        limits: {
            fileSize: 100 * 1024 * 1024, // 100MB
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Post)('files/multiple'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10, {
        storage: (0, multer_1.memoryStorage)(),
        limits: {
            fileSize: 100 * 1024 * 1024, // 100MB
        },
    })),
    __param(0, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "uploadMultipleFiles", null);
__decorate([
    (0, common_1.Get)('files'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getAllFiles", null);
__decorate([
    (0, common_1.Get)('files/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getFile", null);
__decorate([
    (0, common_1.Delete)('files/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "deleteFile", null);
exports.FilesController = FilesController = __decorate([
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [files_service_1.FilesService])
], FilesController);
