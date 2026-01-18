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
exports.RecordsController = void 0;
const common_1 = require("@nestjs/common");
const records_service_1 = require("./records.service");
let RecordsController = class RecordsController {
    constructor(recordsService) {
        this.recordsService = recordsService;
    }
    /**
     * Get all records from a collection table
     */
    async getRecords(collectionId, page = '1', limit = '25') {
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 25;
        if (pageNum < 1) {
            throw new common_1.BadRequestException('Page must be greater than 0');
        }
        if (limitNum < 1 || limitNum > 100) {
            throw new common_1.BadRequestException('Limit must be between 1 and 100');
        }
        return this.recordsService.getRecords(collectionId, pageNum, limitNum);
    }
    /**
     * Create a record in a collection table
     */
    async createRecord(collectionId, data) {
        if (!data || Object.keys(data).length === 0) {
            throw new common_1.BadRequestException('Record data is required');
        }
        return this.recordsService.createRecord(collectionId, data);
    }
    /**
     * Update a record in a collection table
     */
    async updateRecord(collectionId, recordId, data) {
        if (!data || Object.keys(data).length === 0) {
            throw new common_1.BadRequestException('Update data is required');
        }
        return this.recordsService.updateRecord(collectionId, recordId, data);
    }
    /**
     * Delete a record from a collection table
     */
    async deleteRecord(collectionId, recordId) {
        return this.recordsService.deleteRecord(collectionId, recordId);
    }
};
exports.RecordsController = RecordsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('collectionId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], RecordsController.prototype, "getRecords", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('collectionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RecordsController.prototype, "createRecord", null);
__decorate([
    (0, common_1.Patch)(':recordId'),
    __param(0, (0, common_1.Param)('collectionId')),
    __param(1, (0, common_1.Param)('recordId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], RecordsController.prototype, "updateRecord", null);
__decorate([
    (0, common_1.Delete)(':recordId'),
    __param(0, (0, common_1.Param)('collectionId')),
    __param(1, (0, common_1.Param)('recordId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RecordsController.prototype, "deleteRecord", null);
exports.RecordsController = RecordsController = __decorate([
    (0, common_1.Controller)('collections/:collectionId/records'),
    __metadata("design:paramtypes", [records_service_1.RecordsService])
], RecordsController);
