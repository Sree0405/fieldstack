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
exports.CollectionsController = void 0;
const common_1 = require("@nestjs/common");
const collections_service_1 = require("./collections.service");
const field_validation_service_1 = require("./field-validation.service");
let CollectionsController = class CollectionsController {
    constructor(collectionsService, fieldValidation) {
        this.collectionsService = collectionsService;
        this.fieldValidation = fieldValidation;
    }
    /**
     * Get all collections
     */
    async findAll() {
        return this.collectionsService.findAll();
    }
    /**
     * Get a single collection by ID
     */
    async findOne(id) {
        return this.collectionsService.findOne(id);
    }
    /**
     * Create a new collection
     */
    async create(body, req) {
        return this.collectionsService.create({
            name: body.name,
            displayName: body.displayName,
            description: body.description,
            tableName: body.tableName || '',
        }, body.systemConfig, req.user?.id);
    }
    /**
     * Delete a collection
     */
    async delete(id, req) {
        return this.collectionsService.delete(id, req.user?.id);
    }
    /**
     * Add a field to a collection
     */
    async addField(collectionId, body) {
        if (!body.name) {
            throw new common_1.BadRequestException('Field name is required');
        }
        if (!body.type) {
            throw new common_1.BadRequestException('Field type is required');
        }
        return this.collectionsService.addField(collectionId, body.name, body.type, body.dbColumn, body.required || false, body.validationRules);
    }
    /**
     * Update a field in a collection
     */
    async updateField(collectionId, fieldId, updateData) {
        return this.collectionsService.updateField(collectionId, fieldId, updateData);
    }
    /**
     * Delete a field from a collection
     */
    async deleteField(collectionId, fieldId) {
        return this.collectionsService.deleteField(collectionId, fieldId);
    }
    /**
     * Validate a value against a field type
     */
    async validateValue(body) {
        return this.fieldValidation.validateValue(body.value, body.fieldType, body.validationRules);
    }
};
exports.CollectionsController = CollectionsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':collectionId/fields'),
    __param(0, (0, common_1.Param)('collectionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "addField", null);
__decorate([
    (0, common_1.Patch)(':collectionId/fields/:fieldId'),
    __param(0, (0, common_1.Param)('collectionId')),
    __param(1, (0, common_1.Param)('fieldId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "updateField", null);
__decorate([
    (0, common_1.Delete)(':collectionId/fields/:fieldId'),
    __param(0, (0, common_1.Param)('collectionId')),
    __param(1, (0, common_1.Param)('fieldId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "deleteField", null);
__decorate([
    (0, common_1.Post)('validate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "validateValue", null);
exports.CollectionsController = CollectionsController = __decorate([
    (0, common_1.Controller)('collections'),
    __metadata("design:paramtypes", [collections_service_1.CollectionsService,
        field_validation_service_1.FieldValidationService])
], CollectionsController);
