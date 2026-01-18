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
exports.CrudController = void 0;
const common_1 = require("@nestjs/common");
const crud_service_1 = require("./crud.service");
let CrudController = class CrudController {
    constructor(crudService) {
        this.crudService = crudService;
    }
    async list(collection, page = '1', limit = '25') {
        return this.crudService.list(collection, parseInt(page), parseInt(limit));
    }
    async getOne(collection, id) {
        return this.crudService.getOne(collection, id);
    }
    async create(collection, data) {
        return this.crudService.create(collection, data);
    }
    async update(collection, id, data) {
        return this.crudService.update(collection, id, data);
    }
    async delete(collection, id) {
        return this.crudService.delete(collection, id);
    }
};
exports.CrudController = CrudController;
__decorate([
    (0, common_1.Get)(':collection'),
    __param(0, (0, common_1.Param)('collection')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CrudController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':collection/:id'),
    __param(0, (0, common_1.Param)('collection')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CrudController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)(':collection'),
    __param(0, (0, common_1.Param)('collection')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CrudController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':collection/:id'),
    __param(0, (0, common_1.Param)('collection')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CrudController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':collection/:id'),
    __param(0, (0, common_1.Param)('collection')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CrudController.prototype, "delete", null);
exports.CrudController = CrudController = __decorate([
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [crud_service_1.CrudService])
], CrudController);
