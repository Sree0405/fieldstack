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
exports.AssetsController = void 0;
const common_1 = require("@nestjs/common");
const files_service_1 = require("./files.service");
let AssetsController = class AssetsController {
    constructor(filesService) {
        this.filesService = filesService;
    }
    /**
     * Serve file content
     * GET /assets/:id
     */
    async serveFile(fileId, res) {
        try {
            const file = await this.filesService.getFileById(fileId);
            const content = await this.filesService.serveFile(fileId);
            // Set proper headers
            res.setHeader('Content-Type', file.mimeType);
            res.setHeader('Content-Length', file.size);
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
            res.send(content);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                res.status(404).json({ message: 'File not found' });
            }
            else {
                res.status(500).json({ message: 'Error serving file' });
            }
        }
    }
};
exports.AssetsController = AssetsController;
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "serveFile", null);
exports.AssetsController = AssetsController = __decorate([
    (0, common_1.Controller)('assets'),
    __metadata("design:paramtypes", [files_service_1.FilesService])
], AssetsController);
